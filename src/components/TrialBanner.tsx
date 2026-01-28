import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Gift, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function TrialBanner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // Don't show banner if user is logged in or dismissed it
  if (user || !isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Message */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-semibold text-sm sm:text-base">
                {t('banner.title', '🎁 限时福利')}
              </span>
              <span className="text-xs sm:text-sm text-white/90">
                {t('banner.message', '新用户注册即享 7 天专业版免费试用！无限次合同审查，AI 深度分析')}
              </span>
            </div>
          </div>

          {/* Right: CTA Button + Close */}
          <div className="flex items-center gap-2">
            <Link
              to="/register"
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition-all hover:bg-white/90 hover:scale-105 shadow-lg whitespace-nowrap"
            >
              {t('banner.cta', '立即注册')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 rounded-full p-1.5 hover:bg-white/20 transition-colors"
              aria-label="Close banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
