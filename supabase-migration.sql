-- ============================================================
-- 恋爱每一天 - 完整数据库迁移脚本
-- 在 Supabase Dashboard → SQL Editor 中全部复制粘贴执行
-- ============================================================

-- ========== 第一部分：基础表（如果还没有的话） ==========

-- 如果 love_data 表还不存在，创建它
CREATE TABLE IF NOT EXISTS love_data (
  id TEXT PRIMARY KEY DEFAULT 'main',
  couple_id UUID,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 如果 love_data 没有 couple_id 列，就加上
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'love_data' AND column_name = 'couple_id'
  ) THEN
    ALTER TABLE love_data ADD COLUMN couple_id UUID REFERENCES couples(id);
  END IF;
END $$;

-- ========== 第二部分：情侣表 ==========

-- couples 表
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code VARCHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- couple_members 表
CREATE TABLE IF NOT EXISTS couple_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(couple_id, user_id)
);

-- ========== 第三部分：RLS 策略 ==========

-- love_data: 先删旧策略，再加新策略
ALTER TABLE love_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON love_data;
DROP POLICY IF EXISTS "Users can view own couple's love_data" ON love_data;
DROP POLICY IF EXISTS "Users can insert own couple's love_data" ON love_data;
DROP POLICY IF EXISTS "Users can update own couple's love_data" ON love_data;

CREATE POLICY "Users can view own couple's love_data" ON love_data
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM couple_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own couple's love_data" ON love_data
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT couple_id FROM couple_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own couple's love_data" ON love_data
  FOR UPDATE USING (
    couple_id IN (SELECT couple_id FROM couple_members WHERE user_id = auth.uid())
  );

-- couples: RLS 策略
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own couple" ON couples;
DROP POLICY IF EXISTS "Authenticated users can create a couple" ON couples;

CREATE POLICY "Members can view their own couple" ON couples
  FOR SELECT USING (
    id IN (SELECT couple_id FROM couple_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create a couple" ON couples
  FOR INSERT TO authenticated WITH CHECK (true);

-- couple_members: RLS 策略
ALTER TABLE couple_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own memberships" ON couple_members;
DROP POLICY IF EXISTS "Users can insert own membership" ON couple_members;

CREATE POLICY "Users can view own memberships" ON couple_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own membership" ON couple_members
  FOR INSERT WITH CHECK (user_id = auth.uid());
