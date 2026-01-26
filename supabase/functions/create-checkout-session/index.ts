'''
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, amount, packageName, orderNumber, currency, language, packageType, successUrl, cancelUrl } = await req.json();

    const currencyCode = (currency || 'cny').toLowerCase();
    const currencyUpper = currencyCode.toUpperCase() as 'CNY' | 'EUR';

    const effectivePackageType = packageType || inferPackageType(packageName);
    
    let finalAmount = amount;
    
    if (PRICE_MAP[effectivePackageType]) {
      const correctAmount = PRICE_MAP[effectivePackageType][currencyUpper];
      if (correctAmount) {
        finalAmount = correctAmount;
      }
    }

    const stripePayload = new URLSearchParams({
      'payment_method_types[]': ['card', 'alipay'],
      'line_items[0][price_data][currency]': currencyCode,
      'line_items[0][price_data][product_data][name]': packageName,
      'line_items[0][price_data][product_data][description]': `订单号: ${orderNumber}`,
      'line_items[0][price_data][unit_amount]': Math.round(finalAmount * 100),
      'line_items[0][quantity]': 1,
      'mode': 'payment',
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      'metadata[order_id]': orderId,
      'metadata[order_number]': orderNumber,
      'metadata[currency]': currencyCode,
      'metadata[language]': language || 'zh',
      'metadata[original_amount]': amount.toString(),
      'metadata[final_amount]': finalAmount.toString(),
    });

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripePayload.toString(),
    });

    const session = await stripeResponse.json();

    if (!session.url) {
      throw new Error('Stripe 未返回支付链接');
    }

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
'''))oxia/home/ubuntu/policybridgeai-web/supabase/functions/create-checkout-session/index.ts", "text": "import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, amount, packageName, orderNumber, currency, language, packageType, successUrl, cancelUrl } = await req.json();

    const currencyCode = (currency || 'cny').toLowerCase();
    const currencyUpper = currencyCode.toUpperCase() as 'CNY' | 'EUR';

    const effectivePackageType = packageType || inferPackageType(packageName);
    
    let finalAmount = amount;
    
    if (PRICE_MAP[effectivePackageType]) {
      const correctAmount = PRICE_MAP[effectivePackageType][currencyUpper];
      if (correctAmount) {
        finalAmount = correctAmount;
      }
    }

    const stripePayload = new URLSearchParams({
      'payment_method_types[]': ['card', 'alipay'],
      'line_items[0][price_data][currency]': currencyCode,
      'line_items[0][price_data][product_data][name]': packageName,
      'line_items[0][price_data][product_data][description]': `订单号: ${orderNumber}`,
      'line_items[0][price_data][unit_amount]': Math.round(finalAmount * 100),
      'line_items[0][quantity]': 1,
      'mode': 'payment',
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      'metadata[order_id]': orderId,
      'metadata[order_number]': orderNumber,
      'metadata[currency]': currencyCode,
      'metadata[language]': language || 'zh',
      'metadata[original_amount]': amount.toString(),
      'metadata[final_amount]': finalAmount.toString(),
    });

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripePayload.toString(),
    });

    const session = await stripeResponse.json();

    if (!session.url) {
      throw new Error('Stripe 未返回支付链接');
    }

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
"}))oxia/home/ubuntu/policybridgeai-web/supabase/functions/create-checkout-session/index.ts", "text": "import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, amount, packageName, orderNumber, currency, language, packageType, successUrl, cancelUrl } = await req.json();

    const currencyCode = (currency || 'cny').toLowerCase();
    const currencyUpper = currencyCode.toUpperCase() as 'CNY' | 'EUR';

    const effectivePackageType = packageType || inferPackageType(packageName);
    
    let finalAmount = amount;
    
    if (PRICE_MAP[effectivePackageType]) {
      const correctAmount = PRICE_MAP[effectivePackageType][currencyUpper];
      if (correctAmount) {
        finalAmount = correctAmount;
      }
    }

    const stripePayload = new URLSearchParams({
      'payment_method_types[]': ['card', 'alipay'],
      'line_items[0][price_data][currency]': currencyCode,
      'line_items[0][price_data][product_data][name]': packageName,
      'line_items[0][price_data][product_data][description]': `订单号: ${orderNumber}`,
      'line_items[0][price_data][unit_amount]': Math.round(finalAmount * 100),
      'line_items[0][quantity]': 1,
      'mode': 'payment',
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      'metadata[order_id]': orderId,
      'metadata[order_number]': orderNumber,
      'metadata[currency]': currencyCode,
      'metadata[language]': language || 'zh',
      'metadata[original_amount]': amount.toString(),
      'metadata[final_amount]': finalAmount.toString(),
    });

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripePayload.toString(),
    });

    const session = await stripeResponse.json();

    if (!session.url) {
      throw new Error('Stripe 未返回支付链接');
    }

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
"}))" action="write", path="/home/ubuntu/policybridgeai-web/supabase/functions/create-checkout-session/index.ts", text=
