import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSubscription, checkSubscriptionStatus } from '@/lib/subscription';
import { createOrder } from '@/lib/orders';
import type { Subscription, SubscriptionStatusCheck } from '@/types/subscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, ShoppingCart, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

export default function BoosterPack() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [status, setStatus] = useState<SubscriptionStatusCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [subResult, statusResult] = await Promise.all([
        getUserSubscription(user.id),
        checkSubscriptionStatus(user.id),
      ]);

      setSubscription(subResult.subscription);
      setStatus(statusResult);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (boosterType: 'basic_booster' | 'standard_booster') => {
    if (!user || !subscription) return;

    setPurchasing(true);

    try {
      const config = {
        basic_booster: { name: '进阶版加油包', price: 99, contracts: 10 },
        standard_booster: { name: '高级版加油包', price: 79, contracts: 10 },
      };

      const { name, price, contracts } = config[boosterType];

      const result = await createOrder({
        userId: user.id,
        packageName: name,
        packageType: boosterType,
        amount: price,
        contractsCount: contracts,
        bonusContracts: 0,
        validityPeriod: 0,
      });

      if (result.success && result.order) {
        toast.success('订单创建成功');
        navigate(`/orders/${result.order.order_id}`);
      } else {
        throw new Error(result.message || '创建订单失败');
      }
    } catch (error) {
      console.error('Purchase booster pack error:', error);
      toast.error('购买失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                您还没有激活的订阅。加油包仅适用于订阅用户。
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate('/pricing')}
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              查看订阅方案
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 检查是否可以购买加油包
  const canPurchaseBasic = subscription.package_type === 'basic';
  const canPurchaseStandard = subscription.package_type === 'standard';

  if (!canPurchaseBasic && !canPurchaseStandard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                加油包功能仅适用于进阶版和高级版用户。
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate('/pricing')}
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              升级套餐
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              购买加油包
            </h1>
            <p className="text-xl text-gray-600">
              次数不够用？购买加油包立即补充审查次数
            </p>
          </div>

          {/* Current Status */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                当前订阅状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">当前套餐</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscription.package_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">剩余次数</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {status?.remaining || 0}次
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">本月已使用</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscription.used_contracts}次
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booster Pack Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Booster */}
            {canPurchaseBasic && (
              <Card className="shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">进阶版加油包</CardTitle>
                  <CardDescription>适用于进阶版订阅用户</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      ¥99
                    </div>
                    <p className="text-sm text-gray-500">¥9.9/次</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      10次
                    </div>
                    <p className="text-sm text-gray-600">合同审查次数</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">次数永久有效</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">不受订阅周期限制</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">可多次购买累积</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">享受所有订阅功能</span>
                    </div>
                  </div>

                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-sm">
                      加油包次数会在订阅次数用完后自动使用
                    </AlertDescription>
                  </Alert>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handlePurchase('basic_booster')}
                    disabled={purchasing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        立即购买
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Standard Booster */}
            {canPurchaseStandard && (
              <Card className="shadow-xl hover:shadow-2xl transition-shadow border-2 border-amber-500">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-1">
                    更优惠
                  </Badge>
                </div>

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-amber-600" />
                  </div>
                  <CardTitle className="text-2xl">高级版加油包</CardTitle>
                  <CardDescription>适用于高级版订阅用户</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      ¥79
                    </div>
                    <p className="text-sm text-gray-500">¥7.9/次</p>
                    <Badge variant="outline" className="mt-2 border-green-500 text-green-700">
                      比进阶版便宜¥20
                    </Badge>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-600 mb-1">
                      10次
                    </div>
                    <p className="text-sm text-gray-600">合同审查次数</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">次数永久有效</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">不受订阅周期限制</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">可多次购买累积</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">享受所有高级功能</span>
                    </div>
                  </div>

                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      高级版用户专享优惠价格，单次成本更低
                    </AlertDescription>
                  </Alert>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handlePurchase('standard_booster')}
                    disabled={purchasing}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        立即购买
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* FAQ */}
          <Card className="shadow-lg mt-8">
            <CardHeader>
              <CardTitle>常见问题</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">加油包次数什么时候使用？</h3>
                <p className="text-sm text-gray-600">
                  系统会优先使用订阅套餐中的次数，当订阅次数用完后，自动使用加油包次数。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">加油包有有效期吗？</h3>
                <p className="text-sm text-gray-600">
                  没有。加油包次数永久有效，不受订阅周期限制，可以放心购买。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">可以购买多个加油包吗？</h3>
                <p className="text-sm text-gray-600">
                  可以。您可以多次购买加油包，所有次数会自动累加。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">取消订阅后加油包还能用吗？</h3>
                <p className="text-sm text-gray-600">
                  不能。加油包需要配合有效订阅使用。如果取消订阅，加油包次数将无法使用，但会保留到您重新订阅时。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}