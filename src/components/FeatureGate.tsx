import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkFeatureAccess, getTierName, getUpgradeSuggestion, type FeaturePermissions } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FeatureGateProps {
  feature: keyof FeaturePermissions;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkAccess();
  }, [user, feature]);

  async function checkAccess() {
    if (!user) {
      setHasAccess(false);
      setMessage(t('common.pleaseLogin'));
      return;
    }

    const result = await checkFeatureAccess(user.id, feature);
    setHasAccess(result.hasAccess);
    setMessage(result.message);
  }

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Lock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{t('featureGate.locked')}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
          <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">{t('featureGate.upgrade')}</p>
            <p className="text-sm text-gray-600">
              {t('featureGate.upgradeDescription')}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate('/pricing')} className="w-full">
          {t('featureGate.viewPlans')}
        </Button>
      </CardFooter>
    </Card>
  );
}