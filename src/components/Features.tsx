import { Database, RefreshCw, FileSearch, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Database,
      title: '完整法律数据库支持',
      description: '基于各国完整的贸易法律数据库，确保每条审核结论都有明确的法律依据，避免AI幻觉产生的错误建议',
      highlights: [
        '覆盖全球主要贸易国家法律',
        '每条结论标注法律依据',
        '避免AI随意推测',
      ],
      color: 'blue',
    },
    {
      icon: RefreshCw,
      title: '数据库持续更新',
      description: '法律数据库频繁更新，实时同步各国最新贸易法规变化，保护企业免受法律变更带来的合同风险',
      highlights: [
        '实时追踪法律变化',
        '自动更新审核标准',
        '提前预警法规风险',
      ],
      color: 'indigo',
    },
    {
      icon: FileSearch,
      title: '全面合同风险审核',
      description: '审核付款条款、交付责任、质量标准、知识产权、争议解决等各类合同条款，包括Incoterm等国际贸易术语',
      highlights: [
        '20+种风险类型识别',
        '多维度条款分析',
        '提供修改建议',
      ],
      color: 'purple',
    },
  ];

  const advantages = [
    {
      icon: Zap,
      title: '快速且高效',
      description: '3分钟完成审核，成本仅为传统律师的1/10',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Shield,
      title: '有据可依',
      description: '基于完整法律数据库，每条结论都标注法律依据',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      title: '持续更新',
      description: '数据库频繁更新，实时同步各国最新贸易法规',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            为什么选择PolicyBridge.AI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            基于完整法律数据库的AI审核系统，每条结论都有法律依据
          </p>
        </div>

        {/* Main features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: {
                icon: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                badge: 'bg-blue-100 text-blue-800',
              },
              indigo: {
                icon: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                badge: 'bg-indigo-100 text-indigo-800',
              },
              purple: {
                icon: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                badge: 'bg-purple-100 text-purple-800',
              },
            };
            const colors = colorClasses[feature.color as keyof typeof colorClasses];

            return (
              <div
                key={index}
                className={`bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border-2 ${colors.border} transform hover:-translate-y-2`}
              >
                <div className={`${colors.bg} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className={`h-8 w-8 ${colors.icon}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className={`h-5 w-5 ${colors.icon} mr-2 mt-0.5 flex-shrink-0`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Key advantages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                <div className={`${advantage.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${advantage.color}`} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {advantage.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {advantage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}