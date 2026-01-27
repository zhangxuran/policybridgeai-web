import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error(t('register.errors.agreeToTerms'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('register.errors.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      toast.error(t('register.errors.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      // Set flag for welcome dialog
      localStorage.setItem('just_registered', 'true');
      toast.success('注册成功！您现在可以登录了');
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('register.errors.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (googleLoading) return;

    if (!agreedToTerms) {
      toast.error(t('register.errors.agreeToTerms'));
      return;
    }

    setGoogleLoading(true);
    console.log('=== Google OAuth registration started ===');

    try {
      // Determine redirect URL based on environment
      // Check if running on localhost or 127.0.0.1
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('localhost');
      
      const redirectUrl = isLocalhost
        ? window.location.origin 
        : 'https://www.policybridgeai.com';

      console.log('Current hostname:', window.location.hostname);
      console.log('Current origin:', window.location.origin);
      console.log('Is localhost:', isLocalhost);
      console.log('Redirect URL:', redirectUrl);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }

      // OAuth redirect will happen automatically
      console.log('Google OAuth redirect initiated');
    } catch (error) {
      console.error('Google register error:', error);
      const errorMessage = error instanceof Error ? error.message : t('register.errors.googleRegisterFailed');
      toast.error(errorMessage);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src="/images/pba-logo-clean.png" alt="PolicyBridge.ai" className="h-14 w-auto max-w-xs" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">{t('register.title')}</CardTitle>
            <CardDescription>{t('register.subtitle')}</CardDescription>
          </div>
          {/* Trial Benefits Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 text-sm mb-1.5">
                  {t('register.trial.title', '✨ 注册即可获得')}
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <svg className="h-4 w-4 flex-shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">{t('register.trial.benefit1', '7天专业版免费试用')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <svg className="h-4 w-4 flex-shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('register.trial.benefit2', '无限次合同审查')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <svg className="h-4 w-4 flex-shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('register.trial.benefit3', 'AI 深度分析 + 专业解决方案')}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-2 font-medium">
                  {t('register.trial.noCreditCard', '无需信用卡，立即开始')}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Terms Agreement - Moved to top */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                {t('register.agreeToTerms.prefix')}
                <Link to="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 font-semibold mx-1">
                  {t('register.agreeToTerms.terms')}
                </Link>
                {t('register.agreeToTerms.and')}
                <Link to="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 font-semibold mx-1">
                  {t('register.agreeToTerms.privacy')}
                </Link>
              </label>
            </div>

            {/* Google Register Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
              onClick={handleGoogleRegister}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('register.googleRegistering')}
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t('register.googleRegister')}
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  {t('register.orDivider')}
                </span>
              </div>
            </div>

            {/* Email/Password Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('register.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('register.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('register.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('register.registering')}
                  </>
                ) : (
                  t('register.registerButton')
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">{t('register.hasAccount')}</span>
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold ml-1">
                  {t('register.loginNow')}
                </Link>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}