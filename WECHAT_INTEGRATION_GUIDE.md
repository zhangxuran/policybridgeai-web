# WeChat OAuth2.0 Integration Guide

## Overview

This guide explains how to integrate WeChat OAuth2.0 login into PolicyBridge AI. The implementation uses Supabase Edge Functions to handle the OAuth callback and user management.

## Architecture

```
User clicks "Sign in with WeChat"
    ↓
Frontend redirects to WeChat authorization page
    ↓
User scans QR code and authorizes
    ↓
WeChat redirects to /auth/wechat/callback with authorization code
    ↓
Supabase Edge Function exchanges code for access_token
    ↓
Edge Function fetches user info from WeChat
    ↓
User data stored in wechat_users table
    ↓
Frontend receives user info and stores in localStorage
    ↓
User logged in successfully
```

## Prerequisites

1. **WeChat Developer Account**
   - Register at https://open.weixin.qq.com
   - Create a website application
   - Get App ID: `wxbd7ef55a1a2bd759`
   - Get App Secret: `ff7737ce83fd4431be00cc3ef7d9beed`

2. **Supabase Project**
   - Project URL
   - Anon Key
   - Service Role Key
   - JWT Secret

## Setup Instructions

### 1. Frontend Configuration

Add environment variables to your `.env` file:

```env
VITE_WECHAT_APP_ID=wxbd7ef55a1a2bd759
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

Run the migration to create the `wechat_users` table:

```sql
-- Create wechat_users table
CREATE TABLE IF NOT EXISTS wechat_users (
  id BIGSERIAL PRIMARY KEY,
  openid VARCHAR(255) NOT NULL UNIQUE,
  unionid VARCHAR(255),
  nickname VARCHAR(255),
  headimgurl TEXT,
  province VARCHAR(100),
  city VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wechat_users_openid ON wechat_users(openid);
CREATE INDEX IF NOT EXISTS idx_wechat_users_unionid ON wechat_users(unionid);

-- Enable RLS
ALTER TABLE wechat_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data" ON wechat_users
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage wechat users" ON wechat_users
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 3. Supabase Edge Function Setup

1. Create a new Edge Function in Supabase:
   ```bash
   supabase functions new wechat-auth
   ```

2. Copy the content from `supabase/functions/wechat-auth/index.ts` to the function

3. Set environment variables in Supabase:
   ```
   WECHAT_APP_ID=wxbd7ef55a1a2bd759
   WECHAT_APP_SECRET=ff7737ce83fd4431be00cc3ef7d9beed
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy wechat-auth
   ```

### 4. WeChat Open Platform Configuration

1. Log in to https://open.weixin.qq.com
2. Go to Management Center → Website Applications
3. Select your application
4. Configure the authorization callback domain:
   - Add: `policybridgeai.com`
   - The callback URL will be: `https://policybridgeai.com/auth/wechat/callback`

### 5. Frontend Routes

The following routes have been added:

- `/login` - Login page with WeChat button (Chinese only)
- `/auth/wechat/callback` - WeChat OAuth callback handler
- WeChat login button appears only when language is set to Chinese (zh)

## Components

### WechatLoginButton.tsx
- Displays WeChat login button (Chinese users only)
- Initiates OAuth flow
- Generates and stores state for CSRF protection

### WechatCallback.tsx
- Handles OAuth callback
- Exchanges authorization code for user info
- Stores user data in localStorage
- Redirects to dashboard on success

### Edge Function: wechat-auth
- Exchanges authorization code for access_token
- Fetches user information from WeChat
- Creates or updates user in database
- Returns user data to frontend

## User Data Stored

When a user logs in with WeChat, the following data is stored:

```javascript
{
  id: "wechat_openid",
  openid: "user's openid",
  nickname: "user's nickname",
  headimgurl: "user's avatar URL",
  province: "user's province",
  city: "user's city",
  country: "user's country",
  unionid: "user's unionid (if available)"
}
```

## Translations

### English (en.json)
- `login.wechatLogin`: "Sign in with WeChat"
- `login.wechatLoggingIn`: "Signing in with WeChat..."
- `login.errors.wechatLoginFailed`: "WeChat login failed, please try again"

### Chinese (zh.json)
- `login.wechatLogin`: "使用微信登录"
- `login.wechatLoggingIn`: "正在使用微信登录..."
- `login.errors.wechatLoginFailed`: "微信登录失败,请重试"

## Testing

### Local Testing
1. WeChat OAuth requires HTTPS and a registered domain
2. For local testing, you can use ngrok or similar to create a public URL
3. Update the callback URL in WeChat Open Platform settings

### Production Testing
1. Deploy the application to production
2. Ensure HTTPS is enabled
3. Test the WeChat login flow:
   - Click "Sign in with WeChat" button
   - Scan QR code with WeChat app
   - Verify user data is stored correctly
   - Verify redirect to dashboard

## Troubleshooting

### Issue: "WeChat App ID not configured"
- Solution: Ensure `VITE_WECHAT_APP_ID` is set in `.env`

### Issue: "Invalid state parameter"
- Solution: Clear browser cache and try again

### Issue: Edge Function returns 500 error
- Solution: Check Edge Function logs in Supabase dashboard
- Verify environment variables are set correctly
- Ensure `wechat_users` table exists

### Issue: User data not saved
- Solution: Check database permissions
- Verify RLS policies are configured correctly
- Check Edge Function logs for database errors

## Security Considerations

1. **State Parameter**: CSRF protection using state parameter
2. **HTTPS Only**: WeChat OAuth requires HTTPS
3. **App Secret**: Store securely in Supabase Edge Function environment
4. **User Data**: Only store necessary user information
5. **Session Management**: Implement proper session timeout

## Future Enhancements

1. Link WeChat account to existing Supabase Auth users
2. Support for WeChat mini-program login
3. Automatic user profile sync
4. WeChat payment integration
5. Multi-language support for WeChat error messages

## References

- [WeChat Open Platform Documentation](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
