import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, deleteOrder, bulkDeleteOrders } from '@/lib/orders';
import type { Order } from '@/types/order';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Search, FileText, ArrowLeft, Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Orders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Bulk delete states
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    const result = await getUserOrders();
    if (result.success && result.orders) {
      setOrders(result.orders);
    }
    setLoading(false);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.package_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
    
    // Clear selections that are no longer visible
    setSelectedOrders(prev => {
      const newSet = new Set<string>();
      const visibleIds = new Set(filtered.map(o => o.order_id));
      prev.forEach(id => {
        if (visibleIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  };

  const handleDeleteClick = (orderId: string, orderStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if order can be deleted
    if (orderStatus === 'paid') {
      toast.error('已支付的订单不能删除');
      return;
    }
    
    if (orderStatus === 'refunded') {
      toast.error('已退款的订单不能删除');
      return;
    }

    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    setDeleting(true);
    try {
      const result = await deleteOrder(orderToDelete);
      
      if (result.success) {
        toast.success('订单已删除');
        await loadOrders();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Delete order error:', error);
      toast.error('删除订单失败');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedOrders.size === 0) {
      toast.error('请先选择要删除的订单');
      return;
    }

    // Check if any selected order cannot be deleted
    const selectedOrdersList = filteredOrders.filter(o => selectedOrders.has(o.order_id));
    const undeletableOrders = selectedOrdersList.filter(o => 
      o.order_status === 'paid' || o.order_status === 'refunded'
    );

    if (undeletableOrders.length > 0) {
      toast.error(`选中的订单中有 ${undeletableOrders.length} 个订单不能删除(已支付或已退款)`);
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const orderIds = Array.from(selectedOrders);
      const result = await bulkDeleteOrders(orderIds);
      
      if (result.success) {
        if (result.failedCount > 0) {
          toast.warning(result.message, {
            description: result.errors.join('\n')
          });
        } else {
          toast.success(result.message);
        }
        setSelectedOrders(new Set());
        await loadOrders();
      } else {
        toast.error(result.message, {
          description: result.errors.length > 0 ? result.errors.join('\n') : undefined
        });
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('批量删除订单失败');
    } finally {
      setDeleting(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all deletable orders in current view
      const deletableOrderIds = filteredOrders
        .filter(o => canDeleteOrder(o.order_status))
        .map(o => o.order_id);
      setSelectedOrders(new Set(deletableOrderIds));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(orderId);
      } else {
        newSet.delete(orderId);
      }
      return newSet;
    });
  };

  const canDeleteOrder = (status: string) => {
    return status === 'pending' || status === 'cancelled';
  };

  const getDeletableOrdersCount = () => {
    return filteredOrders.filter(o => canDeleteOrder(o.order_status)).length;
  };

  const isAllDeletableSelected = () => {
    const deletableOrders = filteredOrders.filter(o => canDeleteOrder(o.order_status));
    if (deletableOrders.length === 0) return false;
    return deletableOrders.every(o => selectedOrders.has(o.order_id));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('orders.status.pending'), variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      paid: { label: t('orders.status.paid'), variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      cancelled: { label: t('orders.status.cancelled'), variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      refunded: { label: t('orders.status.refunded'), variant: 'destructive' as const, className: 'bg-red-100 text-red-800 hover:bg-red-100' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  // Helper function to display contract count
  const displayContractCount = (packageType: string, count: number) => {
    if (packageType === 'monthly' || packageType === 'yearly') {
      return '无限制';
    }
    return `${count}${t('orders.table.pieces')}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-48 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('orders.backToHome')}
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{t('orders.title')}</h1>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('orders.orderList')}
            </CardTitle>
            <CardDescription>
              {t('orders.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters and Bulk Actions */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('orders.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={t('orders.filterStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('orders.allStatus')}</SelectItem>
                    <SelectItem value="pending">{t('orders.status.pending')}</SelectItem>
                    <SelectItem value="paid">{t('orders.status.paid')}</SelectItem>
                    <SelectItem value="cancelled">{t('orders.status.cancelled')}</SelectItem>
                    <SelectItem value="refunded">{t('orders.status.refunded')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Bulk Delete Button */}
              {selectedOrders.size > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedOrders.size} 个订单
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDeleteClick}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    批量删除
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrders(new Set())}
                  >
                    取消选择
                  </Button>
                </div>
              )}
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || statusFilter !== 'all' ? t('orders.noMatchingOrders') : t('orders.noOrders')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || statusFilter !== 'all' 
                    ? t('orders.tryAdjustFilters') 
                    : t('orders.ordersWillAppear')}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button onClick={() => navigate('/pricing')}>
                    {t('orders.browsePlans')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllDeletableSelected()}
                          onCheckedChange={handleSelectAll}
                          disabled={getDeletableOrdersCount() === 0}
                          aria-label="全选"
                        />
                      </TableHead>
                      <TableHead>{t('orders.table.orderNumber')}</TableHead>
                      <TableHead>{t('orders.table.packageName')}</TableHead>
                      <TableHead>{t('orders.table.contracts')}</TableHead>
                      <TableHead>{t('orders.table.amount')}</TableHead>
                      <TableHead>{t('orders.table.status')}</TableHead>
                      <TableHead>{t('orders.table.purchaseTime')}</TableHead>
                      <TableHead className="text-right">{t('orders.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const totalContracts = order.contracts_count + order.bonus_contracts;
                      const displayCount = displayContractCount(order.package_type, totalContracts);
                      
                      return (
                        <TableRow
                          key={order.order_id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate(`/orders/${order.order_id}`)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedOrders.has(order.order_id)}
                              onCheckedChange={(checked) => 
                                handleSelectOrder(order.order_id, checked as boolean)
                              }
                              disabled={!canDeleteOrder(order.order_status)}
                              aria-label={`选择订单 ${order.order_number}`}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {order.order_number}
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.package_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{displayCount}</span>
                              {order.bonus_contracts > 0 && (order.package_type !== 'monthly' && order.package_type !== 'yearly') && (
                                <span className="text-xs text-green-600">
                                  ({t('orders.table.includesBonus', { count: order.bonus_contracts })})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatAmount(order.amount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.order_status)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/orders/${order.order_id}`);
                                }}
                              >
                                {t('orders.table.viewDetails')}
                              </Button>
                              {canDeleteOrder(order.order_status) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleDeleteClick(order.order_id, order.order_status, e)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Summary */}
            {filteredOrders.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{t('orders.summary.total', { count: filteredOrders.length })}</span>
                  <span>
                    {t('orders.summary.totalAmount')}: <span className="font-semibold text-gray-900">
                      {formatAmount(filteredOrders.reduce((sum, order) => sum + order.amount, 0))}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除订单?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该订单,删除后无法恢复。您确定要继续吗?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                '确认删除'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除订单?</AlertDialogTitle>
            <AlertDialogDescription>
              您即将删除 <span className="font-semibold text-red-600">{selectedOrders.size}</span> 个订单。
              此操作将永久删除这些订单,删除后无法恢复。您确定要继续吗?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                `确认删除 ${selectedOrders.size} 个订单`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}