import { AlertTriangle, DollarSign, Clock, TrendingUp } from 'lucide-react';

export default function PainPoints() {
  const painPoints = [
    {
      icon: AlertTriangle,
      title: '各国法律差异大',
      description: '不同国家的贸易法律法规复杂多变，难以全面掌握和及时更新',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: DollarSign,
      title: '律师费用高昂',
      description: '传统律师审核费用动辄数千至数万元，对中小企业来说是沉重负担',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Clock,
      title: '审核周期长',
      description: '传统律师审核通常需要3-7天，影响商业决策和交易进度',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: TrendingUp,
      title: '法律变化难追踪',
      description: '各国贸易法律频繁更新，企业难以及时了解最新法规变化，容易产生合同纠纷和财产损失',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            跨国贸易企业面临的挑战
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            国际贸易合同审核中的常见痛点
          </p>
        </div>

        {/* Pain points grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`${point.bgColor} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-7 w-7 ${point.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {point.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}