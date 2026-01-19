import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Building, Mail, Phone } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    contactName: user?.contactName || '',
    companyName: user?.companyName || '',
    phone: user?.phone || '',
  });

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateUser(formData);
      
      if (result.success) {
        toast.success('个人资料更新成功');
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('更新失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      contactName: user.contactName,
      companyName: user.companyName,
      phone: user.phone,
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">个人资料</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>管理您的账号信息</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>联系人姓名</span>
                  </Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    type="text"
                    value={formData.contactName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>公司名称</span>
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>邮箱地址</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="h-11 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">邮箱地址不可修改</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>联系电话</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="flex space-x-4">
                  {!isEditing ? (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      编辑资料
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? '保存中...' : '保存更改'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        取消
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>订阅信息</CardTitle>
              <CardDescription>查看您的订阅状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">当前套餐</span>
                  <span className="font-medium">
                    {user.subscription.tier === 'free' ? '免费版' : 
                     user.subscription.tier === 'pro' ? '专业版' : '企业版'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">免费额度</span>
                  <span className="font-medium">
                    {user.subscription.freeContractsUsed} / {user.subscription.freeContractsLimit} 份
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">注册时间</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                
                {user.subscription.tier === 'free' && (
                  <div className="pt-4 border-t">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      升级到专业版
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}