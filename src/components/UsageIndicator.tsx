import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkUsageLimit } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, Infinity as InfinityIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface UsageData {
  used: number;
  limit: number;
  hasAccess: boolean;
}

export function UsageIndicator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, [user]);

  async function loadUsage() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const usageData = await checkUsageLimit(user.id);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  // Enterprise unlimited plan special display
  if (usage.limit === -1) {
    return (
      <Card className="border-primary bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{t('usageIndicator.monthlyUsage')}</span>
              <div className="flex items-center gap-2">
                <InfinityIcon className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-primary">{t('usageIndicator.unlimited')}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('usageIndicator.enterpriseUnlimited')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = (usage.used / usage.limit) * 100;
  const remaining = usage.limit - usage.used;
  const isLow = remaining <= 5 && remaining > 0;
  const isExhausted = remaining <= 0;

  return (
    <Card className={isExhausted ? 'border-red-300' : isLow ? 'border-yellow-300' : ''}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{t('usageIndicator.monthlyUsage')}</span>
            <span className={`font-semibold ${isExhausted ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-gray-900'}`}>
              {usage.used} / {usage.limit}
            </span>
          </div>

          <Progress
            value={percentage}
            className={`h-2 ${isExhausted ? '[&>div]:bg-red-500' : isLow ? '[&>div]:bg-yellow-500' : ''}`}
          />

          {isExhausted && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm text-red-800 font-medium">
                  {t('usageIndicator.exhausted.title')}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate('/booster-pack')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t('usageIndicator.exhausted.buyBooster')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/pricing')}
                  >
                    {t('usageIndicator.exhausted.upgradePlan')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLow && !isExhausted && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <p className="text-sm text-yellow-800 font-medium">
                  {t('usageIndicator.low.title')}
                </p>
                <p className="text-xs text-yellow-700">
                  {t('usageIndicator.low.description', { remaining })}
                </p>
              </div>
            </div>
          )}

          {!isExhausted && !isLow && (
            <p className="text-xs text-muted-foreground">
              {t('usageIndicator.remaining', { remaining })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}