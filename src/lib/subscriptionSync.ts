/**
 * Subscription Synchronization Utility
 * Syncs subscription data between profiles table and app_fdc7c677a7_user_subscriptions table
 */

import { supabase } from './supabase';

export type SubscriptionPlan = 'free' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'cancelled';

/**
 * Map subscription_plan to package_type for user_subscriptions table
 */
function mapPlanToPackageType(plan: SubscriptionPlan): string {
  const mapping: Record<SubscriptionPlan, string> = {
    free: 'free',
    professional: 'professional',
    enterprise: 'enterprise',
  };
  return mapping[plan] || 'free';
}

/**
 * Get contract limits based on subscription plan
 */
function getContractLimits(plan: SubscriptionPlan): { total: number; unlimited: boolean } {
  switch (plan) {
    case 'free':
      return { total: 0, unlimited: false }; // Free tier: no upload capability
    case 'professional':
      return { total: -1, unlimited: true }; // Professional: unlimited
    case 'enterprise':
      return { total: -1, unlimited: true }; // Enterprise: unlimited
    default:
      return { total: 0, unlimited: false };
  }
}

/**
 * Sync subscription when admin updates user's subscription_plan in profiles table
 */
export async function syncSubscriptionOnUpdate(
  userId: string,
  newPlan: SubscriptionPlan,
  newStatus: SubscriptionStatus
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔄 Syncing subscription for user:', userId, { newPlan, newStatus });

    const packageType = mapPlanToPackageType(newPlan);
    const limits = getContractLimits(newPlan);
    const isActive = newStatus === 'active';

    // Check if user already has a subscription record
    const { data: existingSub, error: checkError } = await supabase
      .from('app_fdc7c677a7_user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing subscription:', checkError);
      return { success: false, message: 'Failed to check existing subscription' };
    }

    const now = new Date().toISOString();

    if (existingSub) {
      // Update existing subscription
      console.log('📝 Updating existing subscription...');
      
      const updateData: Record<string, string | number | boolean> = {
        package_type: packageType,
        is_active: isActive,
        updated_at: now,
      };

      // Only update contract limits if changing to/from free tier
      if (newPlan !== 'free') {
        updateData.total_contracts = limits.total;
        updateData.remaining_contracts = limits.unlimited ? -1 : limits.total - (existingSub.used_contracts || 0);
      } else {
        // Free tier: reset to 0
        updateData.total_contracts = 0;
        updateData.remaining_contracts = 0;
      }

      const { error: updateError } = await supabase
        .from('app_fdc7c677a7_user_subscriptions')
        .update(updateData)
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Error updating subscription:', updateError);
        return { success: false, message: 'Failed to update subscription' };
      }

      console.log('✅ Subscription updated successfully');
    } else {
      // Create new subscription record
      console.log('➕ Creating new subscription record...');
      
      const insertData = {
        user_id: userId,
        package_type: packageType,
        package_name: getPlanDisplayName(newPlan),
        total_contracts: limits.total,
        used_contracts: 0,
        remaining_contracts: limits.unlimited ? -1 : limits.total,
        is_active: isActive,
        created_at: now,
        updated_at: now,
      };

      const { error: insertError } = await supabase
        .from('app_fdc7c677a7_user_subscriptions')
        .insert(insertData);

      if (insertError) {
        console.error('❌ Error creating subscription:', insertError);
        return { success: false, message: 'Failed to create subscription' };
      }

      console.log('✅ Subscription created successfully');
    }

    return { success: true, message: 'Subscription synced successfully' };
  } catch (error) {
    console.error('❌ Unexpected error syncing subscription:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get user's current subscription from profiles table
 */
export async function getUserSubscriptionFromProfiles(userId: string): Promise<{
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
} | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user subscription:', error);
      return null;
    }

    return {
      plan: data.subscription_plan as SubscriptionPlan,
      status: data.subscription_status as SubscriptionStatus,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

/**
 * Get plan display name
 */
function getPlanDisplayName(plan: SubscriptionPlan): string {
  const names: Record<SubscriptionPlan, string> = {
    free: 'Free Plan',
    professional: 'Professional Plan',
    enterprise: 'Enterprise Plan',
  };
  return names[plan];
}

/**
 * Check if user has upload permission based on subscription
 */
export async function canUploadContract(userId: string): Promise<boolean> {
  const subscription = await getUserSubscriptionFromProfiles(userId);
  if (!subscription) return false;
  
  // Only free tier cannot upload
  return subscription.plan !== 'free' && subscription.status === 'active';
}

/**
 * Check if user has unlimited contracts
 */
export async function hasUnlimitedContracts(userId: string): Promise<boolean> {
  const subscription = await getUserSubscriptionFromProfiles(userId);
  if (!subscription) return false;
  
  return subscription.plan === 'professional' || subscription.plan === 'enterprise';
}