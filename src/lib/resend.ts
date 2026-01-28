// Resend API helper for sending OTP emails via Supabase Edge Function
import { supabase } from './supabase';

interface SendOTPEmailParams {
  email: string;
  token: string;
}

export async function sendOTPEmail({ email, token }: SendOTPEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Call Supabase Edge Function to send OTP email
    const { data, error } = await supabase.functions.invoke('smart-handler', {
      body: { email, token },
    });

    if (error) {
      console.error('❌ Edge Function error:', error);
      return { success: false, error: error.message };
    }

    if (data?.success) {
      console.log('✅ OTP email sent successfully via Edge Function');
      return { success: true };
    } else {
      console.error('❌ Edge Function returned error:', data);
      return { success: false, error: data?.error || 'Unknown error' };
    }
  } catch (error) {
    console.error('❌ Error calling Edge Function:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Legacy code - kept for reference
/*
export async function sendOTPEmailDirect({ email, token }: SendOTPEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer RESEND_API_KEY`,
      },
      body: JSON.stringify({
        from: 'PolicyBridge.AI <noreply@policybridgeai.com>',
        to: [email],
        subject: 'PolicyBridge.AI - 验证您的邮箱',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .otp-code {
      background: #10b981;
      color: white;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
    }
    .info-box {
      background: #fff;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PolicyBridge.AI</h1>
  </div>
  <div class="content">
    <h2>验证您的邮箱</h2>
    <p>您好！</p>
    <p>感谢您注册 PolicyBridge.AI。请使用以下验证码完成注册：</p>
    
    <div class="otp-code">${token}</div>
    
    <div class="info-box">
      <p><strong>📧 验证码说明：</strong></p>
      <ul>
        <li>验证码有效期为 <strong>10分钟</strong></li>
        <li>验证码仅包含数字，不区分大小写</li>
        <li>如果您没有注册账户，请忽略此邮件</li>
      </ul>
    </div>
    
    <p>如果您在验证过程中遇到任何问题，请联系我们的客服团队。</p>
    
    <div class="footer">
      <p>© 2026 PolicyBridge.AI. All rights reserved.</p>
      <p><a href="https://www.policybridgeai.com">访问网站</a></p>
    </div>
  </div>
</body>
</html>
        `,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OTP email sent successfully via Resend:', data.id);
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('❌ Resend API error:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
*/
