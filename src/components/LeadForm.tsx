import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LeadForm() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    monthlyContracts: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 验证表单
      if (!formData.companyName || !formData.contactName || !formData.email) {
        toast.error('请填写必填项：公司名称、联系人和邮箱');
        setIsSubmitting(false);
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('请输入有效的邮箱地址');
        setIsSubmitting(false);
        return;
      }

      // 保存到localStorage
      const leadData = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      // 获取现有数据
      const existingLeads = localStorage.getItem('contract_review_leads');
      const leads = existingLeads ? JSON.parse(existingLeads) : [];
      
      // 添加新数据
      leads.push(leadData);
      localStorage.setItem('contract_review_leads', JSON.stringify(leads));

      toast.success('提交成功！我们会尽快与您联系');
      
      // 重置表单
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        monthlyContracts: '',
      });
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            立即开始免费试用
          </h2>
          <p className="text-xl text-gray-600">
            前3份合同完全免费，无需信用卡
          </p>
        </div>

        <Card className="shadow-xl border-2">
          <CardHeader>
            <CardTitle className="text-2xl">获取免费试用</CardTitle>
            <CardDescription className="text-base">
              填写信息，我们将在24小时内与您联系
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-base">
                  公司名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="请输入公司名称"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-base">
                  联系人姓名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactName"
                  name="contactName"
                  type="text"
                  placeholder="请输入您的姓名"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  企业邮箱 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">
                  联系电话
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="请输入联系电话"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyContracts" className="text-base">
                  月均合同审核量
                </Label>
                <Input
                  id="monthlyContracts"
                  name="monthlyContracts"
                  type="text"
                  placeholder="例如：10-20份/月"
                  value={formData.monthlyContracts}
                  onChange={handleChange}
                  className="h-12 text-base"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? '提交中...' : '免费试用前3份合同'}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                提交即表示您同意我们的服务条款和隐私政策
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}