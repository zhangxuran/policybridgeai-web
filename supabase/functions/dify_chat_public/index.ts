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

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] ===== PUBLIC FUNCTION (NO JWT) =====`);
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
      });
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

    // Get Dify API configuration
    const difyApiUrl = Deno.env.get('DIFY_API_URL') || 'https://dify.policybridgeai.com/v1';
    const difyApiKey = Deno.env.get('DIFY_API_KEY');

    if (!difyApiKey) {
      console.error(`[${requestId}] Missing DIFY_API_KEY`);
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

    // Build Dify payload
    const difyPayload: any = {
      inputs: {},
      query: body.query,
      response_mode: 'blocking',
      user: body.user_id,
      files: body.files || [],
    };

    // Only include conversation_id if it's provided and not empty
    if (body.conversation_id && body.conversation_id.trim() !== '') {
      difyPayload.conversation_id = body.conversation_id;
      console.log(`[${requestId}] Using existing conversation_id: ${body.conversation_id}`);
    } else {
      console.log(`[${requestId}] Starting new conversation (no conversation_id)`);
    }

    console.log(`[${requestId}] Calling Dify API at ${difyApiUrl}/chat-messages`);
    console.log(`[${requestId}] Dify payload:`, JSON.stringify(difyPayload).substring(0, 200));

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

    const difyData = await difyResponse.json();
    console.log(`[${requestId}] Dify API response received successfully`);
    console.log(`[${requestId}] Dify conversation_id:`, difyData.conversation_id);

    return new Response(
      JSON.stringify({
        success: true,
        data: difyData,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

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