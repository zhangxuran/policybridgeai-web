import type { PricingTier } from '@/types/subscription';

export const getPricingTiers = (t: (key: string) => string, language: string = 'zh'): PricingTier[] => {
  // 判断是否为中文
  const isChinese = language === 'zh';
  
  // 根据语言设置价格
  const prices = isChinese ? {
    professional: 59,
    monthly: 199,
    yearly: 2199
  } : {
    professional: 9.9,
    monthly: 35,
    yearly: 399
  };

  return [
    {
      id: 'free',
      name: t('pricing.tiers.free.name'),
      price: 0,
      period: '',
      contracts: 0,
      bonus: 0,
      features: [
        t('pricing.tiers.free.features.role'),
        t('pricing.tiers.free.features.uploadSupport'),
        t('pricing.tiers.free.features.riskAssessment'),
        t('pricing.tiers.free.features.radar'),
        t('pricing.tiers.free.features.noConclusion'),
        t('pricing.tiers.free.features.noSolution'),
      ],
      limitations: [],
      unitCost: t('pricing.tiers.free.unitCost'),
    },
    {
      id: 'professional',
      name: t('pricing.tiers.professional.name'),
      price: prices.professional,
      period: t('pricing.tiers.professional.period'),
      contracts: 1,
      bonus: 0,
      features: [
        t('pricing.tiers.professional.features.positioning'),
        t('pricing.tiers.professional.features.legalConsulting'),
        t('pricing.tiers.professional.features.uploadSupport'),
        t('pricing.tiers.professional.features.fullRiskJudgment'),
        t('pricing.tiers.professional.features.riskDetails'),
        t('pricing.tiers.professional.features.decisionReference'),
        t('pricing.tiers.professional.features.caseAnalysis'),
      ],
      unitCost: t('pricing.tiers.professional.unitCost'),
    },
    {
      id: 'monthly',
      name: t('pricing.tiers.monthly.name'),
      price: prices.monthly,
      period: t('pricing.tiers.monthly.period'),
      contracts: 999,
      bonus: 0,
      accumulate: false,
      features: [
        t('pricing.tiers.monthly.features.positioning'),
        t('pricing.tiers.monthly.features.legalConsulting'),
        t('pricing.tiers.monthly.features.uploadSupport'),
        t('pricing.tiers.monthly.features.fullRiskJudgment'),
        t('pricing.tiers.monthly.features.riskDetails'),
        t('pricing.tiers.monthly.features.decisionReference'),
        t('pricing.tiers.monthly.features.caseAnalysis'),
        t('pricing.tiers.monthly.features.higherStability'),
        t('pricing.tiers.monthly.features.dedicatedSupport'),
      ],
      unitCost: t('pricing.tiers.monthly.unitCost'),
    },
    {
      id: 'yearly',
      name: t('pricing.tiers.yearly.name'),
      price: prices.yearly,
      period: t('pricing.tiers.yearly.period'),
      contracts: 999,
      bonus: 0,
      accumulate: false,
      features: [
        t('pricing.tiers.yearly.features.positioning'),
        t('pricing.tiers.yearly.features.legalConsulting'),
        t('pricing.tiers.yearly.features.uploadSupport'),
        t('pricing.tiers.yearly.features.fullRiskJudgment'),
        t('pricing.tiers.yearly.features.riskDetails'),
        t('pricing.tiers.yearly.features.decisionReference'),
        t('pricing.tiers.yearly.features.caseAnalysis'),
        t('pricing.tiers.yearly.features.higherStability'),
        t('pricing.tiers.yearly.features.longTermBusiness'),
        t('pricing.tiers.yearly.features.dedicatedSupport'),
      ],
      unitCost: t('pricing.tiers.yearly.unitCost'),
    },
    {
      id: 'enterprise',
      name: t('pricing.tiers.enterprise.name'),
      price: 0,
      period: t('pricing.tiers.enterprise.period'),
      contracts: 0,
      bonus: 0,
      features: [
        t('pricing.tiers.enterprise.features.positioning'),
        t('pricing.tiers.enterprise.features.systemIntegration'),
        t('pricing.tiers.enterprise.features.multiUser'),
        t('pricing.tiers.enterprise.features.apiIntegration'),
        t('pricing.tiers.enterprise.features.privateDeployment'),
        t('pricing.tiers.enterprise.features.dedicatedSupport'),
        t('pricing.tiers.enterprise.features.customDevelopment'),
        t('pricing.tiers.enterprise.features.sla'),
        t('pricing.tiers.enterprise.features.support247'),
      ],
      unitCost: t('pricing.tiers.enterprise.unitCost'),
    },
  ];
};

export const featureComparison = [
  {
    category: '基础功能',
    features: [
      {
        name: '合同上传',
        free: '✅',
        professional: '✅',
        monthly: '✅',
        yearly: '✅',
        enterprise: '✅ 定制',
      },
      {
        name: '合规风险判断',
        free: '❌',
        professional: '✅ 完整',
        monthly: '✅ 完整',
        yearly: '✅ 完整',
        enterprise: '✅ 定制',
      },
      {
        name: '风险分析详情',
        free: '❌',
        professional: '✅ 风险点+类型+原因',
        monthly: '✅ 风险点+类型+原因',
        yearly: '✅ 风险点+类型+原因',
        enterprise: '✅ 定制',
      },
    ],
  },
  {
    category: '审查功能',
    features: [
      {
        name: '法律咨询',
        free: '✅',
        professional: '✅',
        monthly: '✅',
        yearly: '✅',
        enterprise: '✅',
      },
      {
        name: '风险评估与预警',
        free: '✅',
        professional: '✅',
        monthly: '✅',
        yearly: '✅',
        enterprise: '✅',
      },
      {
        name: '案例分析',
        free: '❌',
        professional: '✅',
        monthly: '✅',
        yearly: '✅',
        enterprise: '✅',
      },
      {
        name: '金税四期合规雷达',
        free: '✅ 基础预警',
        professional: '✅ 完整方案',
        monthly: '✅ 完整方案',
        yearly: '✅ 完整方案',
        enterprise: '✅ 定制方案',
      },
    ],
  },
  {
    category: '系统优先级',
    features: [
      {
        name: '系统稳定性',
        free: '标准',
        professional: '标准',
        monthly: '更高',
        yearly: '更高',
        enterprise: '最高',
      },
      {
        name: '适用场景',
        free: '体验',
        professional: '短期集中',
        monthly: '稳定使用',
        yearly: '长期业务',
        enterprise: '企业定制',
      },
    ],
  },
  {
    category: '企业功能',
    features: [
      {
        name: '接入企业系统',
        free: '❌',
        professional: '❌',
        monthly: '❌',
        yearly: '❌',
        enterprise: '✅',
      },
      {
        name: '多用户管理',
        free: '❌',
        professional: '❌',
        monthly: '❌',
        yearly: '❌',
        enterprise: '✅',
      },
      {
        name: 'API接口',
        free: '❌',
        professional: '❌',
        monthly: '❌',
        yearly: '❌',
        enterprise: '✅',
      },
      {
        name: '私有化部署',
        free: '❌',
        professional: '❌',
        monthly: '❌',
        yearly: '❌',
        enterprise: '✅',
      },
    ],
  },
  {
    category: '客服支持',
    features: [
      {
        name: '客服支持',
        free: '社区支持',
        professional: '标准支持',
        monthly: '专属客服',
        yearly: '专属客服',
        enterprise: '专属经理+7×24h',
      },
    ],
  },
];