import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/lib/orders';
import { getPricingTiers } from '@/lib/pricingData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Sparkles, Zap, Crown, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

export default function Pricing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  // 获取当前语言
  const currentLanguage = i18n.language;
  const isChinese = currentLanguage === 'zh';
  
  // 根据语言获取货币符号和货币代码
  const currencySymbol = isChinese ? '¥' : '€';
  const currencyCode = isChinese ? 'CNY' : 'EUR';

  const pricingTiers = getPricingTiers(t, currentLanguage);

  const handlePurchase = async (tierId: string) => {
    console.log('Purchase initiated:', { tierId, user: user?.id, language: currentLanguage, currency: currencyCode });

    // Free tier - just show info
    if (tierId === 'free') {
      toast.info(t('pricing.toasts.freeNoNeed'), {
        description: t('pricing.toasts.freeDescription'),
      });
      return;
    }

    // Enterprise tier - contact us
    if (tierId === 'enterprise') {
      toast.info(t('pricing.toasts.enterpriseCustom'), {
        description: t('pricing.toasts.enterpriseDescription'),
      });
      return;
    }

    if (!user) {
      console.log('User not authenticated, redirecting to login');
      toast.error(t('pricing.toasts.loginRequired'));
      navigate('/login');
      return;
    }

    setLoadingTier(tierId);

    try {
      const tier = pricingTiers.find(t => t.id === tierId);
      if (!tier) {
        console.error('Tier not found:', tierId);
        throw new Error(t('pricing.toasts.tierNotFound'));
      }

      console.log('Found tier:', tier);

      // Determine validity period based on package type
      let validityPeriod = 0;
      if (tierId === 'professional') {
        validityPeriod = 7; // 7 days for weekly
      } else if (tierId === 'monthly') {
        validityPeriod = 30; // 30 days for monthly
      } else if (tierId === 'yearly') {
        validityPeriod = 365; // 365 days for yearly
      }

      const orderData = {
        userId: user.id,
        packageName: tier.name,
        packageType: tierId,
        amount: tier.price,
        contractsCount: tier.contracts,
        bonusContracts: tier.bonus,
        validityPeriod,
        currency: currencyCode, // 传递货币代码
        language: currentLanguage, // 传递用户语言
      };

      console.log('Creating order with data:', orderData);

      const result = await createOrder(orderData);

      console.log('Create order result:', result);

      if (result.success && result.order) {
        toast.success(t('pricing.orderCreated'));
        console.log('Navigating to order:', result.order.order_id);
        navigate(`/orders/${result.order.order_id}`);
      } else {
        throw new Error(result.message || t('pricing.toasts.orderFailed'));
      }
    } catch (error) {
      console.error('Purchase error:', error);
      
      let errorMessage = t('pricing.toasts.retryLater');
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide user-friendly error messages
        if (error.message.includes('not authenticated') || error.message.includes('JWT')) {
          errorMessage = t('pricing.toasts.sessionExpired');
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
          errorMessage = t('pricing.toasts.systemInitializing');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = t('pricing.toasts.networkError');
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = t('pricing.toasts.permissionDenied');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
      
      toast.error(t('pricing.toasts.purchaseFailed'), {
        description: errorMessage,
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const getTierIcon = (tierId: string) => {
    const icons = {
      free: Sparkles,
      professional: Zap,
      monthly: Crown,
      yearly: Crown,
      enterprise: Building2,
    };
    return icons[tierId as keyof typeof icons] || Zap;
  };

  const getTierColor = (tierId: string) => {
    const colors = {
      free: 'from-gray-100 to-gray-200',
      professional: 'from-blue-100 to-blue-200',
      monthly: 'from-purple-100 to-purple-200',
      yearly: 'from-indigo-100 to-indigo-200',
      enterprise: 'from-amber-100 to-amber-200',
    };
    return colors[tierId as keyof typeof colors] || 'from-blue-100 to-indigo-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {pricingTiers.map((tier) => {
              const TierIcon = getTierIcon(tier.id);
              const isLoading = loadingTier === tier.id;
              const colorClass = getTierColor(tier.id);

              return (
                <Card
                  key={tier.id}
                  className="relative shadow-lg hover:shadow-xl transition-all duration-300 border-gray-200"
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto mb-4 w-16 h-16 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center`}>
                      <TierIcon className="w-8 h-8 text-gray-700" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                    {tier.period && (
                      <CardDescription className="text-sm">{tier.period}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      {tier.price > 0 ? (
                        <>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold text-gray-900">
                              {currencySymbol}{tier.price}
                            </span>
                            {tier.id === 'monthly' && (
                              <span className="text-gray-500">{t('pricing.perMonth')}</span>
                            )}
                            {tier.id === 'yearly' && (
                              <span className="text-gray-500">{t('pricing.perYear')}</span>
                            )}
                            {tier.id === 'professional' && (
                              <span className="text-gray-500">{t('pricing.perWeek')}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-2">{tier.unitCost}</p>
                        </>
                      ) : tier.id === 'free' ? (
                        <div className="text-3xl font-bold text-gray-900">{t('pricing.free')}</div>
                      ) : (
                        <div className="text-3xl font-bold text-gray-900">{t('pricing.contactUs')}</div>
                      )}
                    </div>

                    {/* Contracts Info */}
                    {tier.id !== 'free' && tier.id !== 'enterprise' && (
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {t('pricing.unlimited')}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {t('pricing.fullCaseFollowUp')}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Features */}
                    <div className="space-y-3 min-h-[280px]">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {!feature.match(/^[✅❌🔑]/u) && (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      onClick={() => handlePurchase(tier.id)}
                      disabled={isLoading}
                      className={`w-full ${
                        tier.id === 'free'
                          ? 'bg-gray-500 hover:bg-gray-600'
                          : ''
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('pricing.processing')}
                        </>
                      ) : tier.id === 'free' ? (
                        t('pricing.freeUse')
                      ) : tier.id === 'enterprise' ? (
                        t('pricing.contactUs')
                      ) : (
                        t('pricing.buyNow')
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Feature Comparison Link */}
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/feature-comparison')}
              className="shadow-md"
            >
              {t('pricing.viewDetailedComparison')}
            </Button>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">{t('pricing.faq.title')}</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('pricing.faq.q1.question')}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <p>{t('pricing.faq.q1.answer')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('pricing.faq.q2.question')}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <p>{t('pricing.faq.q2.answer')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('pricing.faq.q3.question')}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <p>{t('pricing.faq.q3.answer')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('pricing.faq.q4.question')}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <p>{t('pricing.faq.q4.answer')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('pricing.faq.q5.question')}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  <p>{t('pricing.faq.q5.answer')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}