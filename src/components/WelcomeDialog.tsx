import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Zap } from 'lucide-react';

export function WelcomeDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user just registered
    const justRegistered = localStorage.getItem('just_registered');
    if (justRegistered === 'true') {
      setOpen(true);
      // Clear the flag
      localStorage.removeItem('just_registered');
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('welcome.title', '🎉 欢迎加入 PolicyBridge.AI！')}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {t('welcome.subtitle', '恭喜您成功注册！')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Trial Benefit Card */}
          <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t('welcome.trialTitle', '7天专业版免费试用')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('welcome.trialDescription', '您已获得7天专业版功能的完整访问权限，包括无限次合同审查、AI深度分析和优先客服支持。')}
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">
                {t('welcome.feature1', '✨ 无限次合同审查')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700">
                {t('welcome.feature2', '🎯 AI 深度风险分析')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700">
                {t('welcome.feature3', '💡 专业解决方案建议')}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => setOpen(false)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 text-base"
          >
            {t('welcome.startButton', '开始体验 →')}
          </Button>

          <p className="text-center text-xs text-gray-500">
            {t('welcome.footer', '试用期结束后，您可以选择升级或继续使用免费版')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
