-- Donation user CRUD migration
-- Adds donor update/delete policies and keeps campaign totals in sync.

DROP POLICY IF EXISTS "donations_update_own" ON donations;
DROP POLICY IF EXISTS "donations_delete_own" ON donations;

CREATE POLICY "donations_update_own" ON donations
  FOR UPDATE USING (
    auth.uid() = donor_id
    OR lower(coalesce(donor_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR auth.uid() IN (
      SELECT user_id FROM campaigns WHERE id = campaign_id
    )
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.uid() = donor_id
    OR lower(coalesce(donor_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR auth.uid() IN (
      SELECT user_id FROM campaigns WHERE id = campaign_id
    )
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

CREATE POLICY "donations_delete_own" ON donations
  FOR DELETE USING (
    auth.uid() = donor_id
    OR lower(coalesce(donor_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR auth.uid() IN (
      SELECT user_id FROM campaigns WHERE id = campaign_id
    )
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM donations
    WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
  )
  WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_donation_insert ON donations;
CREATE TRIGGER on_donation_insert
  AFTER INSERT ON donations
  FOR EACH ROW EXECUTE FUNCTION app_private.update_campaign_amount();

DROP TRIGGER IF EXISTS on_donation_delete ON donations;
CREATE TRIGGER on_donation_delete
  AFTER DELETE ON donations
  FOR EACH ROW EXECUTE FUNCTION app_private.update_campaign_amount();

DROP TRIGGER IF EXISTS on_donation_update ON donations;
CREATE TRIGGER on_donation_update
  AFTER UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION app_private.update_campaign_amount();

UPDATE campaigns
SET current_amount = (
  SELECT COALESCE(SUM(amount), 0)
  FROM donations
  WHERE donations.campaign_id = campaigns.id
);
