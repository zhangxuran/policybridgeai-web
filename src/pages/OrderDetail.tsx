import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderById } from '@/lib/orders';
import { createCheckoutSession } from '@/lib/stripe';
import type { Order } from '@/types/order';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  CreditCard, 
  FileText, 
  Package, 
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useTranslation } from 'react-i18next';

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error(t('orderDetail.errors.loginRequired'));
      navigate('/login');
      return;
    }

    if (!orderId) {
      toast.error(t('orderDetail.errors.invalidOrderId'));
      navigate('/orders');
      return;
    }

    loadOrder();
  }, [orderId, user, navigate]);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const result = await getOrderById(orderId);
      
      console.log('=== getOrderById Result ===');
      console.log('Success:', result.success);
      console.log('Full result:', result);
      console.log('=========================');
      
      if (!result.success || !result.order) {
        toast.error(result.message || t('orderDetail.errors.orderNotFound'));
        navigate('/orders');
        return;
      }

      setOrder(result.order);
      
      console.log('=== Order Debug Info ===');
      console.log('Full order data:', result.order);
      console.log('Package type:', result.order.package_type);
      console.log('Package name:', result.order.package_name);
      console.log('Contracts count:', result.order.contracts_count);
      console.log('Bonus contracts:', result.order.bonus_contracts);
      console.log('Currency:', result.order.currency);
      console.log('Language:', result.order.language);
      console.log('========================');
    } catch (error) {
      console.error('Load order error:', error);
      toast.error(t('orderDetail.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    setPaying(true);
    try {
      console.log('Starting payment for order:', order.order_id);
      console.log('Order currency from DB:', order.currency);
      console.log('Order language from DB:', order.language);
      console.log('Order package_type from DB:', order.package_type);
      console.log('Current i18n language:', i18n.language);

      // 智能货币检测：如果订单没有货币信息（旧订单），根据当前语言设置货币
      const currentLanguage = i18n.language;
      const isChinese = currentLanguage === 'zh';
      
      // 如果订单有货币信息，使用订单的货币；否则根据当前语言推断
      const effectiveCurrency = order.currency || (isChinese ? 'CNY' : 'EUR');
      const effectiveLanguage = order.language || currentLanguage;

      console.log('=== Payment Currency Logic ===');
      console.log('Order has currency?', !!order.currency);
      console.log('Current language:', currentLanguage);
      console.log('Is Chinese?', isChinese);
      console.log('Effective currency:', effectiveCurrency);
      console.log('Effective language:', effectiveLanguage);
      console.log('Package type:', order.package_type);
      console.log('==============================');

      // 支持卡和支付宝两种支付方式
      const paymentMethods = ['card', 'alipay'];

      const session = await createCheckoutSession({
        orderId: order.order_id,
        amount: order.amount,
        packageName: order.package_name,
        orderNumber: order.order_number,
        packageType: order.package_type, // 传递套餐类型，让 Edge Function 重新计算价格
        currency: effectiveCurrency,
        language: effectiveLanguage,
        paymentMethods: paymentMethods, // 传递支付方式
      });

      console.log('Checkout session created:', session);

      if (session.url) {
        console.log('Redirecting to:', session.url);
        window.location.href = session.url;
      } else {
        throw new Error(t('orderDetail.errors.noPaymentUrl'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = t('orderDetail.errors.paymentFailed');
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes('not configured') || error.message.includes('配置')) {
          errorMessage = t('orderDetail.errors.stripeNotConfigured');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = t('orderDetail.errors.networkError');
        }
      }
      
      toast.error(t('orderDetail.errors.paymentFailedTitle'), {
        description: errorMessage,
      });
    } finally {
      setPaying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('orderDetail.status.pending'), variant: 'secondary' as const, icon: Clock },
      paid: { label: t('orderDetail.status.paid'), variant: 'default' as const, icon: CheckCircle2 },
      cancelled: { label: t('orderDetail.status.cancelled'), variant: 'destructive' as const, icon: XCircle },
      refunded: { label: t('orderDetail.status.refunded'), variant: 'outline' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadInvoice = () => {
    toast.info(t('orderDetail.invoice.downloadInProgress'));
  };

  // 根据订单的货币显示正确的货币符号，如果订单没有货币信息，根据当前语言推断
  const getCurrencySymbol = (currency?: string) => {
    if (currency) {
      return currency === 'EUR' ? '€' : '¥';
    }
    // 如果订单没有货币信息（旧订单），根据当前语言推断
    return i18n.language === 'zh' ? '¥' : '€';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('orderDetail.errors.orderNotFound')}</h2>
            <Button onClick={() => navigate('/orders')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('orderDetail.actions.backToOrders')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 判断是否为付费会员(周会员、月会员、年会员)
  console.log('=== Paid Member Check ===');
  console.log('Checking paid member status for:', order.package_type);
  const isPaidMember = ['professional', 'monthly', 'yearly'].includes(order.package_type);
  console.log('Is paid member:', isPaidMember);
  console.log('========================');

  const currencySymbol = getCurrencySymbol(order.currency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/orders')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('orderDetail.actions.backToOrders')}
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('orderDetail.title')}</h1>
                <p className="text-gray-600 mt-1">{t('orderDetail.orderNumber')}{order.order_number}</p>
              </div>
              {getStatusBadge(order.order_status)}
            </div>
          </div>

          <div className="grid gap-6">
            {/* Order Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('orderDetail.sections.orderInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('orderDetail.fields.packageName')}</p>
                    <p className="font-medium">{order.package_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('orderDetail.fields.amount')}</p>
                    <p className="font-medium text-lg text-blue-600">{currencySymbol}{order.amount}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('orderDetail.fields.createdAt')}</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  {order.updated_at && (
                    <div>
                      <p className="text-sm text-gray-600">{t('orderDetail.fields.updatedAt')}</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(order.updated_at)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Package Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t('orderDetail.sections.packageDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('orderDetail.fields.contractsCount')}</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {isPaidMember ? t('orderDetail.unlimited') : `${order.contracts_count || 0}${t('orderDetail.contractsUnit')}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('orderDetail.fields.actualReceived')}</p>
                      <p className="text-2xl font-bold text-green-600">
                        {isPaidMember ? t('orderDetail.unlimited') : `${(order.contracts_count || 0) + (order.bonus_contracts || 0)}${t('orderDetail.contractsUnit')}`}
                      </p>
                    </div>
                  </div>
                </div>

                {order.validity_period > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{t('orderDetail.fields.validityPeriod', { months: Math.round(order.validity_period / 30) })}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Actions */}
            {order.order_status === 'pending' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <CreditCard className="w-5 h-5" />
                    {t('orderDetail.payment.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('orderDetail.payment.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handlePayment}
                    disabled={paying}
                    size="lg"
                    className="w-full"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('orderDetail.payment.processing')}
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t('orderDetail.payment.payNow')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Invoice Download */}
            {order.order_status === 'paid' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    {t('orderDetail.invoice.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleDownloadInvoice}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t('orderDetail.invoice.download')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}