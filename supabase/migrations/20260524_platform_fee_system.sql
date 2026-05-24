-- Platform Fee System Migration
-- Adds fee tracking to donations and creates platform settings

-- 1. Add platform fee columns to donations table
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee_percentage INTEGER DEFAULT 5;

-- 2. Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  fee_percentage INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 3. Enable RLS on platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for platform_settings
CREATE POLICY "settings_select_all" ON platform_settings
  FOR SELECT USING (true);

CREATE POLICY "settings_update_all" ON platform_settings
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "settings_insert_all" ON platform_settings
  FOR INSERT WITH CHECK (true);

-- 5. Insert default settings
INSERT INTO platform_settings (id, fee_percentage)
VALUES (1, 5)
ON CONFLICT (id) DO NOTHING;

-- 6. Update existing donations with default fee (5%)
UPDATE donations
SET
  platform_fee = amount * 0.05,
  platform_fee_percentage = 5
WHERE platform_fee IS NULL OR platform_fee = 0;
