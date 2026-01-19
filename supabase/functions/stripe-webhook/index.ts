import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// 手动验证 Stripe webhook 签名
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const parts = signature.split(',');
    
    let timestamp = '';
    let signatures: string[] = [];
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        signatures.push(value);
      }
    }
    
    if (!timestamp || signatures.length === 0) {
      return false;
    }
    
    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );
    
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signatures.includes(expectedSignature);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Webhook configuration error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    const body = await req.text();
    
    // 使用手动验证替代 Stripe SDK 的验证
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    
    if (!isValid) {
      console.error('Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const event = JSON.parse(body) as Stripe.Event;
    console.log('✅ Webhook signature verified:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.payment_status === 'paid') {
        const orderId = session.metadata?.order_id;
        
        if (!orderId) {
          return new Response(
            JSON.stringify({ error: 'Order ID missing' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
          return new Response(
            JSON.stringify({ error: 'Database configuration error' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. 先查询订单信息
        const { data: orderData, error: orderFetchError } = await supabase
          .from('app_fdc7c677a7_orders')
          .select('user_id, package_type, validity_period, contracts_count, bonus_contracts')
          .eq('order_id', orderId)
          .single();

        if (orderFetchError || !orderData) {
          console.error('Failed to fetch order:', orderFetchError);
          return new Response(
            JSON.stringify({ error: 'Order not found', details: orderFetchError?.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }

        console.log('📦 Order data:', orderData);

        // 2. 更新订单状态
        const { error: orderUpdateError } = await supabase
          .from('app_fdc7c677a7_orders')
          .update({
            order_status: 'paid',
            stripe_payment_intent: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);

        if (orderUpdateError) {
          console.error('Database update failed:', orderUpdateError);
          return new Response(
            JSON.stringify({ error: 'Database update failed', details: orderUpdateError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        console.log('✅ Order updated successfully');

        // 3. 创建用户订阅记录（使用实际的字段名）
        const activatedAt = new Date();
        let expiresAt: Date;
        
        // 如果 validity_period > 0，计算结束日期；否则设置为 100 年后（终身）
        if (orderData.validity_period > 0) {
          expiresAt = new Date(activatedAt);
          expiresAt.setDate(expiresAt.getDate() + orderData.validity_period);
        } else {
          // 终身订阅：设置为 100 年后
          expiresAt = new Date(activatedAt);
          expiresAt.setFullYear(expiresAt.getFullYear() + 100);
        }

        // 计算合约数量
        const totalContracts = orderData.contracts_count + (orderData.bonus_contracts || 0);

        const subscriptionData = {
          user_id: orderData.user_id,
          order_id: orderId,
          package_type: orderData.package_type,
          total_contracts: totalContracts,
          used_contracts: 0,
          remaining_contracts: totalContracts,
          is_active: true,
          activated_at: activatedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        };

        console.log('📝 Creating subscription:', subscriptionData);

        const { error: subscriptionError } = await supabase
          .from('app_fdc7c677a7_user_subscriptions')
          .insert(subscriptionData);

        if (subscriptionError) {
          console.error('Failed to create subscription:', subscriptionError);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to create subscription', 
              details: subscriptionError.message,
              orderUpdated: true 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        console.log('✅ Subscription created successfully');

        return new Response(
          JSON.stringify({ 
            received: true, 
            orderId, 
            status: 'paid',
            subscriptionCreated: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});