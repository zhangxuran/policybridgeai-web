import { serve } from 'https://deno.land/std@0.177.1/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 价格映射表：根据套餐类型和货币返回正确的价格
const PRICE_MAP: Record<string, { CNY: number; EUR: number }> = {
  'professional': { CNY: 59, EUR: 9.9 },
  'weekly': { CNY: 59, EUR: 9.9 },
  'monthly': { CNY: 199, EUR: 35 },
  'yearly': { CNY: 2199, EUR: 399 },
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

    const { orderId, amount, packageName, orderNumber, currency, language, packageType, successUrl, cancelUrl, paymentMethods = ['card', 'alipay'] } = await req.json();

    console.log('=== Received Payment Request ===');
    console.log('Order ID:', orderId);
    console.log('Package name:', packageName);
    console.log('Package type:', packageType);
    console.log('Original amount:', amount);
    console.log('Currency:', currency);
    console.log('Language:', language);
    console.log('Payment methods:', paymentMethods);

    // 确定货币代码
    const currencyCode = (currency || 'cny').toLowerCase();
    const currencyUpper = currencyCode.toUpperCase() as 'CNY' | 'EUR';

    // 确定套餐类型
    const effectivePackageType = packageType || inferPackageType(packageName);

    // 从价格映射表获取价格
    const priceData = PRICE_MAP[effectivePackageType] || PRICE_MAP['professional'];
    const finalAmount = priceData[currencyUpper] || amount;

    const packageNameStr = packageName || `${effectivePackageType} Package`;

    console.log('Final amount to charge:', finalAmount, currencyUpper);
    console.log('Unit amount (cents):', Math.round(finalAmount * 100));

    // 调用 Stripe API 创建 Checkout 会话
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    // 使用 Stripe REST API 而不是 SDK，以避免 Deno 兼容性问题
    const checkoutSessionPayload = {
      payment_method_types: paymentMethods,
      line_items: [
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: packageNameStr,
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
        payment_methods: paymentMethods.join(','),
      },
    };

    console.log('=== Creating Stripe Checkout Session ===');
    console.log('Payload:', JSON.stringify(checkoutSessionPayload, null, 2));

    // 调用 Stripe API
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
        Object.entries(checkoutSessionPayload).reduce((acc, [key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v, i) => {
              acc[`${key}[${i}]`] = String(v);
            });
          } else if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([k, v]) => {
              acc[`${key}[${k}]`] = String(v);
            });
          } else {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString(),
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error('Stripe API error:', stripeResponse.status, errorText);
      throw new Error(`Stripe API error: ${stripeResponse.status} ${errorText}`);
    }

    const session = await stripeResponse.json();

    console.log('✅ Checkout session created:', session.id);
    console.log('Payment URL:', session.url);

    return new Response(
      JSON.stringify({
        id: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
