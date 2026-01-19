import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);

        // Supabase automatically handles the OAuth callback from the URL
        // We just need to wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session check result:', { session, sessionError });

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setError('认证失败: ' + sessionError.message);
          setIsProcessing(false);
          return;
        }

        if (session && session.user) {
          console.log('✅ OAuth callback successful, user:', session.user.email);
          
          // Check if profile exists, if not create it
          const { data: profile, error: profileSelectError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          console.log('Profile check:', { profile, profileSelectError });

          if (profileSelectError && profileSelectError.code !== 'PGRST116') {
            console.error('Profile select error:', profileSelectError);
          }

          if (!profile) {
            console.log('Creating new profile for user:', session.user.id);
            // Create profile for OAuth user
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                role: 'user',
                subscription_plan: 'free',
                subscription_status: 'active'
              });

            if (profileError) {
              console.error('⚠️ Profile creation error:', profileError);
              // Don't fail, profile might be created by trigger
            } else {
              console.log('✅ Profile created successfully');
            }
          } else {
            console.log('✅ Profile already exists');
          }

          // Redirect to dashboard after successful authentication
          console.log('🔄 Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        } else {
          console.log('❌ No session found after OAuth callback');
          setError('认证失败: 未获取到会话信息');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('❌ Callback error:', err);
        setError('认证处理出错: ' + (err instanceof Error ? err.message : '未知错误'));
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">正在处理认证...</p>
          <p className="mt-2 text-sm text-gray-500">请稍候，我们正在验证您的身份</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">认证失败</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">正在重定向...</p>
      </div>
    </div>
  );
}
