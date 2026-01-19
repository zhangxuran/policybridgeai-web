import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// 从环境变量读取Stripe可发布密钥
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

if (!stripePublishableKey || stripePublishableKey === 'pk_test_your_publishable_key_here') {
  console.warn(
    '⚠️ Stripe publishable key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in .env.local\n' +
    'Visit https://dashboard.stripe.com/apikeys to get your key.'
  );
}

// 初始化Stripe实例
export const stripePromise: Promise<Stripe | null> = stripePublishableKey && 
  stripePublishableKey !== 'pk_test_your_publishable_key_here'
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

/**
 * 创建Stripe Checkout会话
 */
export interface CheckoutSessionData {
  orderId: string;
  amount: number;
  packageName: string;
  orderNumber: string;
  packageType?: string; // 新增: 套餐类型
  currency?: string; // 货币类型
  language?: string; // 用户语言
}

export async function createCheckoutSession(orderData: CheckoutSessionData): Promise<{ id: string; url: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error('Supabase配置缺失,请检查环境变量');
  }

  // 获取当前用户的 session token
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('Failed to get session:', sessionError);
    throw new Error('用户未登录或会话已过期，请重新登录');
  }

  const requestPayload = {
    orderId: orderData.orderId,
    amount: orderData.amount,
    packageName: orderData.packageName,
    orderNumber: orderData.orderNumber,
    packageType: orderData.packageType, // 传递套餐类型
    currency: orderData.currency || 'CNY',
    language: orderData.language || 'zh',
    successUrl: `${window.location.origin}/payment/success?order_id=${orderData.orderId}`,
    cancelUrl: `${window.location.origin}/payment/cancel?order_id=${orderData.orderId}`,
  };

  console.log('=== Creating Checkout Session ===');
  console.log('Request payload:', requestPayload);
  console.log('Package type:', orderData.packageType);
  console.log('Amount from order:', orderData.amount);
  console.log('Currency:', orderData.currency || 'CNY');
  console.log('User session token:', session.access_token ? 'Present' : 'Missing');
  console.log('Expected Stripe amount (cents):', Math.round(orderData.amount * 100));
  console.log('================================');

  const response = await fetch(
    `${supabaseUrl}/functions/v1/create-checkout-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`, // 使用用户的 session token
      },
      body: JSON.stringify(requestPayload),
    }
  );

  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);

  if (!response.ok) {
    const error = await response.json();
    console.error('Error response:', error);
    throw new Error(error.error || '创建支付会话失败');
  }

  const data = await response.json();
  console.log('Response data:', data);
  
  // 支持两种格式: { id, url } 或 { sessionId, url }
  const sessionId = data.id || data.sessionId;
  const sessionUrl = data.url;

  if (!sessionId) {
    console.error('Missing id/sessionId in response:', data);
    throw new Error(
      `后端返回数据格式错误: 缺少 id 或 sessionId 字段。\n\n` +
      `返回数据: ${JSON.stringify(data)}\n\n` +
      `请确保已部署最新版本的 Edge Function。`
    );
  }

  if (!sessionUrl) {
    console.error('Missing url in response:', data);
    throw new Error(
      `⚠️ 后端配置需要更新\n\n` +
      `当前后端返回的数据缺少 'url' 字段,这是支付跳转所必需的。\n\n` +
      `解决方案:\n` +
      `1. 确保 Edge Function 代码已更新(返回 { id: session.id, url: session.url })\n` +
      `2. 部署更新后的 Edge Function:\n` +
      `   supabase functions deploy create-checkout-session\n\n` +
      `Edge Function 文件位置:\n` +
      `/workspace/shadcn-ui/supabase/functions/create-checkout-session/index.ts\n\n` +
      `返回的数据: ${JSON.stringify(data)}`
    );
  }

  console.log('Extracted session:', { id: sessionId, url: sessionUrl });
  return { id: sessionId, url: sessionUrl };
}

/**
 * 检查Stripe是否已配置
 */
export async function isStripeConfigured(): Promise<boolean> {
  const stripe = await stripePromise;
  return stripe !== null;
}