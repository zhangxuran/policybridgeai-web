import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { syncSubscriptionOnUpdate } from "@/lib/subscriptionSync";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Shield, CreditCard, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
  subscription_plan: string;
  subscription_status: string;
  updated_at: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
}

interface EditFormData {
  subscription_plan: string;
  subscription_status: string;
  role: string;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    subscription_plan: "free",
    subscription_status: "active",
    role: "user",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("请先登录");
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile || profile.role !== "admin") {
        toast.error("您没有权限访问此页面");
        navigate("/");
        return;
      }

      await loadUsers();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      console.log("📊 Loading users from profiles table...");
      
      // Query with updated_at instead of created_at
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("❌ Error loading users:");
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        console.error("Full error object:", JSON.stringify(error, null, 2));
        throw error;
      }

      console.log("✅ Loaded users successfully:", data?.length);
      
      // Log first user to see structure
      if (data && data.length > 0) {
        console.log("Sample user structure:", Object.keys(data[0]));
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      
      // Try to extract more error information
      if (error && typeof error === 'object') {
        console.error("Error type:", error.constructor.name);
        console.error("Error keys:", Object.keys(error));
      }
      
      toast.error("加载用户列表失败", {
        description: error instanceof Error ? error.message : "未知错误"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
  };

  const handleEditClick = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(user);
    setEditFormData({
      subscription_plan: user.subscription_plan || "free",
      subscription_status: user.subscription_status || "active",
      role: user.role || "user",
    });
    setShowEditDialog(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    setIsSaving(true);

    try {
      console.log("💾 Saving changes for user:", selectedUser.id, editFormData);

      // Update profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_plan: editFormData.subscription_plan,
          subscription_status: editFormData.subscription_status,
          role: editFormData.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id);

      if (updateError) {
        console.error("❌ Error updating profile:", updateError);
        throw updateError;
      }

      console.log("✅ Profile updated successfully");

      // Sync to subscription table
      console.log("🔄 Syncing subscription to user_subscriptions table...");
      const syncResult = await syncSubscriptionOnUpdate(
        selectedUser.id,
        editFormData.subscription_plan as 'free' | 'professional' | 'enterprise',
        editFormData.subscription_status as 'active' | 'inactive' | 'expired' | 'cancelled'
      );

      if (!syncResult.success) {
        console.error("❌ Subscription sync failed:", syncResult.message);
        toast.warning("订阅信息已更新，但同步失败", {
          description: syncResult.message
        });
      } else {
        console.log("✅ Subscription synced successfully");
      }
      
      toast.success("用户信息已更新");

      // Refresh user list
      await loadUsers();
      setShowEditDialog(false);
    } catch (error) {
      console.error("❌ Error saving changes:", error);
      toast.error("保存失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan =
      filterPlan === "all" || user.subscription_plan === filterPlan;

    return matchesSearch && matchesPlan;
  });

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-100 text-purple-800";
      case "professional":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  管理员面板
                </h1>
                <p className="text-sm text-gray-500">用户管理与订阅控制</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                返回仪表板
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">付费用户</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  users.filter(
                    (u) =>
                      u.subscription_plan !== "free" &&
                      u.subscription_status === "active"
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">免费用户</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.subscription_plan === "free").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
            <CardDescription>管理所有用户的订阅和权限</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索用户邮箱、公司名称或联系人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="筛选套餐" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有套餐</SelectItem>
                  <SelectItem value="free">免费版</SelectItem>
                  <SelectItem value="professional">专业版</SelectItem>
                  <SelectItem value="enterprise">企业版</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>邮箱</TableHead>
                    <TableHead>订阅计划</TableHead>
                    <TableHead>订阅状态</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-500">没有找到匹配的用户</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <TableCell
                          onClick={() => handleUserClick(user)}
                          className="font-medium"
                        >
                          {user.email}
                        </TableCell>
                        <TableCell onClick={() => handleUserClick(user)}>
                          <Badge
                            className={getPlanBadgeColor(
                              user.subscription_plan
                            )}
                          >
                            {user.subscription_plan}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={() => handleUserClick(user)}>
                          <Badge
                            className={getStatusBadgeColor(
                              user.subscription_status
                            )}
                          >
                            {user.subscription_status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={() => handleUserClick(user)}>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={() => handleUserClick(user)}>
                          {new Date(user.updated_at).toLocaleDateString(
                            "zh-CN"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditClick(user, e)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>查看用户的完整信息</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">邮箱</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">用户ID</Label>
                  <p className="font-mono text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">订阅计划</Label>
                  <div className="mt-1">
                    <Badge
                      className={getPlanBadgeColor(
                        selectedUser.subscription_plan
                      )}
                    >
                      {selectedUser.subscription_plan}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">订阅状态</Label>
                  <div className="mt-1">
                    <Badge
                      className={getStatusBadgeColor(
                        selectedUser.subscription_status
                      )}
                    >
                      {selectedUser.subscription_status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">公司名称</Label>
                  <p className="font-medium">
                    {selectedUser.company_name || "未设置"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">联系人</Label>
                  <p className="font-medium">
                    {selectedUser.contact_person || "未设置"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">电话</Label>
                  <p className="font-medium">
                    {selectedUser.phone || "未设置"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">更新时间</Label>
                  <p className="font-medium">
                    {new Date(selectedUser.updated_at).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户订阅</DialogTitle>
            <DialogDescription>
              修改用户 {selectedUser?.email} 的订阅信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subscription_plan">订阅计划</Label>
              <Select
                value={editFormData.subscription_plan}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, subscription_plan: value })
                }
              >
                <SelectTrigger id="subscription_plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free - 免费版</SelectItem>
                  <SelectItem value="professional">
                    Professional - 专业版
                  </SelectItem>
                  <SelectItem value="enterprise">
                    Enterprise - 企业版
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription_status">订阅状态</Label>
              <Select
                value={editFormData.subscription_status}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    subscription_status: value,
                  })
                }
              >
                <SelectTrigger id="subscription_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active - 激活</SelectItem>
                  <SelectItem value="inactive">Inactive - 未激活</SelectItem>
                  <SelectItem value="expired">Expired - 已过期</SelectItem>
                  <SelectItem value="cancelled">Cancelled - 已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">用户角色</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, role: value })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User - 普通用户</SelectItem>
                  <SelectItem value="admin">Admin - 管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-medium">ℹ️ 提示</p>
              <p className="mt-1">
                修改订阅计划后,用户将根据新的套餐调用相应的 API。系统会自动同步订阅信息到用户订阅表。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSaving}
            >
              取消
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存更改"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}