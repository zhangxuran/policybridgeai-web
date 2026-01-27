# Supabase 邮箱验证配置指南

## 📧 启用邮箱验证功能

为了防止用户使用虚假邮箱注册，您需要在Supabase后台启用邮箱验证功能。

### 步骤 1: 登录 Supabase Dashboard

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 选择您的项目 `policybridgeai`

### 步骤 2: 配置邮箱验证

1. 在左侧菜单中，点击 **Authentication** → **Providers**
2. 找到 **Email** provider
3. 确保以下设置：
   - ✅ **Enable Email provider** (启用邮箱登录)
   - ✅ **Confirm email** (确认邮箱) - **这是关键设置！**
   - ✅ **Secure email change** (安全邮箱更改)

### 步骤 3: 配置邮件模板（可选但推荐）

1. 在左侧菜单中，点击 **Authentication** → **Email Templates**
2. 自定义以下模板：

#### Confirm signup (确认注册)
```html
<h2>欢迎加入 PolicyBridge.AI！</h2>
<p>感谢您注册 PolicyBridge.AI。请点击下面的链接验证您的邮箱地址：</p>
<p><a href="{{ .ConfirmationURL }}">验证邮箱</a></p>
<p>🎁 验证后，您将获得 7 天专业版免费试用！</p>
<p>如果您没有注册此账户，请忽略此邮件。</p>
```

### 步骤 4: 配置重定向 URL

1. 在 **Authentication** → **URL Configuration** 中
2. 添加以下重定向 URL：
   - `https://www.policybridgeai.com/auth/callback`
   - `http://localhost:5173/auth/callback` (用于本地开发)

### 步骤 5: 测试邮件发送

1. 在 **Project Settings** → **API** 中
2. 确认 **SMTP Settings** 已配置（Supabase 默认提供免费的邮件服务）
3. 如果需要自定义SMTP，可以配置您自己的邮件服务器

## ✅ 验证配置

配置完成后，新用户注册时：
1. 会收到验证邮件
2. 必须点击邮件中的链接验证邮箱
3. 验证后才能正常登录使用

## 🔧 前端代码已更新

前端代码已经更新以支持邮箱验证流程：
- ✅ 注册后显示验证提示
- ✅ 添加重新发送验证邮件功能
- ✅ 登录时检查邮箱是否已验证
- ✅ 创建邮箱验证回调页面

## 📝 注意事项

1. **Google OAuth 登录**：通过 Google 登录的用户邮箱已由 Google 验证，无需再次验证
2. **现有用户**：已注册但未验证的用户需要重新验证邮箱
3. **邮件发送限制**：Supabase 免费版有邮件发送限制，如需大量发送请升级或配置自己的 SMTP

## 🚀 部署后测试

1. 注册新账户
2. 检查是否收到验证邮件
3. 点击验证链接
4. 尝试登录验证是否成功
