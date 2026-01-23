import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) {
      console.log('Login already in progress, ignoring duplicate submission');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError(t('login.errors.emptyFields'));
      return;
    }

    setError('');
    setLoading(true);
    console.log('=== Login attempt started ===');
    console.log('Email:', email);

    try {
      const loginPromise = login(email, password);
      const timeoutPromise = new Promise<{ success: boolean; message: string }>((_, reject) => 
        setTimeout(() => reject(new Error(t('login.errors.timeout'))), 15000)
      );

      const result = await Promise.race([loginPromise, timeoutPromise]);
      
      console.log('Login result:', result);

      if (result.success) {
        toast.success(t('login.success'));
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        const errorMessage = result.message || t('login.errors.loginFailed');
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Login failed:', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : t('login.errors.generic');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.log('=== Login attempt ended ===');
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;

    setError('');
    setGoogleLoading(true);
    console.log('=== Google OAuth login started ===');

    try {
      // For Supabase OAuth, we don't need to specify redirectTo
      // Supabase will use the Site URL from URL Configuration
      // and the OAuth will be handled automatically
      console.log('Current hostname:', window.location.hostname);
      console.log('Current origin:', window.location.origin);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }

      // OAuth redirect will happen automatically
      console.log('Google OAuth redirect initiated');
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : t('login.errors.googleLoginFailed');
      setError(errorMessage);
      toast.error(errorMessage);
      setGoogleLoading(false);
    }
  };

  const handleWechatLogin = () => {
    if (wechatLoading) return;

    setError('');
    setWechatLoading(true);
    console.log('=== WeChat OAuth login started ===');

    try {
      // WeChat OAuth parameters
      const appId = import.meta.env.VITE_WECHAT_APP_ID;
      if (!appId) {
        throw new Error('WeChat App ID not configured');
      }

      const redirectUri = encodeURIComponent(
        `${window.location.origin}/auth/wechat/callback`
      );
      const scope = 'snsapi_login';
      const state = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // Store state in sessionStorage for verification
      sessionStorage.setItem('wechat_oauth_state', state);

      // Redirect to WeChat authorization page
      const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

      console.log('Redirecting to WeChat auth URL');
      window.location.href = wechatAuthUrl;
    } catch (error) {
      console.error('WeChat login error:', error);
      const errorMessage = error instanceof Error ? error.message : t('login.errors.wechatLoginFailed');
      setError(errorMessage);
      toast.error(errorMessage);
      setWechatLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('login.checkingStatus')}</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('login.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src="/images/pba-logo-clean.png" alt="PolicyBridge.ai" className="h-14 w-auto max-w-xs" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">{t('login.title')}</CardTitle>
            <CardDescription>{t('login.subtitle')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* WeChat Login Button - Only for Chinese users */}
            {language === 'zh' && (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-[#09B981] hover:bg-[#059669] text-white border-[#09B981]"
                onClick={handleWechatLogin}
                disabled={loading || googleLoading || wechatLoading}
              >
                {wechatLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('login.wechatLoggingIn')}
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.691 2.188C3.891 2.188 0 5.896 0 9.596c0 2.652 1.434 4.944 3.586 6.368-.059.811-.721 4.32-1.288 6.465.554-.146 3.54-1.755 5.051-2.585 1.078.227 2.181.347 3.341.347 4.8 0 8.691-3.708 8.691-8.408S13.491 2.188 8.691 2.188zM5.22 11.008h-1.77v1.771h1.77v-1.771zm2.655 0h-1.771v1.771h1.771v-1.771zm2.655 0h-1.77v1.771h1.77v-1.771zm2.655 0h-1.771v1.771h1.771v-1.771z" />
                    </svg>
                    {t('login.wechatLogin')}
                  </>
                )}
              </Button>
            )}

            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading || wechatLoading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login.googleLoggingIn')}
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
                  {t('login.googleLogin')}
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
                  {t('login.orDivider')}
                </span>
              </div>
            </div>

            {/* Email/Password Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{t('login.password')}</Label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    {t('login.forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading || googleLoading || wechatLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('login.loggingIn')}
                  </>
                ) : (
                  t('login.loginButton')
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                {t('login.noAccount')}{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  {t('login.registerNow')}
                </Link>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}