import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OTPEmailRequest {
  email: string
  token: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, token }: OTPEmailRequest = await req.json()

    if (!email || !token) {
      return new Response(
        JSON.stringify({ error: 'Email and token are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Send email using Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
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
    })

    if (res.ok) {
      const data = await res.json()
      return new Response(
        JSON.stringify({ success: true, id: data.id }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      const error = await res.text()
      console.error('Resend API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
