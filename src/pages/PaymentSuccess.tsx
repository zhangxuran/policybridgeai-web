import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // 倒计时自动跳转
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">支付成功！</CardTitle>
          <CardDescription>
            您的订单已支付成功，感谢您的购买
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">订单ID</p>
              <p className="font-mono text-sm mt-1">{orderId}</p>
            </div>
          )}
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {countdown > 0 ? (
              <p>{countdown} 秒后自动跳转到订单列表...</p>
            ) : (
              <p>正在跳转...</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/orders')}
              className="flex-1"
            >
              查看订单
            </Button>
            <Button
              onClick={() => navigate('/pricing')}
              variant="outline"
              className="flex-1"
            >
              继续购买
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}