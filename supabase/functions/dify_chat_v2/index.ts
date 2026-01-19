const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface DifyChatRequest {
  query: string;
  conversation_id?: string;
  user_id: string;
  files?: Array<{
    type: string;
    transfer_method: string;
    url?: string;
    upload_file_id?: string;
  }>;
}

// 创建 Supabase 客户端
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

/**
 * 检查用户是否为付费用户
 * 逻辑：
 * 1. 查询 profiles 表中的用户订阅信息
 * 2. 检查 subscription_plan 是否为付费类型（非 'free'）
 * 3. 检查 subscription_status 是否为 'active'
 * 4. 两个条件都满足则为付费用户
 */
async function isPaidUser(userId: string): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('='.repeat(60));
    console.log(`[isPaidUser] 🔍 CHECKING SUBSCRIPTION FOR USER: ${userId}`);
    console.log('='.repeat(60));

    // 查询 profiles 表获取用户订阅信息
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, email')
      .eq('id', userId)
      .single();

    if (error) {
      console.log(`[isPaidUser] ❌ Error querying profiles table:`, error.message);
      console.log(`[isPaidUser] ⚠️ Defaulting to FREE user`);
      return false;
    }

    if (!profile) {
      console.log(`[isPaidUser] ⚠️ No profile found for user ${userId}`);
      console.log(`[isPaidUser] ⚠️ Defaulting to FREE user`);
      return false;
    }

    console.log(`[isPaidUser] 📊 Profile Data Retrieved:`);
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Subscription Plan: ${profile.subscription_plan}`);
    console.log(`   - Subscription Status: ${profile.subscription_status}`);

    // 检查是否为付费用户
    const isPaid = profile.subscription_plan !== 'free' && profile.subscription_status === 'active';
    
    console.log('='.repeat(60));
    if (isPaid) {
      console.log(`[isPaidUser] ✅ RESULT: 💎 PAID USER`);
      console.log(`   - Plan: ${profile.subscription_plan}`);
      console.log(`   - Status: ${profile.subscription_status}`);
      console.log(`   - Will use: PAID API (app-Svga3U8E8RxuMjoxYwWTeizZ)`);
    } else {
      console.log(`[isPaidUser] ✅ RESULT: 🆓 FREE USER`);
      console.log(`   - Plan: ${profile.subscription_plan}`);
      console.log(`   - Status: ${profile.subscription_status}`);
      console.log(`   - Will use: FREE API (app-HhvrEdwxk4ZxoqMAQE6GUNQc or app-t1Mc7ID3o0DRqSQ6FwvW4YrH)`);
    }
    console.log('='.repeat(60));
    
    return isPaid;

  } catch (error) {
    console.error(`[isPaidUser] ❌ Exception occurred:`, error);
    console.error(`[isPaidUser] ⚠️ Defaulting to FREE user for safety`);
    return false;
  }
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] ===== DIFY CHAT V2 (DUAL API SUPPORT) =====`);
  console.log(`[${requestId}] Request received:`, {
    method: req.method,
    url: req.url,
    contentType: req.headers.get('content-type'),
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling CORS preflight`);
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    console.log(`[${requestId}] Processing POST request`);
    
    // Read body as text first (can only read once!)
    const rawBody = await req.text();
    console.log(`[${requestId}] Raw body length:`, rawBody.length);
    console.log(`[${requestId}] Raw body:`, rawBody.substring(0, 500));
    
    // Parse JSON from text
    let body: DifyChatRequest;
    try {
      body = JSON.parse(rawBody);
      console.log(`[${requestId}] Successfully parsed JSON:`, {
        query: body.query?.substring(0, 50),
        conversation_id: body.conversation_id,
        user_id: body.user_id,
        files: body.files,
        hasFiles: !!body.files,
        filesCount: body.files?.length || 0,
      });
      
      // Log files in detail if present
      if (body.files && body.files.length > 0) {
        console.log(`[${requestId}] 📎 FILES DETECTED:`, JSON.stringify(body.files, null, 2));
      } else {
        console.log(`[${requestId}] ⚠️ NO FILES in request body`);
      }
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body',
          rawBody: rawBody.substring(0, 200),
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    if (!body.query || !body.user_id) {
      console.error(`[${requestId}] Missing required fields`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing required fields: query and user_id are required',
          received: { query: !!body.query, user_id: !!body.user_id }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 🔑 检查用户是否为付费用户，选择对应的 API Key
    const isPaid = await isPaidUser(body.user_id);
    
    // Get Dify API configuration
    const difyApiUrl = Deno.env.get('DIFY_API_URL') || 'https://dify.policybridgeai.com/v1';
    
    // 根据用户类型选择 API Key
    let difyApiKey: string;
    if (isPaid) {
      // 付费用户使用付费版 API
      difyApiKey = Deno.env.get('DIFY_API_KEY_PAID') || Deno.env.get('DIFY_API_KEY') || '';
      console.log(`[${requestId}] 💎 User ${body.user_id} is PAID - Using PAID API`);
      console.log(`[${requestId}] 🔑 API Key: ${difyApiKey.substring(0, 20)}...`);
    } else {
      // 免费用户使用免费版 API
      difyApiKey = Deno.env.get('DIFY_API_KEY_FREE') || '';
      console.log(`[${requestId}] 🆓 User ${body.user_id} is FREE - Using FREE API`);
      console.log(`[${requestId}] 🔑 API Key: ${difyApiKey.substring(0, 20)}...`);
    }

    if (!difyApiKey) {
      console.error(`[${requestId}] Missing DIFY_API_KEY for user type: ${isPaid ? 'PAID' : 'FREE'}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Server configuration error: Missing DIFY_API_KEY' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build Dify payload with streaming mode
    const difyPayload: any = {
      inputs: {},
      query: body.query,
      response_mode: 'streaming',
      user: body.user_id,
    };

    // Add files if present
    if (body.files && body.files.length > 0) {
      difyPayload.files = body.files;
      console.log(`[${requestId}] ✅ Adding ${body.files.length} file(s) to Dify payload`);
      console.log(`[${requestId}] Files being sent to Dify:`, JSON.stringify(body.files, null, 2));
    } else {
      console.log(`[${requestId}] ⚠️ No files to add to Dify payload`);
    }

    // Only include conversation_id if it's provided and not empty
    if (body.conversation_id && body.conversation_id.trim() !== '') {
      difyPayload.conversation_id = body.conversation_id;
      console.log(`[${requestId}] Using existing conversation_id: ${body.conversation_id}`);
    } else {
      console.log(`[${requestId}] Starting new conversation (no conversation_id)`);
    }

    console.log(`[${requestId}] Calling Dify API at ${difyApiUrl}/chat-messages with streaming`);
    console.log(`[${requestId}] 📦 COMPLETE Dify payload:`, JSON.stringify(difyPayload, null, 2));

    const difyResponse = await fetch(`${difyApiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(difyPayload),
    });

    console.log(`[${requestId}] Dify API response status: ${difyResponse.status}`);

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error(`[${requestId}] Dify API error:`, {
        status: difyResponse.status,
        error: errorText.substring(0, 500),
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Dify API error: ${difyResponse.status}`,
          details: errorText
        }),
        { 
          status: difyResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return streaming response
    console.log(`[${requestId}] ✅ Returning streaming response`);
    
    return new Response(difyResponse.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    console.error(`[${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});