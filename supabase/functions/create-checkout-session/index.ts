import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICE_MAP: Record<string, { CNY: number; EUR: number }> = {
  'professional': { CNY: 49, EUR: 9.9 },
  'weekly': { CNY: 49, EUR: 9.9 },
  'monthly': { CNY: 299, EUR: 39.9 },
  'yearly': { CNY: 2499, EUR: 329 },
};

function inferPackageType(packageName: string): string {
  const lowerName = packageName.toLowerCase();
  if (lowerName.includes('professional') || lowerName.includes('周会员') || lowerName.includes('week')) {
    return 'professional';
  }
  if (lowerName.includes('monthly') || lowerName.includes('月会员') || lowerName.includes('month')) {
    return 'monthly';
  }
  if (lowerName.includes('yearly') || lowerName.includes('年会员') || lowerName.includes('year')) {
    return 'yearly';
  }
  return 'professional';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Edge Function Started ===');
    
    const { orderId, amount, packageName, orderNumber, currency, language, packageType, successUrl, cancelUrl } = await req.json();
    
    console.log('Request data:', { orderId, amount, packageName, orderNumber, currency, language, packageType });

    const currencyCode = (currency || 'cny').toLowerCase();
    const currencyUpper = currencyCode.toUpperCase() as 'CNY' | 'EUR';

    const effectivePackageType = packageType || inferPackageType(packageName);
    
    let finalAmount = amount;
    
    if (PRICE_MAP[effectivePackageType]) {
      const correctAmount = PRICE_MAP[effectivePackageType][currencyUpper];
      if (correctAmount) {
        finalAmount = correctAmount;
        console.log(`Price corrected: ${amount} -> ${finalAmount} ${currencyUpper}`);
      }
    }

    console.log('Creating Stripe session with amount:', finalAmount, currencyCode);

    const stripePayload = new URLSearchParams();
    stripePayload.append('payment_method_types[]', 'card');
    stripePayload.append('payment_method_types[]', 'alipay');
    stripePayload.append('line_items[0][price_data][currency]', currencyCode);
    stripePayload.append('line_items[0][price_data][product_data][name]', packageName);
    stripePayload.append('line_items[0][price_data][product_data][description]', `订单号: ${orderNumber}`);
    stripePayload.append('line_items[0][price_data][unit_amount]', Math.round(finalAmount * 100).toString());
    stripePayload.append('line_items[0][quantity]', '1');
    stripePayload.append('mode', 'payment');
    stripePayload.append('success_url', successUrl);
    stripePayload.append('cancel_url', cancelUrl);
    stripePayload.append('metadata[order_id]', orderId);
    stripePayload.append('metadata[order_number]', orderNumber);
    stripePayload.append('metadata[currency]', currencyCode);
    stripePayload.append('metadata[language]', language || 'zh');
    stripePayload.append('metadata[original_amount]', amount.toString());
    stripePayload.append('metadata[final_amount]', finalAmount.toString());

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripePayload.toString(),
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error('Stripe API error:', errorText);
      throw new Error(`Stripe API error: ${stripeResponse.status} - ${errorText}`);
    }

    const session = await stripeResponse.json();
    console.log('Stripe session created:', session.id);

    if (!session.url) {
      console.error('No URL in Stripe response:', session);
      throw new Error('Stripe 未返回支付链接');
    }

    console.log('=== Edge Function Success ===');

    return new Response(
      JSON.stringify({ 
        id: session.id,
        url: session.url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('=== Edge Function Error ===');
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
