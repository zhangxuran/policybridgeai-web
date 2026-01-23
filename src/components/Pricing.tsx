import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/lib/orders';
import { pricingTiers } from '@/lib/pricingData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap, TrendingUp, Crown, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handlePurchase = async (tierId: string) => {
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    if (tierId === 'enterprise') {
      toast.info('企业版需要定制方案', {
        description: '请联系我们的销售团队获取报价',
      });
      return;
    }

    setLoadingTier(tierId);

    try {
      const tier = pricingTiers.find(t => t.id === tierId);
      if (!tier) throw new Error('套餐不存在');

      const totalContracts = tier.contracts + tier.bonus;
      const validityPeriod = tier.id === 'starter' ? 0 : 1;

      const result = await createOrder({
        userId: user.id,
        packageName: tier.name,
        packageType: tier.id,
        amount: tier.price,
        contractsCount: tier.contracts,
        bonusContracts: tier.bonus,
        validityPeriod,
      });

      if (result.success && result.order) {
        toast.success('订单创建成功');
        navigate(`/orders/${result.order.order_id}`);
      } else {
        throw new Error(result.message || '创建订单失败');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('购买失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const getTierIcon = (tierId: string) => {
    const icons = {
      starter: Zap,
      basic: TrendingUp,
      standard: Crown,
      enterprise: Building2,
    };
    return icons[tierId as keyof typeof icons] || Zap;
  };

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            灵活的订阅方案
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            从试用到企业，满足不同规模的需求
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier) => {
            const TierIcon = getTierIcon(tier.id);
            const isLoading = loadingTier === tier.id;

            return (
              <Card
                key={tier.id}
                className={`relative shadow-lg hover:shadow-xl transition-all duration-300 ${
                  tier.popular
                    ? 'border-2 border-blue-500 scale-105'
                    : 'border-gray-200'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1">
                      推荐
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <TierIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription>{tier.period}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center">
                    {tier.price > 0 ? (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-gray-900">
                            ¥{tier.price}
                          </span>
                          {tier.period !== '一次性' && (
                            <span className="text-gray-500">/{tier.period}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{tier.unitCost}</p>
                      </>
                    ) : (
                      <div className="text-3xl font-bold text-gray-900">面议</div>
                    )}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {tier.contracts + tier.bonus}次
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {tier.contracts}次 + 赠{tier.bonus}次
                    </div>
                    {tier.accumulate && (
                      <Badge variant="outline" className="mt-2 border-green-500 text-green-700 text-xs">
                        可累积
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {tier.features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {tier.limitations?.slice(0, 2).map((limitation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-400">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handlePurchase(tier.id)}
                    disabled={isLoading}
                    className={`w-full ${
                      tier.popular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : tier.id === 'enterprise' ? (
                      '联系我们'
                    ) : (
                      '立即购买'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="link"
            onClick={() => navigate('/feature-comparison')}
            className="text-blue-600"
          >
            查看完整功能对比 →
          </Button>
        </div>
      </div>
    </section>
  );
}