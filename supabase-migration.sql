-- ============================================================
-- 恋爱每一天 - 数据库迁移脚本
-- 添加用户认证和情侣绑定功能
-- 在 Supabase SQL Editor 中执行
-- ============================================================

-- 1. Couples 表（情侣空间）
CREATE TABLE IF NOT EXISTS couples (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code VARCHAR(6) UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Couple Members 表（情侣成员关联）
CREATE TABLE IF NOT EXISTS couple_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id  UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(couple_id, user_id)
);

-- 3. love_data 表增加 couple_id 列
ALTER TABLE love_data ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES couples(id);

-- 4. 删除旧的公开策略
DROP POLICY IF EXISTS "Allow all access" ON love_data;

-- 5. love_data RLS 策略
ALTER TABLE love_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own couple's love_data" ON love_data
  FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM couple_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own couple's love_data" ON love_data
  FOR INSERT
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM couple_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own couple's love_data" ON love_data
  FOR UPDATE
  USING (
    couple_id IN (
      SELECT couple_id FROM couple_members WHERE user_id = auth.uid()
    )
  );

-- 6. couples RLS 策略
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their own couple" ON couples
  FOR SELECT
  USING (
    id IN (
      SELECT couple_id FROM couple_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create a couple" ON couples
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. couple_members RLS 策略
ALTER TABLE couple_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memberships" ON couple_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own membership" ON couple_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 使用方法
-- ============================================================
-- 1. 在 Supabase Dashboard → SQL Editor 中执行以上全部 SQL
-- 2. 在 Supabase Dashboard → Storage → bucket "uploads" → 打开 Public bucket 开关
-- 3. （可选）在 Supabase Dashboard → Authentication → Settings → 关闭 "Confirm email"
--    这样注册后无需验证邮箱即可登录
