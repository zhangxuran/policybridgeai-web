import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">支付已取消</CardTitle>
          <CardDescription>
            您已取消本次支付，订单仍然保留
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">订单ID</p>
              <p className="font-mono text-sm mt-1">{orderId}</p>
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 您可以随时返回订单详情页继续完成支付
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate(orderId ? `/orders/${orderId}` : '/orders')}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回订单
            </Button>
            <Button
              onClick={() => navigate('/pricing')}
              variant="outline"
              className="flex-1"
            >
              查看套餐
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}