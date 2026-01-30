import React, { useState } from 'react';
import { Share2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  url = 'https://policybridgeai.com',
  title = 'PolicyBridge.AI - Bridging Complex Contracts with AI Insights',
  description = 'AI-powered contract review and compliance risk screening for cross-border trade.',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const shareLinks = {
    whatsapp: {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${description}\n\n${url}`)}`,
      color: 'hover:bg-green-50 hover:text-green-600',
    },
    facebook: {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:bg-blue-50 hover:text-blue-600',
    },
    twitter: {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'hover:bg-sky-50 hover:text-sky-600',
    },
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:bg-blue-50 hover:text-blue-700',
    },
    telegram: {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'hover:bg-sky-50 hover:text-sky-500',
    },
    email: {
      name: 'Email',
      icon: '📧',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
      color: 'hover:bg-gray-50 hover:text-gray-600',
    },
  };

  const handleShare = (platform: string, shareUrl: string) => {
    // For mobile devices, try native share API first
    if (navigator.share && platform === 'native') {
      navigator
        .share({
          title,
          text: description,
          url,
        })
        .then(() => {
          toast.success(t('share.success') || 'Shared successfully!');
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Share failed:', error);
          }
        });
    } else {
      // Open share URL in new window
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setIsOpen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t('share.linkCopied') || 'Link copied to clipboard!');
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">{t('share.button') || 'Share'}</span>
      </button>

      {/* Share Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="font-semibold text-gray-900">
                {t('share.title') || 'Share this page'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Share Options */}
            <div className="p-2">
              {Object.entries(shareLinks).map(([platform, { name, icon, url: shareUrl, color }]) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform, shareUrl)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${color}`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="font-medium text-gray-700">{name}</span>
                </button>
              ))}

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-50 hover:text-gray-600 border-t border-gray-100 mt-2 pt-3"
              >
                <span className="text-2xl">🔗</span>
                <span className="font-medium text-gray-700">
                  {t('share.copyLink') || 'Copy Link'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
