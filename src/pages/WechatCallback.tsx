import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface WechatUser {
  id: string;
  openid: string;
  nickname: string;
  headimgurl: string;
  province?: string;
  city?: string;
  country?: string;
  unionid?: string;
}

export const WechatCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleWechatCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
          setError("No authorization code received");
          setLoading(false);
          return;
        }

        // Verify state to prevent CSRF
        const storedState = sessionStorage.getItem("wechat_oauth_state");
        if (state !== storedState) {
          setError("Invalid state parameter");
          setLoading(false);
          return;
        }

        // Call our Edge Function to exchange code for token
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wechat-auth?code=${code}&state=${state}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to authenticate with WeChat");
        }

        const data = await response.json();
        const user: WechatUser = data.user;

        // Store user info in localStorage
        localStorage.setItem(
          "wechat_user",
          JSON.stringify({
            id: user.id,
            openid: user.openid,
            nickname: user.nickname,
            headimgurl: user.headimgurl,
            loginTime: new Date().toISOString(),
          })
        );

        // Clear state from sessionStorage
        sessionStorage.removeItem("wechat_oauth_state");

        // Show success message
        setLoading(false);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("WeChat callback error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during authentication"
        );
        setLoading(false);
      }
    };

    handleWechatCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">正在验证微信登录...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 text-center mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold mb-2">登录失败</h2>
            <p className="text-sm mb-4">{error}</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <div className="text-green-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">登录成功</h2>
          <p className="text-gray-600 text-sm mb-4">正在跳转到仪表板...</p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default WechatCallback;
