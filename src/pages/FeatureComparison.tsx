import { useNavigate } from 'react-router-dom';
import { featureComparison } from '@/lib/pricingData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function FeatureComparison() {
  const navigate = useNavigate();

  const renderFeatureValue = (value: string) => {
    if (value === '✅') {
      return <Check className="h-5 w-5 text-green-600 mx-auto" />;
    }
    if (value === '❌') {
      return <X className="h-5 w-5 text-gray-300 mx-auto" />;
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/pricing')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回订阅页面
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              功能对比详情
            </h1>
            <p className="text-xl text-gray-600">
              详细了解各套餐的功能差异，选择最适合您的方案
            </p>
          </div>

          {/* Comparison Table */}
          <Card className="shadow-xl mb-8">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-1/5 font-bold text-gray-900">
                        功能特性
                      </TableHead>
                      <TableHead className="text-center font-bold text-gray-900">
                        试用版
                        <Badge variant="outline" className="ml-2">
                          ¥59
                        </Badge>
                      </TableHead>
                      <TableHead className="text-center font-bold text-gray-900">
                        进阶版
                        <Badge className="ml-2 bg-blue-600">推荐</Badge>
                        <Badge variant="outline" className="ml-2">
                          ¥199/月
                        </Badge>
                      </TableHead>
                      <TableHead className="text-center font-bold text-gray-900">
                        高级版
                        <Badge variant="outline" className="ml-2">
                          ¥2199/年
                        </Badge>
                      </TableHead>
                      <TableHead className="text-center font-bold text-gray-900">
                        企业版
                        <Badge variant="outline" className="ml-2">
                          面议
                        </Badge>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featureComparison.map((category, categoryIndex) => (
                      <>
                        <TableRow
                          key={`category-${categoryIndex}`}
                          className="bg-blue-50"
                        >
                          <TableCell
                            colSpan={5}
                            className="font-bold text-blue-900"
                          >
                            {category.category}
                          </TableCell>
                        </TableRow>
                        {category.features.map((feature, featureIndex) => (
                          <TableRow
                            key={`feature-${categoryIndex}-${featureIndex}`}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              {feature.name}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderFeatureValue(feature.starter)}
                            </TableCell>
                            <TableCell className="text-center bg-blue-50/50">
                              {renderFeatureValue(feature.basic)}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderFeatureValue(feature.standard)}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderFeatureValue(feature.enterprise)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">试用版</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ 适合想要体验服务的用户</li>
                  <li>✅ 30天有效期，6次审查</li>
                  <li>✅ 基础功能完整</li>
                  <li>❌ 无历史记录和模板</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  进阶版
                  <Badge className="bg-blue-600">推荐</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ 适合个人用户和小团队</li>
                  <li>✅ 次数可累积，更灵活</li>
                  <li>✅ 包含历史记录和版本对比</li>
                  <li>✅ 可购买加油包扩展</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">高级版</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ 适合专业用户和中型团队</li>
                  <li>✅ 更多次数，更低单价</li>
                  <li>✅ 完整功能，包含API</li>
                  <li>✅ 团队协作和批量处理</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">企业版</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ 适合大型企业和机构</li>
                  <li>✅ 完全定制化方案</li>
                  <li>✅ 私有部署选项</li>
                  <li>✅ 专属技术支持</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                准备好开始了吗？
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                选择最适合您的方案，立即体验AI合同审查服务
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/pricing')}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  查看订阅方案
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  免费注册
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}