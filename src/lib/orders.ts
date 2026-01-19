import { supabase } from './supabase';
import type { Order, UserSubscription, SubscriptionStatus } from '@/types/order';

/**
 * Generate a unique order number
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `ORD-${datePart}-${randomPart}`;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: {
  userId: string;
  packageName: string;
  packageType: string;
  amount: number;
  contractsCount: number;
  bonusContracts: number;
  validityPeriod: number;
  currency?: string; // 新增: 货币类型
  language?: string; // 新增: 用户语言
}): Promise<{ success: boolean; order?: Order; message: string }> {
  try {
    console.log('Creating order with data:', orderData);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return { success: false, message: '请先登录' };
    }

    // Verify the userId matches the authenticated user
    if (user.id !== orderData.userId) {
      console.error('User ID mismatch:', { authUserId: user.id, providedUserId: orderData.userId });
      return { success: false, message: '用户验证失败' };
    }

    const orderNumber = generateOrderNumber();
    
    const insertData = {
      user_id: orderData.userId,
      order_number: orderNumber,
      package_name: orderData.packageName,
      package_type: orderData.packageType,
      amount: orderData.amount,
      contracts_count: orderData.contractsCount,
      bonus_contracts: orderData.bonusContracts,
      validity_period: orderData.validityPeriod,
      order_status: 'pending' as const,
      currency: orderData.currency || 'CNY', // 默认人民币
      language: orderData.language || 'zh', // 默认中文
    };

    console.log('Inserting order data:', insertData);

    const { data, error } = await supabase
      .from('app_fdc7c677a7_orders')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create order database error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return { success: false, message: '订单系统初始化中,请稍后重试或联系客服' };
      }
      if (error.message.includes('column')) {
        return { success: false, message: `数据库字段错误: ${error.message}` };
      }
      if (error.message.includes('permission') || error.message.includes('policy')) {
        return { success: false, message: '权限不足,请重新登录后重试' };
      }
      
      return { success: false, message: `创建订单失败: ${error.message}` };
    }

    if (!data) {
      console.error('No data returned from insert');
      return { success: false, message: '创建订单失败:未返回订单数据' };
    }

    console.log('Order created successfully:', data);
    return { success: true, order: data, message: '订单创建成功' };
  } catch (error) {
    console.error('Create order exception:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, message: `创建订单时发生错误: ${errorMessage}` };
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(): Promise<{ success: boolean; orders?: Order[]; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: '请先登录' };
    }

    const { data, error } = await supabase
      .from('app_fdc7c677a7_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get orders error:', error);
      return { success: false, message: '获取订单列表失败' };
    }

    return { success: true, orders: data || [], message: '获取成功' };
  } catch (error) {
    console.error('Get orders exception:', error);
    return { success: false, message: '获取订单列表时发生错误' };
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<{ success: boolean; order?: Order; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: '请先登录' };
    }

    const { data, error } = await supabase
      .from('app_fdc7c677a7_orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Get order error:', error);
      return { success: false, message: '获取订单详情失败' };
    }

    return { success: true, order: data, message: '获取成功' };
  } catch (error) {
    console.error('Get order exception:', error);
    return { success: false, message: '获取订单详情时发生错误' };
  }
}

/**
 * Delete an order
 * Only allows deletion of orders with 'pending' or 'cancelled' status
 */
export async function deleteOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: '请先登录' };
    }

    // First, get the order to check its status
    const { data: order, error: fetchError } = await supabase
      .from('app_fdc7c677a7_orders')
      .select('order_status')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Fetch order error:', fetchError);
      return { success: false, message: '订单不存在或无权限删除' };
    }

    // Check if order can be deleted (only pending or cancelled orders)
    if (order.order_status === 'paid') {
      return { success: false, message: '已支付的订单不能删除' };
    }

    if (order.order_status === 'refunded') {
      return { success: false, message: '已退款的订单不能删除' };
    }

    // Delete the order
    const { error: deleteError } = await supabase
      .from('app_fdc7c677a7_orders')
      .delete()
      .eq('order_id', orderId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Delete order error:', deleteError);
      
      // Check for permission errors
      if (deleteError.message.includes('permission') || deleteError.message.includes('policy')) {
        return { 
          success: false, 
          message: '删除权限不足。请确保数据库已配置正确的RLS策略。详见SUPABASE_SETUP.md' 
        };
      }
      
      return { success: false, message: `删除订单失败: ${deleteError.message}` };
    }

    return { success: true, message: '订单已删除' };
  } catch (error) {
    console.error('Delete order exception:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, message: `删除订单时发生错误: ${errorMessage}` };
  }
}

/**
 * Bulk delete orders
 * Only allows deletion of orders with 'pending' or 'cancelled' status
 */
export async function bulkDeleteOrders(orderIds: string[]): Promise<{ 
  success: boolean; 
  message: string;
  deletedCount: number;
  failedCount: number;
  errors: string[];
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        success: false, 
        message: '请先登录',
        deletedCount: 0,
        failedCount: orderIds.length,
        errors: ['用户未登录']
      };
    }

    if (orderIds.length === 0) {
      return {
        success: false,
        message: '没有选择要删除的订单',
        deletedCount: 0,
        failedCount: 0,
        errors: []
      };
    }

    // Fetch all orders to check their status
    const { data: orders, error: fetchError } = await supabase
      .from('app_fdc7c677a7_orders')
      .select('order_id, order_status, order_number')
      .in('order_id', orderIds)
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Fetch orders error:', fetchError);
      return {
        success: false,
        message: '获取订单信息失败',
        deletedCount: 0,
        failedCount: orderIds.length,
        errors: [fetchError.message]
      };
    }

    // Separate deletable and non-deletable orders
    const deletableOrderIds: string[] = [];
    const errors: string[] = [];

    orders?.forEach(order => {
      if (order.order_status === 'pending' || order.order_status === 'cancelled') {
        deletableOrderIds.push(order.order_id);
      } else {
        errors.push(`订单 ${order.order_number} 状态为 ${order.order_status},不能删除`);
      }
    });

    // Check for orders not found
    const foundOrderIds = orders?.map(o => o.order_id) || [];
    const notFoundIds = orderIds.filter(id => !foundOrderIds.includes(id));
    notFoundIds.forEach(id => {
      errors.push(`订单 ${id} 不存在或无权限访问`);
    });

    let deletedCount = 0;

    // Delete the deletable orders
    if (deletableOrderIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('app_fdc7c677a7_orders')
        .delete()
        .in('order_id', deletableOrderIds)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Bulk delete error:', deleteError);
        
        if (deleteError.message.includes('permission') || deleteError.message.includes('policy')) {
          errors.push('删除权限不足。请确保数据库已配置正确的RLS策略。详见SUPABASE_SETUP.md');
        } else {
          errors.push(`批量删除失败: ${deleteError.message}`);
        }
      } else {
        deletedCount = deletableOrderIds.length;
      }
    }

    const failedCount = orderIds.length - deletedCount;
    const success = deletedCount > 0;

    let message = '';
    if (deletedCount > 0 && failedCount === 0) {
      message = `成功删除 ${deletedCount} 个订单`;
    } else if (deletedCount > 0 && failedCount > 0) {
      message = `成功删除 ${deletedCount} 个订单,${failedCount} 个订单删除失败`;
    } else {
      message = `删除失败,共 ${failedCount} 个订单无法删除`;
    }

    return {
      success,
      message,
      deletedCount,
      failedCount,
      errors
    };
  } catch (error) {
    console.error('Bulk delete exception:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      message: `批量删除订单时发生错误: ${errorMessage}`,
      deletedCount: 0,
      failedCount: orderIds.length,
      errors: [errorMessage]
    };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentId?: string,
  paymentIntent?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const updateData: Record<string, string> = {
      order_status: status,
      updated_at: new Date().toISOString()
    };

    if (paymentId) {
      updateData.stripe_payment_id = paymentId;
    }

    if (paymentIntent) {
      updateData.stripe_payment_intent = paymentIntent;
    }

    const { error } = await supabase
      .from('app_fdc7c677a7_orders')
      .update(updateData)
      .eq('order_id', orderId);

    if (error) {
      console.error('Update order status error:', error);
      return { success: false, message: '更新订单状态失败' };
    }

    return { success: true, message: '订单状态更新成功' };
  } catch (error) {
    console.error('Update order status exception:', error);
    return { success: false, message: '更新订单状态时发生错误' };
  }
}

/**
 * Get user's active subscriptions
 */
export async function getUserSubscriptions(): Promise<{ success: boolean; subscriptions?: UserSubscription[]; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: '请先登录' };
    }

    const { data, error } = await supabase
      .from('app_fdc7c677a7_user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get subscriptions error:', error);
      return { success: false, message: '获取订阅信息失败' };
    }

    return { success: true, subscriptions: data || [], message: '获取成功' };
  } catch (error) {
    console.error('Get subscriptions exception:', error);
    return { success: false, message: '获取订阅信息时发生错误' };
  }
}

/**
 * Check user's subscription status
 */
export async function checkSubscriptionStatus(): Promise<{ success: boolean; status?: SubscriptionStatus; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: '请先登录' };
    }

    const { data, error } = await supabase
      .rpc('check_subscription_status', { p_user_id: user.id });

    if (error) {
      console.error('Check subscription status error:', error);
      return { success: false, message: '检查订阅状态失败' };
    }

    return { success: true, status: data[0], message: '获取成功' };
  } catch (error) {
    console.error('Check subscription status exception:', error);
    return { success: false, message: '检查订阅状态时发生错误' };
  }
}