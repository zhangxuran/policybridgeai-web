/**
 * Subscription Management Utility
 * Handles subscription expiration, reminders, and auto-downgrade logic
 */

import { supabase } from './supabase';

export type SubscriptionPlan = 'free' | 'professional' | 'enterprise';

export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  isExpired: boolean;
  isExpiringToday: boolean;
  daysRemaining: number;
  expirationDate: Date | null;
  showRenewalReminder: boolean;
  purchaseDate: Date | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  package_name: string;
  package_type: string;
  contracts_count: number;
  used_contracts: number;
  bonus_contracts: number;
  validity_period: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface SubscriptionStatusCheck {
  isActive: boolean;
  remaining: number;
  hasExpired: boolean;
}

// Subscription duration in days
const SUBSCRIPTION_DURATION: Record<SubscriptionPlan, number> = {
  free: 0,
  professional: 30, // Monthly plan
  enterprise: 365, // Annual plan
};

// For weekly plan, we'll use 7 days
const WEEKLY_PLAN_DURATION = 7;

/**
 * Calculate subscription status based on purchase date and plan
 */
export function calculateSubscriptionStatus(
  plan: SubscriptionPlan,
  purchaseDate: string | null,
  planDuration?: number // Optional: for weekly plan (7 days)
): SubscriptionStatus {
  // Free plan never expires
  if (plan === 'free' || !purchaseDate) {
    return {
      plan,
      isExpired: false,
      isExpiringToday: false,
      daysRemaining: Infinity,
      expirationDate: null,
      showRenewalReminder: false,
      purchaseDate: null,
    };
  }

  const purchase = new Date(purchaseDate);
  const now = new Date();
  
  // Use custom duration if provided (for weekly plan), otherwise use default
  const duration = planDuration || SUBSCRIPTION_DURATION[plan];
  
  // Calculate expiration date
  const expiration = new Date(purchase);
  expiration.setDate(expiration.getDate() + duration);

  // Calculate days remaining
  const timeDiff = expiration.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Check if expired
  const isExpired = daysRemaining <= 0;

  // Check if expiring today (daysRemaining === 1)
  const isExpiringToday = daysRemaining === 1;

  // Show renewal reminder 2 days before expiration
  const showRenewalReminder = daysRemaining > 0 && daysRemaining <= 2;

  return {
    plan: isExpired ? 'free' : plan,
    isExpired,
    isExpiringToday,
    daysRemaining: Math.max(0, daysRemaining),
    expirationDate: expiration,
    showRenewalReminder,
    purchaseDate: purchase,
  };
}

/**
 * Check if user has access to premium features
 */
export function hasPremiumAccess(subscriptionStatus: SubscriptionStatus): boolean {
  return !subscriptionStatus.isExpired && subscriptionStatus.plan !== 'free';
}

/**
 * Get user-friendly expiration message
 */
export function getExpirationMessage(status: SubscriptionStatus): string {
  if (status.plan === 'free') {
    return '您当前使用的是免费版';
  }

  if (status.isExpired) {
    return '您的订阅已过期，已自动降级为免费版';
  }

  if (status.showRenewalReminder) {
    return `您的订阅将在 ${status.daysRemaining} 天后过期，请及时续费`;
  }

  return `您的订阅还有 ${status.daysRemaining} 天到期`;
}

/**
 * Format subscription plan name for display
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  const names: Record<SubscriptionPlan, string> = {
    free: '免费版',
    professional: '专业版',
    enterprise: '企业版',
  };
  return names[plan];
}

/**
 * Get plan duration in days
 */
export function getPlanDuration(plan: SubscriptionPlan, isWeekly?: boolean): number {
  if (isWeekly && plan === 'professional') {
    return WEEKLY_PLAN_DURATION;
  }
  return SUBSCRIPTION_DURATION[plan];
}

/**
 * Get remaining contracts for user
 * This function is kept for backward compatibility with Navbar component
 */
export async function getRemainingContracts(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('contracts_count, used_contracts, bonus_contracts')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return 0;
    }

    const remaining = (data.contracts_count + data.bonus_contracts) - data.used_contracts;
    return Math.max(0, remaining);
  } catch (error) {
    console.error('Error getting remaining contracts:', error);
    return 0;
  }
}

/**
 * Get user subscription
 */
export async function getUserSubscription(userId: string): Promise<{ subscription: Subscription | null }> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return { subscription: null };
    }

    return { subscription: data as Subscription };
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    return { subscription: null };
  }
}

/**
 * Check subscription status
 */
export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatusCheck> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return {
        isActive: false,
        remaining: 0,
        hasExpired: true,
      };
    }

    const remaining = (data.contracts_count + data.bonus_contracts) - data.used_contracts;
    const now = new Date();
    const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
    const hasExpired = expiresAt ? now > expiresAt : false;

    return {
      isActive: data.is_active && !hasExpired,
      remaining: Math.max(0, remaining),
      hasExpired,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      isActive: false,
      remaining: 0,
      hasExpired: true,
    };
  }
}