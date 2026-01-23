import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        toast.error(t('forgotPassword.error') || 'Failed to send reset email');
      } else {
        setSubmitted(true);
        toast.success(t('forgotPassword.success') || 'Reset email sent successfully');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">
                {t('forgotPassword.emailSent') || 'Email Sent'}
              </CardTitle>
              <CardDescription className="mt-2">
                {t('forgotPassword.checkEmail') || 'Please check your email for password reset instructions'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-600 mb-4">
              {t('forgotPassword.redirecting') || 'Redirecting to login in 3 seconds...'}
            </p>
          </CardContent>
        </Card>
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
            <CardTitle className="text-2xl font-bold">{t('forgotPassword.title') || 'Forgot Password'}</CardTitle>
            <CardDescription>{t('forgotPassword.subtitle') || 'Enter your email to reset your password'}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email') || 'Email'}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('forgotPassword.sendButton') || 'Send Reset Link'}
            </Button>
          </form>

          <div className="flex items-center gap-2 pt-4">
            <Link to="/login" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4" />
              {t('forgotPassword.backToLogin') || 'Back to Login'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
