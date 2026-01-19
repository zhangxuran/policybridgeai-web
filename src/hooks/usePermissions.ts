import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserPermissions,
  getUserSubscription,
  checkFeatureAccess,
  checkUsageLimit,
  type FeaturePermissions,
  type SubscriptionTier,
  type UsageLimitCheck,
} from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<FeaturePermissions | null>(null);
  const [tier, setTier] = useState<SubscriptionTier>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, [user]);

  async function loadPermissions() {
    if (!user) {
      setPermissions(null);
      setTier('none');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [perms, subscription] = await Promise.all([
        getUserPermissions(user.id),
        getUserSubscription(user.id),
      ]);

      setPermissions(perms);
      setTier(subscription.tier);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions(null);
      setTier('none');
    } finally {
      setLoading(false);
    }
  }

  async function hasFeature(feature: keyof FeaturePermissions): Promise<boolean> {
    if (!user) return false;

    const result = await checkFeatureAccess(user.id, feature);
    return result.hasAccess;
  }

  async function checkUsage(): Promise<UsageLimitCheck | null> {
    if (!user) return null;

    return await checkUsageLimit(user.id);
  }

  async function refreshPermissions() {
    await loadPermissions();
  }

  return {
    permissions,
    tier,
    loading,
    hasFeature,
    checkUsage,
    refreshPermissions,
  };
}