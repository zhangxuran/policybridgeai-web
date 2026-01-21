import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, LogOut, User, CreditCard, Clock, Save, Loader2 } from 'lucide-react';
import { calculateSubscriptionStatus, type SubscriptionStatus } from '@/lib/subscription';
import { SubscriptionAlert } from '@/components/SubscriptionAlert';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  company_name?: string;
  contact_name?: string;
  phone?: string;
  subscription_plan: 'free' | 'professional' | 'enterprise';
  subscription_status?: string;
  remaining_days?: number;
  free_contracts_limit: number;
  free_contracts_used: number;
  created_at: string;
  updated_at: string;
  purchase_date?: string | null;
  plan_duration?: number | null;
}

interface Contract {
  id: string;
  contract_name: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  
  // Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        company_name: profile.company_name || '',
        contact_name: profile.contact_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);
      await loadUserProfile(user.id);
      await loadContracts(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        
        // Calculate subscription status
        const status = calculateSubscriptionStatus(
          data.subscription_plan,
          data.purchase_date,
          data.plan_duration
        );
        setSubscriptionStatus(status);

        // Auto-downgrade if expired
        if (status.isExpired && data.subscription_plan !== 'free') {
          await handleAutoDowngrade(userId);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleAutoDowngrade = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      // Reload profile to reflect changes
      await loadUserProfile(userId);
    } catch (error) {
      console.error('Error downgrading subscription:', error);
    }
  };

  const loadContracts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, contract_name, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    // Simple phone validation: allow digits, spaces, dashes, parentheses, and plus sign
    const phoneRegex = /^[\d\s\-()+]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate phone if provided
    if (profileForm.phone && !validatePhone(profileForm.phone)) {
      toast.error(t('dashboardPage.profile.phoneInvalidTitle'), {
        description: t('dashboardPage.profile.phoneInvalidDescription'),
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: profileForm.company_name || null,
          contact_name: profileForm.contact_name || null,
          phone: profileForm.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Reload profile to reflect changes
      await loadUserProfile(user.id);
      
      toast.success(t('dashboardPage.profile.saveSuccessTitle'), {
        description: t('dashboardPage.profile.saveSuccessDescription'),
      });
      
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t('dashboardPage.profile.saveFailedTitle'), {
        description: error instanceof Error ? error.message : t('dashboardPage.profile.saveFailedDescription'),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      company_name: profile?.company_name || '',
      contact_name: profile?.contact_name || '',
      phone: profile?.phone || '',
    });
    setIsEditingProfile(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Helper function to get localized plan name
  const getLocalizedPlanName = (plan: string) => {
    switch (plan) {
      case 'free':
        return t('pricing.tiers.free.name');
      case 'professional':
        return t('pricing.tiers.professional.name');
      case 'monthly':
        return t('pricing.tiers.monthly.name');
      case 'yearly':
        return t('pricing.tiers.yearly.name');
      case 'enterprise':
        return t('pricing.tiers.enterprise.name');
      default:
        return t('pricing.tiers.free.name');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboardPage.header.title')}</h1>
                <p className="text-sm text-gray-500">{t('dashboardPage.header.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                {t('dashboardPage.header.backToHome')}
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('dashboardPage.header.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Alert */}
        {subscriptionStatus && (
          <SubscriptionAlert status={subscriptionStatus} />
        )}

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('dashboardPage.userInfo.title')}
                </CardTitle>
                <CardDescription className="mt-2">
                  {user?.email}
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge className={getPlanBadgeColor(profile?.subscription_plan || 'free')}>
                  {getLocalizedPlanName(profile?.subscription_plan || 'free')}
                </Badge>
                {profile?.remaining_days !== undefined && profile?.remaining_days !== null && (
                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {profile?.remaining_days === 0
                        ? t('dashboardPage.userInfo.expired')
                        : t('dashboardPage.userInfo.daysRemaining', { days: profile?.remaining_days })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isEditingProfile ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">{t('dashboardPage.userInfo.companyName')}</div>
                    <div className="font-semibold">{profile?.company_name || t('dashboardPage.userInfo.notSet')}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">{t('dashboardPage.userInfo.contactName')}</div>
                    <div className="font-semibold">{profile?.contact_name || t('dashboardPage.userInfo.notSet')}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">{t('dashboardPage.userInfo.phone')}</div>
                    <div className="font-semibold">{profile?.phone || t('dashboardPage.userInfo.notSet')}</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full md:w-auto"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('dashboardPage.userInfo.editProfile')}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">{t('dashboardPage.profile.companyNameLabel')}</Label>
                    <Input
                      id="company_name"
                      placeholder={t('dashboardPage.profile.companyNamePlaceholder')}
                      value={profileForm.company_name}
                      onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                      disabled={isSavingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">{t('dashboardPage.profile.contactNameLabel')}</Label>
                    <Input
                      id="contact_name"
                      placeholder={t('dashboardPage.profile.contactNamePlaceholder')}
                      value={profileForm.contact_name}
                      onChange={(e) => setProfileForm({ ...profileForm, contact_name: e.target.value })}
                      disabled={isSavingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('dashboardPage.profile.phoneLabel')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t('dashboardPage.profile.phonePlaceholder')}
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      disabled={isSavingProfile}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="flex-1 md:flex-initial"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('dashboardPage.profile.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t('dashboardPage.profile.save')}
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSavingProfile}
                    className="flex-1 md:flex-initial"
                  >
                    {t('dashboardPage.profile.cancel')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('dashboardPage.subscription.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">{t('dashboardPage.subscription.currentPlan')}</div>
                <div className="text-2xl font-bold text-blue-900">
                  {getLocalizedPlanName(profile?.subscription_plan || 'free')}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  {profile?.remaining_days === 0 ? t('dashboardPage.subscription.expired') : t('dashboardPage.subscription.daysRemaining')}
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {profile?.remaining_days === 0 
                    ? t('dashboardPage.subscription.zeroDays')
                    : profile?.remaining_days === Infinity 
                      ? t('dashboardPage.subscription.permanent')
                      : t('dashboardPage.subscription.daysCount', { days: profile?.remaining_days || 0 })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => navigate('/pricing')} className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                {t('dashboardPage.subscription.upgradePlan')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                {t('dashboardPage.subscription.uploadContract')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('dashboardPage.contracts.title')}
            </CardTitle>
            <CardDescription>
              {t('dashboardPage.contracts.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{t('dashboardPage.contracts.noContracts')}</p>
                <Button onClick={() => navigate('/')}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('dashboardPage.contracts.uploadFirst')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{contract.contract_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(contract.created_at).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US')}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={contract.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {contract.status === 'completed' ? t('dashboardPage.contracts.statusCompleted') : t('dashboardPage.contracts.statusProcessing')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}