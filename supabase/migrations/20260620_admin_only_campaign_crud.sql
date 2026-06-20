-- Only admins can create, update, or delete campaigns.
-- Admins are users with auth.users.raw_app_meta_data.role = 'admin'.

DROP POLICY IF EXISTS "campaigns_select_public" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_own" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_own" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_own" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_admin" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_admin" ON campaigns;

CREATE POLICY "campaigns_select_public" ON campaigns
  FOR SELECT USING (
    status = 'active'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

CREATE POLICY "campaigns_insert_admin" ON campaigns
  FOR INSERT WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "campaigns_update_admin" ON campaigns
  FOR UPDATE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "campaigns_delete_admin" ON campaigns
  FOR DELETE USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
