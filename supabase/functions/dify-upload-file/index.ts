const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] ===== DIFY FILE UPLOAD =====`);
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

    // Get Dify API configuration
    const DIFY_API_URL = Deno.env.get('DIFY_API_URL') || 'https://dify.policybridgeai.com/v1';
    const DIFY_API_KEY = Deno.env.get('DIFY_API_KEY');

    if (!DIFY_API_KEY) {
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

    // Get form data from request
    const formData = await req.formData();
    const file = formData.get('file');
    const userId = formData.get('user');

    if (!file || !(file instanceof File)) {
      console.error(`[${requestId}] No file provided`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No file provided' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[${requestId}] Uploading file: ${file.name} (${file.size} bytes) for user: ${userId}`);

    // Create new FormData for Dify API
    const difyFormData = new FormData();
    difyFormData.append('file', file);
    if (userId) {
      difyFormData.append('user', userId as string);
    }

    // Upload file to Dify API
    console.log(`[${requestId}] Calling Dify API at ${DIFY_API_URL}/files/upload`);
    const difyResponse = await fetch(`${DIFY_API_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
      },
      body: difyFormData,
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

    const difyResult = await difyResponse.json();
    console.log(`[${requestId}] File uploaded successfully:`, difyResult);

    return new Response(
      JSON.stringify(difyResult),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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