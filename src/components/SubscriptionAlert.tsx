import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, XCircle } from 'lucide-react';
import { SubscriptionStatus, getPlanDisplayName } from '@/lib/subscription';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SubscriptionAlertProps {
  status: SubscriptionStatus;
  onDismiss?: () => void;
}

export function SubscriptionAlert({ status, onDismiss }: SubscriptionAlertProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';

  // Don't show alert for free users who never had a subscription
  if (status.plan === 'free' && !status.purchaseDate) {
    return null;
  }

  // Expiring today - urgent warning
  if (status.isExpiringToday) {
    return (
      <Alert variant="destructive" className="mb-6 border-red-600 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900">{t('subscriptionAlert.expiringToday.title')}</AlertTitle>
        <AlertDescription className="flex items-center justify-between text-red-800">
          <span>
            {t('subscriptionAlert.expiringToday.description', {
              plan: getPlanDisplayName(status.plan),
              date: status.expirationDate?.toLocaleDateString(locale)
            })}
          </span>
          <Button
            size="sm"
            onClick={() => navigate('/pricing')}
            className="ml-4 bg-red-600 hover:bg-red-700"
          >
            {t('subscriptionAlert.expiringToday.renewButton')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Expired subscription
  if (status.isExpired) {
    return (
      <Alert variant="destructive" className="mb-6">
        <XCircle className="h-4 w-4" />
        <AlertTitle>{t('subscriptionAlert.expired.title')}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            {t('subscriptionAlert.expired.description', {
              plan: getPlanDisplayName(status.plan),
              date: status.expirationDate?.toLocaleDateString(locale)
            })}
          </span>
          <Button
            size="sm"
            onClick={() => navigate('/pricing')}
            className="ml-4"
          >
            {t('subscriptionAlert.expired.renewButton')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Renewal reminder (2 days before expiration)
  if (status.showRenewalReminder) {
    return (
      <Alert variant="default" className="mb-6 border-orange-500 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900">{t('subscriptionAlert.expiring.title')}</AlertTitle>
        <AlertDescription className="flex items-center justify-between text-orange-800">
          <span>
            {t('subscriptionAlert.expiring.description', {
              plan: getPlanDisplayName(status.plan),
              days: status.daysRemaining,
              date: status.expirationDate?.toLocaleDateString(locale)
            })}
          </span>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {t('subscriptionAlert.expiring.renewButton')}
            </Button>
            {onDismiss && (
              <Button
                size="sm"
                variant="outline"
                onClick={onDismiss}
              >
                {t('subscriptionAlert.expiring.dismissButton')}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Active subscription status
  if (status.daysRemaining > 2 && status.daysRemaining < 30) {
    return (
      <Alert className="mb-6 border-blue-500 bg-blue-50">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">{t('subscriptionAlert.active.title')}</AlertTitle>
        <AlertDescription className="text-blue-800">
          {t('subscriptionAlert.active.description', {
            plan: getPlanDisplayName(status.plan),
            days: status.daysRemaining,
            date: status.expirationDate?.toLocaleDateString(locale)
          })}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}