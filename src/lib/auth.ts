import { supabase, UserProfile } from './supabase';
import { AuthError } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
  subscription: {
    plan: 'free' | 'professional' | 'enterprise';
    freeContractsLimit: number;
    freeContractsUsed: number;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user with Supabase Auth
 */
export async function register(data: RegisterData): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    console.log('🔐 Starting registration process for:', data.email);
    
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          company_name: data.companyName,
          contact_name: data.contactName,
          phone: data.phone,
        }
      }
    });

    if (authError) {
      console.error('❌ Supabase auth signup error:', authError);
      console.error('Error details:', {
        message: authError.message,
        status: authError.status,
        name: authError.name
      });
      return {
        success: false,
        message: getErrorMessage(authError.message)
      };
    }

    if (!authData.user) {
      console.error('❌ No user returned from signup');
      return {
        success: false,
        message: '注册失败,请重试'
      };
    }

    console.log('✅ User created successfully:', authData.user.id);

    // Try to create user profile in database
    // Note: This might fail if the trigger already created it, which is fine
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          company_name: data.companyName,
          contact_name: data.contactName,
          phone: data.phone,
          subscription_plan: 'free',
          free_contracts_limit: 3,
          free_contracts_used: 0
        });

      if (profileError) {
        console.warn('⚠️ Profile creation warning (might be created by trigger):', profileError);
        // Don't fail registration if profile creation fails - trigger might have created it
      } else {
        console.log('✅ User profile created successfully');
      }
    } catch (profileErr) {
      console.warn('⚠️ Profile creation error (continuing anyway):', profileErr);
    }

    return {
      success: true,
      message: '注册成功!请检查您的邮箱以验证账号。',
      user: await mapAuthUserToUser(authData.user.id)
    };
  } catch (error) {
    console.error('❌ Unexpected registration error:', error);
    const errorMessage = error instanceof Error ? error.message : '注册失败,请重试';
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Login user with Supabase Auth
 */
export async function login(data: LoginData): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    console.log('🔐 Starting login process for:', data.email);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (authError) {
      console.error('❌ Login error:', authError);
      return {
        success: false,
        message: getErrorMessage(authError.message)
      };
    }

    if (!authData.user) {
      console.error('❌ No user returned from login');
      return {
        success: false,
        message: '登录失败,请重试'
      };
    }

    // Check if email is verified
    if (!authData.user.email_confirmed_at) {
      console.log('⚠️ Email not verified for user:', data.email);
      return {
        success: false,
        message: '请先验证您的邮箱。如果没有收到验证邮件,请检查垃圾邮件文件夹或重新发送验证邮件。'
      };
    }

    console.log('✅ Login successful for:', data.email);
    const user = await mapAuthUserToUser(authData.user.id);

    return {
      success: true,
      message: '登录成功!',
      user
    };
  } catch (error) {
    console.error('❌ Unexpected login error:', error);
    const errorMessage = error instanceof Error ? error.message : '登录失败,请重试';
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🚪 Starting logout process...');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout error:', error);
      return {
        success: false,
        message: '退出登录失败,请重试'
      };
    }
    
    console.log('✅ Logout successful');
    return {
      success: true,
      message: '已成功退出登录'
    };
  } catch (error) {
    console.error('❌ Unexpected logout error:', error);
    return {
      success: false,
      message: '退出登录失败,请重试'
    };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ Get user error:', error);
      return null;
    }

    if (!authUser) {
      console.log('ℹ️ No authenticated user');
      return null;
    }

    console.log('✅ Got authenticated user:', authUser.email);
    return await mapAuthUserToUser(authUser.id);
  } catch (error) {
    console.error('❌ Get current user error:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; message: string }> {
  try {
    const profileUpdates: Record<string, string | undefined> = {};

    if (updates.companyName !== undefined) profileUpdates.company_name = updates.companyName;
    if (updates.contactName !== undefined) profileUpdates.contact_name = updates.contactName;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;

    const { error } = await supabase
      .from('profiles')
      .update({
        ...profileUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Update user error:', error);
      return {
        success: false,
        message: '更新失败,请重试'
      };
    }

    console.log('✅ User profile updated successfully');
    return {
      success: true,
      message: '更新成功!'
    };
  } catch (error) {
    console.error('❌ Update user error:', error);
    const errorMessage = error instanceof Error ? error.message : '更新失败,请重试';
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('📧 Resending verification email to:', email);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    if (error) {
      console.error('❌ Resend verification error:', error);
      return {
        success: false,
        message: getErrorMessage(error.message)
      };
    }

    console.log('✅ Verification email resent successfully');
    return {
      success: true,
      message: '验证邮件已重新发送,请检查您的邮箱。'
    };
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    const errorMessage = error instanceof Error ? error.message : '发送失败,请重试';
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Map Supabase auth user to app User type
 */
async function mapAuthUserToUser(userId: string): Promise<User | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.warn('⚠️ Get profile error (using default values):', error);
      // Return basic user info if profile doesn't exist
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      return {
        id: userId,
        email: authUser.email || '',
        subscription: {
          plan: 'free',
          freeContractsLimit: 3,
          freeContractsUsed: 0
        }
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      companyName: profile.company_name,
      contactName: profile.contact_name,
      phone: profile.phone,
      subscription: {
        plan: profile.subscription_plan,
        freeContractsLimit: profile.free_contracts_limit,
        freeContractsUsed: profile.free_contracts_used
      }
    };
  } catch (error) {
    console.error('❌ Map user error:', error);
    return null;
  }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'Email not confirmed': '请先验证您的邮箱',
    'User already registered': '该邮箱已被注册',
    'Password should be at least 6 characters': '密码至少需要6个字符',
    'Unable to validate email address: invalid format': '邮箱格式不正确',
    'Email rate limit exceeded': '发送邮件过于频繁,请稍后再试',
    'User not found': '用户不存在',
    'Invalid email or password': '邮箱或密码错误',
    'Signup requires a valid password': '请输入有效的密码',
    'Database error saving new user': '数据库错误,请稍后重试',
    'Email link is invalid or has expired': '邮件链接无效或已过期',
    'For security purposes, you can only request this once every 60 seconds': '请求过于频繁,请60秒后再试',
    'Failed to fetch': '网络连接失败,请检查网络后重试',
    'NetworkError': '网络连接失败,请检查网络后重试'
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return value;
    }
  }

  // Return the original error if no mapping found
  return error || '操作失败,请重试';
}