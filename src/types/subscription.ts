// 订阅管理类型定义

export type PackageType = 
  | 'starter'           // 试用版
  | 'basic'             // 进阶版
  | 'standard'          // 高级版
  | 'enterprise'        // 企业版
  | 'basic_booster'     // 进阶版加油包
  | 'standard_booster'; // 高级版加油包

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface Subscription {
  subscription_id: string;
  user_id: string;
  order_id?: string;
  
  // 套餐信息
  package_type: PackageType;
  package_name: string;
  
  // 状态
  status: SubscriptionStatus;
  
  // 次数管理
  total_contracts: number;
  used_contracts: number;
  remaining_contracts: number;
  
  // 时间管理
  start_date: string;
  end_date?: string;
  last_renewed_at?: string;
  
  // 订阅设置
  auto_renew: boolean;
  is_trial: boolean;
  
  // 元数据
  created_at: string;
  updated_at: string;
}

export interface UsageHistory {
  usage_id: string;
  user_id: string;
  subscription_id?: string;
  
  contract_name: string;
  contract_file_url?: string;
  report_url?: string;
  
  risk_score?: number;
  issues_found?: number;
  
  used_at: string;
  created_at: string;
}

export interface BoosterPack {
  booster_id: string;
  user_id: string;
  order_id?: string;
  
  package_type: 'basic_booster' | 'standard_booster';
  contracts_count: number;
  amount: number;
  
  used_contracts: number;
  remaining_contracts: number;
  
  status: 'active' | 'depleted';
  
  purchased_at: string;
  created_at: string;
}

export interface SubscriptionStatusCheck {
  isActive: boolean;
  hasContracts: boolean;
  remaining: number;
  expiresAt: Date | null;
  packageType?: PackageType;
  canPurchaseBooster: boolean;
  boosterPrice?: number;
}

export interface PricingTier {
  id: PackageType;
  name: string;
  price: number;
  period: string;
  contracts: number;
  bonus: number;
  validity?: string;
  accumulate?: boolean;
  boosterPack?: {
    price: number;
    contracts: number;
  };
  features: string[];
  limitations?: string[];
  unitCost: string;
  popular?: boolean;
}