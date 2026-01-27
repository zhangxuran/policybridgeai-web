import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error('邮箱地址无效');
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('发送失败，请稍后重试');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            📧 验证您的邮箱
          </CardTitle>
          <CardDescription className="text-base mt-2">
            我们已向您的邮箱发送了验证链接
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Display */}
          {email && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">验证邮件已发送至：</p>
              <p className="text-base font-semibold text-blue-900">{email}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">📝 接下来的步骤：</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 font-semibold">1.</span>
                <span>打开您的邮箱收件箱</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 font-semibold">2.</span>
                <span>找到来自 PolicyBridge.AI 的验证邮件</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 font-semibold">3.</span>
                <span>点击邮件中的验证链接</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 font-semibold">4.</span>
                <span>验证成功后即可登录使用</span>
              </li>
            </ol>
          </div>

          {/* Trial Benefits Reminder */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              🎁 验证后即可获得：
            </p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>✨ 7天专业版免费试用</li>
              <li>📄 无限次合同审查</li>
              <li>🤖 AI深度分析</li>
            </ul>
          </div>

          {/* Resend Button */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              没有收到邮件？
            </p>
            <Button
              onClick={handleResend}
              disabled={isResending || !email}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重新发送验证邮件
                </>
              )}
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              💡 <strong>提示：</strong>如果在收件箱中找不到邮件，请检查垃圾邮件文件夹。
            </p>
          </div>

          {/* Back to Login */}
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回登录页面
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
