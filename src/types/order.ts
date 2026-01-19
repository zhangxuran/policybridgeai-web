export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type PackageType = 'free' | 'professional' | 'monthly' | 'yearly' | 'enterprise';

export interface Order {
  order_id: string;
  user_id: string;
  order_number: string;
  package_name: string;
  package_type: PackageType;
  amount: number;
  contracts_count: number;
  bonus_contracts: number;
  validity_period: number;
  order_status: OrderStatus;
  stripe_payment_id?: string;
  stripe_payment_intent?: string;
  currency?: string; // 新增: 货币类型 (CNY/EUR)
  language?: string; // 新增: 用户语言 (zh/en/fr/de/es/it)
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface UserSubscription {
  subscription_id: string;
  user_id: string;
  order_id: string;
  package_type: PackageType;
  total_contracts: number;
  used_contracts: number;
  remaining_contracts: number;
  is_active: boolean;
  activated_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatus {
  has_active_subscription: boolean;
  remaining_contracts: number;
  expires_at: string | null;
}