import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowRight } from 'lucide-react';

interface PriceComparisonProps {
  onCTAClick: () => void;
}

export default function PriceComparison({ onCTAClick }: PriceComparisonProps) {
  const comparison = [
    {
      title: '传统律师审核',
      price: '¥3,000 - 5,000',
      period: '每份合同',
      features: [
        { text: '审核周期3-7天', available: true },
        { text: '人工逐条审查', available: true },
        { text: '专业法律意见', available: true },
        { text: '24小时快速响应', available: false },
        { text: '批量审核折扣', available: false },
        { text: '实时风险预警', available: false },
      ],
      highlight: false,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
    },
    {
      title: 'AI智能审核',
      price: '¥199',
      period: '每份合同',
      features: [
        { text: '3分钟完成审核', available: true },
        { text: 'AI智能分析', available: true },
        { text: '20+风险类型识别', available: true },
        { text: '24小时随时使用', available: true },
        { text: '批量审核更优惠', available: true },
        { text: '实时风险预警', available: true },
      ],
      highlight: true,
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-500',
      badge: '推荐方案',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            成本对比：
            <span className="text-blue-600"> 节省90%审核费用</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            同样的专业审核，AI让您的成本降低至原来的1/10
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {comparison.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.bgColor} border-2 ${plan.borderColor} ${
                plan.highlight ? 'shadow-2xl scale-105 lg:scale-110' : 'shadow-lg'
              } transition-all duration-300 hover:shadow-xl`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">{plan.title}</CardTitle>
                <div className="space-y-2">
                  <div className="text-5xl font-extrabold text-gray-900">{plan.price}</div>
                  <div className="text-gray-600">{plan.period}</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.available ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.available ? 'text-gray-700' : 'text-gray-400 line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.highlight && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group mt-6"
                    onClick={onCTAClick}
                  >
                    立即开始免费试用
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">批量审核更优惠</h3>
            <p className="text-gray-700 text-lg">
              月度套餐：10份合同仅需 <span className="font-bold text-blue-600">¥1,990</span>（单份¥199）
              <br />
              年度套餐：100份合同仅需 <span className="font-bold text-blue-600">¥19,900</span>（单份¥199）
            </p>
            <p className="text-sm text-gray-600">企业定制方案请联系我们获取专属报价</p>
          </div>
        </div>
      </div>
    </section>
  );
}