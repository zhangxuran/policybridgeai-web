import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
  description?: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  url = 'https://policybridgeai.com',
  title = 'PolicyBridge.AI - Bridging Complex Contracts with AI Insights',
  description = 'AI-powered contract review and compliance risk screening for cross-border trade.',
}) => {
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
    window.open(shareUrl, '_blank', 'width=600,height=400');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t('share.linkCopied') || 'Link copied to clipboard!');
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {t('share.title') || 'Share this page'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Share Options */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(shareLinks).map(([platform, { name, icon, url: shareUrl, color }]) => (
              <button
                key={platform}
                onClick={() => handleShare(platform, shareUrl)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border border-gray-200 ${color}`}
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-medium text-gray-700">{name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-colors border border-gray-200 hover:bg-gray-50 hover:text-gray-600 mt-3"
          >
            <span className="text-2xl">🔗</span>
            <span className="font-medium text-gray-700">
              {t('share.copyLink') || 'Copy Link'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
