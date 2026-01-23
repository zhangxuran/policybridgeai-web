import React, { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WechatLoginButtonProps {
  className?: string;
}

export const WechatLoginButton: React.FC<WechatLoginButtonProps> = ({
  className = "",
}) => {
  const { language } = useLanguage();

  // Only show WeChat login for Chinese users
  if (language !== "zh") {
    return null;
  }

  const handleWechatLogin = () => {
    // WeChat OAuth parameters
    const appId = import.meta.env.VITE_WECHAT_APP_ID;
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/auth/wechat/callback`
    );
    const scope = "snsapi_login";
    const state = generateState();

    // Store state in sessionStorage for verification
    sessionStorage.setItem("wechat_oauth_state", state);

    // Redirect to WeChat authorization page
    const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

    window.location.href = wechatAuthUrl;
  };

  const generateState = (): string => {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  };

  return (
    <button
      onClick={handleWechatLogin}
      className={`w-full px-4 py-2 bg-[#09B981] text-white font-medium rounded-lg hover:bg-[#059669] transition-colors flex items-center justify-center gap-2 ${className}`}
      aria-label="Sign in with WeChat"
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8.691 2.188C3.891 2.188 0 5.896 0 9.596c0 2.652 1.434 4.944 3.586 6.368-.059.811-.721 4.32-1.288 6.465.554-.146 3.54-1.755 5.051-2.585 1.078.227 2.181.347 3.341.347 4.8 0 8.691-3.708 8.691-8.408S13.491 2.188 8.691 2.188zM5.22 11.008h-1.77v1.771h1.77v-1.771zm2.655 0h-1.771v1.771h1.771v-1.771zm2.655 0h-1.77v1.771h1.77v-1.771zm2.655 0h-1.771v1.771h1.771v-1.771z" />
      </svg>
      <span>微信登录</span>
    </button>
  );
};

export default WechatLoginButton;
