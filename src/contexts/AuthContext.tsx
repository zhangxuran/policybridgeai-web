import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { syncSubscriptionOnUpdate } from '@/lib/subscriptionSync';

interface WechatUser {
  id: string;
  openid: string;
  nickname: string;
  headimgurl: string;
  province?: string;
  city?: string;
  country?: string;
  unionid?: string;
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  wechatUser: WechatUser | null;
  loading: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message?: string }>;
  signUp: (email: string, password: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  setWechatUser: (user: WechatUser | null) => void;
}

interface RegisterData {
  email: string;
  password: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wechatUser, setWechatUserState] = useState<WechatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('active');

  // Initialize WeChat user from localStorage on mount
  useEffect(() => {
    const storedWechatUser = localStorage.getItem('wechat_user');
    if (storedWechatUser) {
      try {
        const parsedUser = JSON.parse(storedWechatUser);
        setWechatUserState(parsedUser);
        console.log('✅ WeChat user restored from localStorage:', parsedUser.nickname);
      } catch (error) {
        console.error('Error parsing stored WeChat user:', error);
        localStorage.removeItem('wechat_user');
      }
    }
  }, []);

  const setWechatUser = (user: WechatUser | null) => {
    if (user) {
      localStorage.setItem('wechat_user', JSON.stringify(user));
      setWechatUserState(user);
      console.log('✅ WeChat user saved to localStorage:', user.nickname);
    } else {
      localStorage.removeItem('wechat_user');
      setWechatUserState(null);
      console.log('WeChat user cleared from localStorage');
    }
  };

  const ensureProfileExists = async (authUser: User) => {
    try {
      console.log('Checking if profile exists for user:', authUser.id);
      
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is expected
        console.error('Error checking profile:', checkError);
        return;
      }

      if (existingProfile) {
        console.log('Profile already exists for user:', authUser.id);
        return;
      }

      // Profile doesn't exist, create it
      console.log('Creating profile for OAuth user:', authUser.id);
      
      const email = authUser.email || '';
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || '';
      const avatarUrl = authUser.user_metadata?.avatar_url || '';

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: email,
          full_name: fullName,
          avatar_url: avatarUrl,
          role: 'user',
          subscription_plan: 'free',
          subscription_status: 'active'
        });

      if (profileError) {
        console.error('Profile creation error for OAuth user:', profileError);
        // Don't throw error, profile might be created by trigger
      } else {
        console.log('✅ Profile created successfully for OAuth user:', authUser.id);
        
        // Sync to subscription table
        try {
          await syncSubscriptionOnUpdate(authUser.id, 'free', 'active');
        } catch (syncError) {
          console.error('Subscription sync error:', syncError);
        }
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSubscriptionInfo(session.user.id);
        // Ensure profile exists for OAuth users
        ensureProfileExists(session.user);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSubscriptionInfo(session.user.id);
        // Ensure profile exists for OAuth users (especially on sign in)
        if (_event === 'SIGNED_IN') {
          ensureProfileExists(session.user);
        }
      } else {
        setSubscriptionPlan('free');
        setSubscriptionStatus('active');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSubscriptionInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setSubscriptionPlan(data.subscription_plan || 'free');
        setSubscriptionStatus(data.subscription_status || 'active');
      }
    } catch (error) {
      console.error('Error loading subscription info:', error);
    }
  };

  const refreshSubscription = async () => {
    if (user) {
      await loadSubscriptionInfo(user.id);
    }
  };

  const signUp = async (email: string, password: string) => {
    // Enable email verification
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    
    // Create profile after successful signup
    if (data.user) {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            role: 'user',
            subscription_plan: 'free',
            subscription_status: 'active'
          });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw error, profile might be created by trigger
        }

        // Sync to subscription table
        try {
          await syncSubscriptionOnUpdate(data.user.id, 'free', 'active');
        } catch (syncError) {
          console.error('Subscription sync error:', syncError);
        }
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message };
      }

      if (data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          console.log('⚠️ Email not verified for:', data.user.email);
          // Sign out the user
          await supabase.auth.signOut();
          return { 
            success: false, 
            message: '请先验证您的邮箱后再登录。如果未收到验证邮件，请在注册页面重新发送。' 
          };
        }
        
        console.log('✅ Login successful for:', data.user.email);
        setUser(data.user);
        await loadSubscriptionInfo(data.user.id);
        return { success: true, message: '登录成功' };
      }

      return { success: false, message: '登录失败' };
    } catch (error) {
      console.error('Login exception:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '登录时发生错误' 
      };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('Registration attempt for:', data.email);

      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existingProfile) {
        console.log('User already exists:', data.email);
        return { 
          success: false, 
          message: '该邮箱已被注册，请直接登录或使用其他邮箱注册。' 
        };
      }

      // Enable email verification
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            company_name: data.companyName,
            contact_person: data.contactName,
            phone: data.phone,
          }
        }
      });

      if (signUpError) {
        console.error('SignUp error:', signUpError);
        return { success: false, message: signUpError.message };
      }

      if (!authData.user) {
        return { success: false, message: '注册失败，请重试' };
      }

      console.log('User created:', authData.user.id);

      // Only create profile if it doesn't exist
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (!profileCheck) {
        // Create user profile in the correct table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            company_name: data.companyName,
            contact_person: data.contactName,
            phone: data.phone,
            role: 'user',
            subscription_plan: 'free',
            subscription_status: 'active'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail registration if profile creation fails
          console.log('Profile creation failed, but user account was created. Profile may be created by trigger.');
        }

        // Sync to subscription table
        try {
          await syncSubscriptionOnUpdate(authData.user.id, 'free', 'active');
        } catch (syncError) {
          console.error('Subscription sync error:', syncError);
        }
      }

      console.log('Registration successful');
      return { 
        success: true, 
        message: '注册成功！请查看您的邮箱并点击验证链接以激活账户。' 
      };
    } catch (error) {
      console.error('Registration exception:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '注册时发生错误' 
      };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      console.log('Resending verification email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Resend verification email error:', error);
        return { 
          success: false, 
          message: '发送验证邮件失败: ' + error.message 
        };
      }

      console.log('Verification email resent successfully');
      return { 
        success: true, 
        message: '验证邮件已重新发送，请查收您的邮箱。' 
      };
    } catch (error) {
      console.error('Resend verification email exception:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '发送验证邮件时发生错误' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('=== Starting logout process ===');
      
      // Clear user state first
      setUser(null);
      setSubscriptionPlan('free');
      setSubscriptionStatus('active');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        return { success: false, message: error.message };
      }

      // Clear any local storage items
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('wechat_user');
      sessionStorage.clear();
      setWechatUserState(null);

      console.log('Logout successful, clearing all auth data');
      return { success: true };
    } catch (error) {
      console.error('Logout exception:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '退出登录时发生错误' 
      };
    }
  };

  const value = {
    user,
    wechatUser,
    loading,
    subscriptionPlan,
    subscriptionStatus,
    login,
    register,
    logout,
    signUp,
    refreshSubscription,
    resendVerificationEmail,
    setWechatUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
