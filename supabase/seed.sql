-- Seed Data for testing
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/voejjjsthsmxpkqjpphi/sql/new

-- Sample campaigns (replace user_id with your actual user ID after logging in)
-- To get your user ID: run `SELECT auth.uid();` in the SQL editor after logging in

-- First, check if you have a user
-- SELECT id, email FROM auth.users;

-- Then replace 'YOUR_USER_ID_HERE' below with your actual user ID

-- INSERT INTO campaigns (user_id, title, description, goal_amount, current_amount, category, status, image_url)
-- VALUES
--   ('YOUR_USER_ID_HERE', 'Help Build a Community Library', 'Help us build a free community library in our neighborhood. We need funds for books, shelves, and renovation of the space.', 15000, 3250, 'community', 'active', NULL),

--   ('YOUR_USER_ID_HERE', 'Medical Fund for Sarah', 'Support Sarah''s recovery journey. She needs urgent medical treatment and we''re raising funds to cover hospital expenses.', 50000, 12300, 'medical', 'active', NULL),

--   ('YOUR_USER_ID_HERE', 'Education for Underprivileged Children', 'Provide school supplies, uniforms, and tuition for 50 underprivileged children in our community.', 25000, 8900, 'education', 'active', NULL);


-- If you want to generate test data without a real user, you can use this alternative approach:
-- This creates data that will be visible on the home page (which queries without user filter)
-- but won't show in your dashboard (which filters by user_id)

-- To make seed data visible on the home page for testing:
-- Option 1: Run the INSERT above with your actual user ID (get it from auth.users table)
-- Option 2: Create a test user first in Supabase Auth, then use that ID
