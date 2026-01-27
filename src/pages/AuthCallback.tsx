import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('=== Auth Callback Handler Started ===');
        console.log('Current URL:', window.location.href);
        
        // Check if this is an email verification callback
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const type = urlParams.get('type');
        const accessToken = urlParams.get('access_token');
        
        console.log('Callback type:', type);
        
        // Handle email verification
        if (type === 'signup' && accessToken) {
          console.log('✅ Email verification callback detected');
          
          // Set flag for welcome dialog
          localStorage.setItem('just_registered', 'true');
          
          // Wait a bit for Supabase to process the session
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get the session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            console.error('Session error after email verification:', sessionError);
            setError('邮箱验证成功，但获取会话失败。请尝试登录。');
            setIsProcessing(false);
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/login', { replace: true }), 3000);
            return;
          }
          
          console.log('✅ Email verified successfully for:', session.user.email);
          setIsProcessing(false);
          return;
        }
        
        // Handle OAuth callback
        // Wait a bit for Supabase to process the session from URL
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session check result:', { session: !!session, error: sessionError });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to get session: ' + sessionError.message);
          setIsProcessing(false);
          return;
        }

        if (!session) {
          console.error('No session found after OAuth callback');
          console.log('Checking URL for OAuth parameters...');
          
          // Check if we have OAuth parameters in URL
          const refreshToken = urlParams.get('refresh_token');
          
          console.log('URL has access_token:', !!accessToken);
          console.log('URL has refresh_token:', !!refreshToken);
          
          if (!accessToken) {
            setError('No session found. Please try logging in again.');
            setIsProcessing(false);
            return;
          }
          
          // If we have tokens but getSession() didn't work, wait for AuthContext to update
          console.log('Waiting for AuthContext to update with session...');
          setIsProcessing(false);
          return;
        }

        console.log('Session obtained successfully:', session.user.email);
        console.log('User ID:', session.user.id);
        setIsProcessing(false);

      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during authentication');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate]);

  // Once user is loaded from AuthContext, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user && !isProcessing) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, isProcessing, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Login</h1>
          <p className="text-gray-600">Please wait while we complete your authentication...</p>
        </div>
      </div>
    </div>
  );
}
