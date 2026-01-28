import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { sendOTPEmail } from '@/lib/resend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VerifyOTP() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error(t('verifyOTP.errors.emptyOTP'));
      return;
    }

    if (otp.length !== 6) {
      toast.error(t('verifyOTP.errors.invalidLength'));
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Verifying OTP for:', email);
      
      // 1. Get pending registration data from localStorage
      const pendingDataStr = localStorage.getItem(`pending_registration_${email}`);
      if (!pendingDataStr) {
        toast.error('Registration data not found. Please register again.');
        navigate('/register');
        return;
      }
      
      const pendingData = JSON.parse(pendingDataStr);
      
      // 2. Verify OTP code
      if (pendingData.otpCode !== otp) {
        toast.error(t('verifyOTP.errors.invalidOTP'));
        return;
      }
      
      // 3. Check if OTP is expired (10 minutes)
      const now = Date.now();
      if (now - pendingData.timestamp > 10 * 60 * 1000) {
        toast.error('OTP code has expired. Please register again.');
        localStorage.removeItem(`pending_registration_${email}`);
        navigate('/register');
        return;
      }
      
      console.log('✅ OTP verified successfully');
      
      // 4. Create Supabase account
      console.log('📝 Creating Supabase account...');
      const { data, error } = await supabase.auth.signUp({
        email: pendingData.email,
        password: pendingData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Account creation error:', error);
        toast.error(error.message || 'Failed to create account');
        return;
      }
      
      if (!data.user) {
        toast.error('Failed to create account');
        return;
      }
      
      console.log('✅ Supabase account created:', data.user.id);
      
      // 5. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: pendingData.email,
          role: 'user',
          subscription_plan: 'free',
          subscription_status: 'active'
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw error, profile might be created by trigger
      } else {
        console.log('✅ Profile created successfully');
      }
      
      // 6. Auto login
      console.log('🔑 Auto login...');
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: pendingData.email,
        password: pendingData.password,
      });
      
      if (loginError) {
        console.error('Auto login error:', loginError);
        toast.warning('Account created but auto-login failed. Please login manually.');
        navigate('/login');
        return;
      }
      
      // 7. Clean up localStorage
      localStorage.removeItem(`pending_registration_${email}`);
      localStorage.removeItem(`otp_${email}`);
      
      // 8. Set flag for welcome dialog
      localStorage.setItem('just_registered', 'true');
      
      toast.success(t('verifyOTP.success'));
      console.log('✅ Registration completed successfully!');
      
      // 9. Redirect to home page
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Verification exception:', error);
      toast.error(error instanceof Error ? error.message : t('verifyOTP.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resending || countdown > 0) return;

    setResending(true);
    try {
      console.log('🔄 Resending OTP to:', email);
      
      // Get pending registration data
      const pendingDataStr = localStorage.getItem(`pending_registration_${email}`);
      if (!pendingDataStr) {
        toast.error('Registration data not found. Please register again.');
        navigate('/register');
        return;
      }
      
      const pendingData = JSON.parse(pendingDataStr);
      
      // Generate new OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update pending registration data with new OTP
      localStorage.setItem(`pending_registration_${email}`, JSON.stringify({
        ...pendingData,
        otpCode,
        timestamp: Date.now()
      }));
      
      // Send email via Resend
      const emailResult = await sendOTPEmail({ email, token: otpCode });
      
      if (!emailResult.success) {
        console.error('Failed to resend OTP email:', emailResult.error);
        toast.error(t('verifyOTP.errors.resendFailed'));
        return;
      }

      console.log('✅ OTP email resent successfully');
      toast.success(t('verifyOTP.resendSuccess'));
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Resend exception:', error);
      toast.error(error instanceof Error ? error.message : t('verifyOTP.errors.generic'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">{t('verifyOTP.title')}</CardTitle>
            <CardDescription className="mt-2">
              {t('verifyOTP.subtitle')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t('verifyOTP.emailSentTo')}</p>
            <p className="font-semibold text-gray-900">{email}</p>
          </div>

          {/* OTP input form */}
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">{t('verifyOTP.otpLabel')}</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                disabled={loading}
                autoFocus
                required
              />
              <p className="text-xs text-gray-500">{t('verifyOTP.otpHint')}</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('verifyOTP.verifying')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('verifyOTP.verifyButton')}
                </>
              )}
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">{t('verifyOTP.noCode')}</p>
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={resending || countdown > 0}
              className="w-full"
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('verifyOTP.resending')}
                </>
              ) : countdown > 0 ? (
                `${t('verifyOTP.resendButton')} (${countdown}s)`
              ) : (
                t('verifyOTP.resendButton')
              )}
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">{t('verifyOTP.tips.title')}</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>{t('verifyOTP.tips.checkSpam')}</li>
                  <li>{t('verifyOTP.tips.validTime')}</li>
                  <li>{t('verifyOTP.tips.caseSensitive')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trial benefits reminder */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              {t('verifyOTP.benefits.title')}
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✨ {t('verifyOTP.benefits.trial')}</li>
              <li>📄 {t('verifyOTP.benefits.unlimited')}</li>
              <li>🤖 {t('verifyOTP.benefits.ai')}</li>
            </ul>
          </div>

          {/* Back to login */}
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/login')}
              className="text-sm"
            >
              {t('verifyOTP.backToLogin')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
