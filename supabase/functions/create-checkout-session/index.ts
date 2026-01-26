import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 价格映射表：根据套餐类型和货币返回正确的价格
const PRICE_MAP: Record<string, { CNY: number; EUR: number }> = {
  'professional': { CNY: 59, EUR: 9.9 },
  'weekly': { CNY: 59, EUR: 9.9 },
  'monthly': { CNY: 199, EUR: 39.9 },
  'yearly': { CNY: 2199, EUR: 329 },
};

// 从套餐名称推断套餐类型
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
    console.log('=== Incoming Request ===');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    const { orderId, amount, packageName, orderNumber, currency, language, packageType, successUrl, cancelUrl, paymentMethods = ['card'] } = await req.json();

    console.log('=== Received Payment Request ===');
    console.log('Order ID:', orderId);
    console.log('Package name:', packageName);
    console.log('Package type:', packageType);
    console.log('Original amount:', amount);
    console.log('Currency:', currency);
    console.log('Language:', language);

    // 确定货币代码
    const currencyCode = (currency || 'cny').toLowerCase();
    const currencyUpper = currencyCode.toUpperCase() as 'CNY' | 'EUR';

    // 推断套餐类型
    const effectivePackageType = packageType || inferPackageType(packageName);
    
    // 根据套餐类型和货币获取正确的价格
    let finalAmount = amount;
    
    if (PRICE_MAP[effectivePackageType]) {
      const correctAmount = PRICE_MAP[effectivePackageType][currencyUpper];
      if (correctAmount) {
        finalAmount = correctAmount;
        console.log('✅ Price recalculated:', finalAmount, currencyUpper);
      }
    }

    console.log('Final amount to charge:', finalAmount, currencyUpper);
    console.log('Unit amount (cents):', Math.round(finalAmount * 100));

    console.log('Payment methods:', paymentMethods);

    // 创建 Stripe Checkout 会话
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      line_items: [
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: packageName,
              description: `订单号: ${orderNumber}`,
            },
            unit_amount: Math.round(finalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        currency: currencyCode,
        language: language || 'zh',
        original_amount: amount.toString(),
        final_amount: finalAmount.toString(),
      },
    });

    if (!session.url) {
      throw new Error('Stripe 未返回支付链接');
    }

    console.log('✅ Checkout session created:', session.id);
    console.log('Payment URL:', session.url);
    console.log('================================');

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
    console.error('❌ Error creating checkout session:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
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