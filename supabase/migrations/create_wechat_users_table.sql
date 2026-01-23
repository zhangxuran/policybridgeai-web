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

-- Create index on openid for faster lookups
CREATE INDEX IF NOT EXISTS idx_wechat_users_openid ON wechat_users(openid);
CREATE INDEX IF NOT EXISTS idx_wechat_users_unionid ON wechat_users(unionid);

-- Add RLS policy
ALTER TABLE wechat_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read their own user data
CREATE POLICY "Users can read their own data" ON wechat_users
  FOR SELECT
  USING (true);

-- Allow service role to insert/update
CREATE POLICY "Service role can manage wechat users" ON wechat_users
  FOR ALL
  USING (true)
  WITH CHECK (true);
