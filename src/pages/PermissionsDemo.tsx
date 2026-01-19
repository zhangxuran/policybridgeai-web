import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSubscription, getAllTierPermissions, getTierName, FEATURE_NAMES, type SubscriptionTier } from '@/lib/permissions';
import { FeatureGate } from '@/components/FeatureGate';
import { UsageIndicator } from '@/components/UsageIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Infinity as InfinityIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PermissionsDemo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, [user]);

  async function loadSubscription() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const subscription = await getUserSubscription(user.id);
      setCurrentTier(subscription.tier);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>请先登录以查看权限演示</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              前往登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allPermissions = getAllTierPermissions();
  const currentPermissions = allPermissions[currentTier];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">权限管理演示</h1>
          <p className="text-lg text-gray-600">
            当前套餐: <Badge variant="default" className="ml-2">{getTierName(currentTier)}</Badge>
          </p>
          <Button onClick={() => navigate('/pricing')} variant="outline">
            查看所有套餐
          </Button>
        </div>

        {/* Usage Indicator */}
        <div className="max-w-2xl mx-auto">
          <UsageIndicator />
        </div>

        {/* Feature Gates Demo */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">功能访问控制演示</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AI合同审查 */}
            <FeatureGate feature="contractReview">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">AI合同审查</CardTitle>
                  <CardDescription className="text-green-700">
                    您可以使用AI合同审查功能
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate('/ai-review')}>
                    开始审查
                  </Button>
                </CardContent>
              </Card>
            </FeatureGate>

            {/* 深度分析 */}
            <FeatureGate feature="advancedAnalysis">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">深度分析</CardTitle>
                  <CardDescription className="text-green-700">
                    您可以使用深度分析功能
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800">
                    深度分析提供更详细的合同风险评估和条款解读
                  </p>
                </CardContent>
              </Card>
            </FeatureGate>

            {/* 自定义模板 */}
            <FeatureGate feature="customTemplates">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">自定义模板</CardTitle>
                  <CardDescription className="text-green-700">
                    您可以创建和使用自定义审查模板
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800">
                    根据您的业务需求定制专属的合同审查模板
                  </p>
                </CardContent>
              </Card>
            </FeatureGate>

            {/* 批量处理 */}
            <FeatureGate feature="batchProcessing">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">批量处理</CardTitle>
                  <CardDescription className="text-green-700">
                    您可以批量上传和处理多个合同
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800">
                    一次性上传多个合同文件，提高工作效率
                  </p>
                </CardContent>
              </Card>
            </FeatureGate>
          </div>
        </div>

        {/* Permissions Table */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">当前套餐权限详情</h2>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(currentPermissions).map(([key, value]) => {
                  const featureName = FEATURE_NAMES[key as keyof typeof FEATURE_NAMES];
                  
                  return (
                    <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                      <span className="text-sm font-medium text-gray-700">{featureName}</span>
                      <div className="flex items-center gap-2">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Badge variant="default" className="bg-green-500">
                              <Check className="h-3 w-3 mr-1" />
                              可用
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="h-3 w-3 mr-1" />
                              不可用
                            </Badge>
                          )
                        ) : typeof value === 'number' ? (
                          value === -1 ? (
                            <Badge variant="default" className="bg-blue-500 flex items-center gap-1">
                              <InfinityIcon className="h-3 w-3" />
                              无限
                            </Badge>
                          ) : (
                            <Badge variant="outline">{value}</Badge>
                          )
                        ) : (
                          <Badge variant="outline">{String(value)}</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">套餐对比</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">功能</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">试用版</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">进阶版</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">高级版</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">企业版</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(FEATURE_NAMES).map((key, index) => {
                  const featureName = FEATURE_NAMES[key as keyof typeof FEATURE_NAMES];
                  
                  return (
                    <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 text-sm text-gray-700">{featureName}</td>
                      {(['starter', 'basic', 'standard', 'enterprise'] as SubscriptionTier[]).map((tier) => {
                        const value = allPermissions[tier][key as keyof typeof allPermissions.starter];
                        
                        return (
                          <td key={tier} className="px-4 py-3 text-center">
                            {typeof value === 'boolean' ? (
                              value ? (
                                <Check className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-gray-300 mx-auto" />
                              )
                            ) : typeof value === 'number' ? (
                              value === -1 ? (
                                <div className="flex items-center justify-center gap-1">
                                  <InfinityIcon className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs text-blue-600 font-medium">无限</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-700">{value}</span>
                              )
                            ) : (
                              <span className="text-sm text-gray-700">{String(value)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}