import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WechatTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface WechatUserInfo {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      return new Response(
        JSON.stringify({ error: "Missing authorization code" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables
    const appId = Deno.env.get("WECHAT_APP_ID");
    const appSecret = Deno.env.get("WECHAT_APP_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!appId || !appSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 1: Exchange code for access_token
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData: WechatTokenResponse = await tokenResponse.json();

    if (tokenData.errcode) {
      console.error("WeChat token error:", tokenData);
      return new Response(
        JSON.stringify({
          error: "Failed to get access token",
          details: tokenData.errmsg,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { access_token, openid, unionid } = tokenData;

    // Step 2: Get user info
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;

    const userInfoResponse = await fetch(userInfoUrl);
    const userInfo: WechatUserInfo = await userInfoResponse.json();

    if (userInfo.errcode) {
      console.error("WeChat userinfo error:", userInfo);
      return new Response(
        JSON.stringify({
          error: "Failed to get user info",
          details: userInfo.errmsg,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Create or update user in Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use openid as the unique identifier
    const userId = `wechat_${openid}`;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("wechat_users")
      .select("*")
      .eq("openid", openid)
      .single();

    let user;
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from("wechat_users")
        .update({
          nickname: userInfo.nickname,
          headimgurl: userInfo.headimgurl,
          province: userInfo.province,
          city: userInfo.city,
          country: userInfo.country,
          unionid: userInfo.unionid,
          updated_at: new Date().toISOString(),
        })
        .eq("openid", openid)
        .select()
        .single();

      if (error) throw error;
      user = data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from("wechat_users")
        .insert({
          openid,
          unionid: userInfo.unionid,
          nickname: userInfo.nickname,
          headimgurl: userInfo.headimgurl,
          province: userInfo.province,
          city: userInfo.city,
          country: userInfo.country,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      user = data;
    }

    // Step 4: Create or link Supabase Auth user
    // For simplicity, we'll create a custom JWT token
    // In production, you might want to link this to Supabase Auth users

    const jwtSecret = Deno.env.get("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET not configured");
    }

    // Create a simple JWT token (in production, use a proper JWT library)
    const payload = {
      sub: userId,
      openid: openid,
      nickname: userInfo.nickname,
      headimgurl: userInfo.headimgurl,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    };

    // For now, return the user info and a success message
    // The frontend will handle storing the token
    const redirectUrl = `${url.origin}/?wechat_auth=success&openid=${openid}&nickname=${encodeURIComponent(userInfo.nickname)}&headimgurl=${encodeURIComponent(userInfo.headimgurl)}`;

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          openid,
          nickname: userInfo.nickname,
          headimgurl: userInfo.headimgurl,
          province: userInfo.province,
          city: userInfo.city,
          country: userInfo.country,
          unionid: userInfo.unionid,
        },
        redirectUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in wechat-auth function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
