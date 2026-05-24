-- Auto-update campaigns.current_amount whenever a donation is inserted, deleted, or updated.
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/voejjjsthsmxpkqjpphi/sql/new

-- 1. Function that recalculates current_amount by summing all donations
CREATE OR REPLACE FUNCTION update_campaign_amount()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger when a donation is created
DROP TRIGGER IF EXISTS on_donation_insert ON donations;
CREATE TRIGGER on_donation_insert
  AFTER INSERT ON donations
  FOR EACH ROW EXECUTE FUNCTION update_campaign_amount();

-- 3. Trigger when a donation is deleted
DROP TRIGGER IF EXISTS on_donation_delete ON donations;
CREATE TRIGGER on_donation_delete
  AFTER DELETE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_campaign_amount();

-- 4. Trigger when a donation is updated (e.g. amount changed)
DROP TRIGGER IF EXISTS on_donation_update ON donations;
CREATE TRIGGER on_donation_update
  AFTER UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_campaign_amount();

-- 5. Recalculate current_amount for ALL existing campaigns (fixes existing data)
UPDATE campaigns
SET current_amount = (
  SELECT COALESCE(SUM(amount), 0)
  FROM donations
  WHERE donations.campaign_id = campaigns.id
);
