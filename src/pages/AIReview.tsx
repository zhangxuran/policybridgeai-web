import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AIReview() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        // Redirect directly to custom UI dialog window
        navigate('/dify-chat');
      }
    }
  }, [user, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('aiReview.redirecting')}</p>
        </div>
      </div>
    </div>
  );
}