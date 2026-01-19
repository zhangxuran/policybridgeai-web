import { supabase } from './supabase';

/**
 * 订阅套餐类型 - 与数据库 package_type 字段对应
 */
export type SubscriptionTier = 'none' | 'free' | 'professional' | 'monthly' | 'yearly' | 'enterprise';

/**
 * 功能权限配置
 */
export interface FeaturePermissions {
  contractReview: boolean;           // AI合同审查
  contractReviewLimit: number;       // 月度次数限制 (-1表示无限)
  canUploadContract: boolean;        // 是否可以上传合同
  advancedAnalysis: boolean;         // 深度分析
  customTemplates: boolean;          // 自定义模板
  batchProcessing: boolean;          // 批量处理
  apiAccess: boolean;                // API访问
  prioritySupport: boolean;          // 优先支持
  teamMembers: number;               // 团队成员数
  sharedWorkspace: boolean;          // 共享工作区
  exportReports: boolean;            // 导出报告
  dataRetention: number;             // 数据保留天数
  advancedReports: boolean;          // 高级报告
}

/**
 * 各套餐权限配置
 */
const TIER_PERMISSIONS: Record<SubscriptionTier, FeaturePermissions> = {
  none: {
    contractReview: false,
    contractReviewLimit: 0,
    canUploadContract: false,
    advancedAnalysis: false,
    customTemplates: false,
    batchProcessing: false,
    apiAccess: false,
    prioritySupport: false,
    teamMembers: 1,
    sharedWorkspace: false,
    exportReports: false,
    dataRetention: 0,
    advancedReports: false,
  },
  free: {
    contractReview: true,
    contractReviewLimit: 0,  // 体验版只能文字交流，不能上传
    canUploadContract: false, // 不能上传合同
    advancedAnalysis: false,
    customTemplates: false,
    batchProcessing: false,
    apiAccess: false,
    prioritySupport: false,
    teamMembers: 1,
    sharedWorkspace: false,
    exportReports: false,
    dataRetention: 30,
    advancedReports: false,
  },
  professional: {
    contractReview: true,
    contractReviewLimit: -1, // 单次购买,使用 total_contracts
    canUploadContract: true,  // 可以上传合同
    advancedAnalysis: true,
    customTemplates: true,
    batchProcessing: false,
    apiAccess: false,
    prioritySupport: false,
    teamMembers: 1,
    sharedWorkspace: false,
    exportReports: true,
    dataRetention: 90,
    advancedReports: true,
  },
  monthly: {
    contractReview: true,
    contractReviewLimit: -1,  // 无限次数
    canUploadContract: true,   // 可以上传合同
    advancedAnalysis: true,
    customTemplates: true,
    batchProcessing: true,
    apiAccess: false,
    prioritySupport: false,
    teamMembers: 3,
    sharedWorkspace: true,
    exportReports: true,
    dataRetention: 180,
    advancedReports: true,
  },
  yearly: {
    contractReview: true,
    contractReviewLimit: -1,  // 无限次数
    canUploadContract: true,   // 可以上传合同
    advancedAnalysis: true,
    customTemplates: true,
    batchProcessing: true,
    apiAccess: true,
    prioritySupport: false,
    teamMembers: 5,
    sharedWorkspace: true,
    exportReports: true,
    dataRetention: 365,
    advancedReports: true,
  },
  enterprise: {
    contractReview: true,
    contractReviewLimit: -1, // 无限
    canUploadContract: true,  // 可以上传合同
    advancedAnalysis: true,
    customTemplates: true,
    batchProcessing: true,
    apiAccess: true,
    prioritySupport: true,
    teamMembers: -1, // 无限
    sharedWorkspace: true,
    exportReports: true,
    dataRetention: 365,
    advancedReports: true,
  },
};

/**
 * 套餐中文名称
 */
const TIER_NAMES: Record<SubscriptionTier, string> = {
  none: '未订阅',
  free: '体验版',
  professional: '专业版',
  monthly: '月度版',
  yearly: '年度版',
  enterprise: '企业版',
};

/**
 * 用户订阅信息
 */
export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  isActive: boolean;
  contractsUsed: number;
  contractsLimit: number;
  expiresAt?: string;
}

/**
 * 使用限制检查结果
 */
export interface UsageLimitCheck {
  hasAccess: boolean;
  used: number;
  limit: number;
  remaining: number;
  message: string;
}

/**
 * 获取用户订阅信息
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  try {
    console.log('🔍 Getting subscription for user:', userId);

    const { data, error } = await supabase
      .from('app_fdc7c677a7_user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching subscription:', error);
      return {
        userId,
        tier: 'none',
        isActive: false,
        contractsUsed: 0,
        contractsLimit: 0,
      };
    }

    if (!data) {
      console.log('ℹ️ No subscription found, returning none tier');
      return {
        userId,
        tier: 'none',
        isActive: false,
        contractsUsed: 0,
        contractsLimit: 0,
      };
    }

    // 使用 package_type 而不是 subscription_tier
    const tier = data.package_type as SubscriptionTier;
    const permissions = TIER_PERMISSIONS[tier];

    // 对于 professional 套餐,使用 total_contracts 作为限制
    // 对于 monthly 和 yearly 套餐,使用 -1 表示无限
    let contractsLimit: number;
    if (tier === 'professional') {
      contractsLimit = data.total_contracts;
    } else if (tier === 'monthly' || tier === 'yearly') {
      contractsLimit = -1; // 无限次数
    } else {
      contractsLimit = permissions.contractReviewLimit;
    }

    console.log('✅ Subscription found:', {
      tier,
      isActive: data.is_active,
      used: data.used_contracts,
      total: data.total_contracts,
      remaining: data.remaining_contracts,
      limit: contractsLimit,
    });

    return {
      userId: data.user_id,
      tier,
      isActive: data.is_active,
      contractsUsed: data.used_contracts || 0,
      contractsLimit,
      expiresAt: data.expires_at,
    };
  } catch (error) {
    console.error('❌ Unexpected error getting subscription:', error);
    return {
      userId,
      tier: 'none',
      isActive: false,
      contractsUsed: 0,
      contractsLimit: 0,
    };
  }
}

/**
 * 获取用户权限配置
 */
export async function getUserPermissions(userId: string): Promise<FeaturePermissions> {
  const subscription = await getUserSubscription(userId);

  if (!subscription.isActive) {
    console.log('⚠️ Subscription not active, returning none permissions');
    return TIER_PERMISSIONS.none;
  }

  return TIER_PERMISSIONS[subscription.tier];
}

/**
 * 检查用户是否有权限访问某个功能
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof FeaturePermissions
): Promise<{ hasAccess: boolean; message: string }> {
  const permissions = await getUserPermissions(userId);
  const hasAccess = permissions[feature] as boolean;

  if (!hasAccess) {
    const subscription = await getUserSubscription(userId);
    
    // 特殊处理：体验版用户尝试上传合同时的提示
    if (feature === 'canUploadContract' && subscription.tier === 'free') {
      return {
        hasAccess: false,
        message: '体验版仅支持文字交流，上传合同功能需要升级到专业版或更高套餐',
      };
    }
    
    const upgradeTier = getUpgradeSuggestion(subscription.tier);

    return {
      hasAccess: false,
      message: `此功能需要 ${TIER_NAMES[upgradeTier]} 或更高套餐`,
    };
  }

  return {
    hasAccess: true,
    message: '有权限访问',
  };
}

/**
 * 检查用户使用次数限制
 */
export async function checkUsageLimit(userId: string): Promise<UsageLimitCheck> {
  const subscription = await getUserSubscription(userId);

  if (!subscription.isActive) {
    return {
      hasAccess: false,
      used: 0,
      limit: 0,
      remaining: 0,
      message: '请先订阅套餐',
    };
  }

  // 体验版不能上传合同
  if (subscription.tier === 'free') {
    return {
      hasAccess: false,
      used: 0,
      limit: 0,
      remaining: 0,
      message: '体验版仅支持文字交流，上传合同功能需要升级套餐',
    };
  }

  const limit = subscription.contractsLimit;
  const used = subscription.contractsUsed;

  // 无限次数 (月付、年付)
  if (limit === -1) {
    return {
      hasAccess: true,
      used,
      limit: -1,
      remaining: -1,
      message: '无限使用',
    };
  }

  const remaining = limit - used;

  if (remaining <= 0) {
    return {
      hasAccess: false,
      used,
      limit,
      remaining: 0,
      message: '使用次数已用完，请升级套餐或购买加油包',
    };
  }

  return {
    hasAccess: true,
    used,
    limit,
    remaining,
    message: `剩余 ${remaining} 次`,
  };
}

/**
 * 增加使用次数
 */
export async function incrementUsage(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('📊 Incrementing usage for user:', userId);

    const subscription = await getUserSubscription(userId);

    if (!subscription.isActive) {
      return {
        success: false,
        message: '订阅未激活',
      };
    }

    // 体验版不能上传合同
    if (subscription.tier === 'free') {
      return {
        success: false,
        message: '体验版不支持上传合同',
      };
    }

    // 月付和年付是无限次数，不需要增加计数
    if (subscription.contractsLimit === -1) {
      console.log('✅ Unlimited tier, skipping increment');
      return {
        success: true,
        message: '使用成功（无限次数）',
      };
    }

    // 检查是否还有剩余次数
    if (subscription.contractsUsed >= subscription.contractsLimit) {
      return {
        success: false,
        message: '使用次数已用完',
      };
    }

    const newUsed = subscription.contractsUsed + 1;
    const newRemaining = subscription.contractsLimit - newUsed;

    const { error } = await supabase
      .from('app_fdc7c677a7_user_subscriptions')
      .update({ 
        used_contracts: newUsed,
        remaining_contracts: newRemaining 
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error incrementing usage:', error);
      return {
        success: false,
        message: '更新使用次数失败',
      };
    }

    console.log('✅ Usage incremented:', { newUsed, newRemaining });

    return {
      success: true,
      message: `使用成功，剩余 ${newRemaining} 次`,
    };
  } catch (error) {
    console.error('❌ Unexpected error incrementing usage:', error);
    return {
      success: false,
      message: '更新使用次数失败',
    };
  }
}

/**
 * 获取套餐中文名称
 */
export function getTierName(tier: SubscriptionTier): string {
  return TIER_NAMES[tier];
}

/**
 * 获取升级建议
 */
export function getUpgradeSuggestion(currentTier: SubscriptionTier): SubscriptionTier {
  const tierOrder: SubscriptionTier[] = ['none', 'free', 'professional', 'monthly', 'yearly', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);

  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1];
  }

  return 'enterprise';
}

/**
 * 获取所有套餐权限配置（用于展示对比）
 */
export function getAllTierPermissions(): Record<SubscriptionTier, FeaturePermissions> {
  return TIER_PERMISSIONS;
}

/**
 * 功能名称映射
 */
export const FEATURE_NAMES: Record<keyof FeaturePermissions, string> = {
  contractReview: 'AI合同审查',
  contractReviewLimit: '月度审查次数',
  canUploadContract: '上传合同',
  advancedAnalysis: '深度分析',
  customTemplates: '自定义模板',
  batchProcessing: '批量处理',
  apiAccess: 'API访问',
  prioritySupport: '优先支持',
  teamMembers: '团队成员数',
  sharedWorkspace: '共享工作区',
  exportReports: '导出报告',
  dataRetention: '数据保留天数',
  advancedReports: '高级报告',
};
