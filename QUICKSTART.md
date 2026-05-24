# DonationFlow - Quick Start Guide

Get DonationFlow running in 5 minutes!

## Prerequisites

- Node.js 18+
- A Supabase account (free at https://supabase.com)

## Step 1: Get Supabase Credentials (2 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project or use existing one
3. Go to **Settings → API**
4. Copy:
   - **Project URL** 
   - **Anon Key**

## Step 2: Configure Environment (1 minute)

Create `.env.local` file in project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

## Step 3: Install & Run (2 minutes)

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open http://localhost:3000

## Done! 

You now have DonationFlow running locally. The database schema is already set up.

## What Can You Do?

### Try These Features

1. **Create Account** - Go to `/auth/sign-up`
2. **Create Campaign** - Click "New Campaign" → Fill form → Submit
3. **View Campaign** - Click campaign card on home page
4. **Make Donation** - Click "Donate Now" on any campaign
5. **Manage Campaigns** - Visit `/dashboard` to see your campaigns

## Common First Steps

```bash
# Start dev server
pnpm dev

# In another terminal:
# (Optional) Build for production
pnpm build

# (Optional) Run production build
pnpm start
```

## Troubleshooting

### "Supabase URL required" error
- Check `.env.local` has both variables
- Restart dev server after updating

### Email confirmation stuck
- In Supabase: Auth → Providers → Email → Toggle "Confirm email" OFF (for dev)

### Page not found
- Make sure dev server is running (`pnpm dev`)
- Check URL matches route structure

## Next Steps

1. Read `README.md` for full architecture
2. Check `SETUP.md` for deployment info
3. Review `FILE_REFERENCE.md` to understand code structure
4. Customize styling in Tailwind config
5. Add more features!

## File Structure Overview

```
/app              ← Pages and routes
/components       ← Reusable UI components
/lib              ← Supabase and utilities
README.md         ← Full documentation
SETUP.md          ← Detailed setup guide
```

## Key Features Already Built

✅ User authentication
✅ Campaign creation & editing
✅ Donation tracking
✅ Real-time statistics
✅ Responsive design
✅ Mobile-friendly UI

## Explore the Code

- **Pages**: See how routes work in `/app`
- **Components**: Reusable components in `/components`
- **Database**: Schema and RLS policies set up in Supabase
- **Styling**: Tailwind CSS in components

## Tips

- Use browser DevTools (F12) to debug
- Check terminal for server errors
- Use React DevTools extension for component inspection
- Check Supabase Dashboard for database issues

## Ready for More?

- **Customize**: Edit colors, fonts, layout in components
- **Deploy**: See `SETUP.md` for Vercel deployment
- **Extend**: Add new features using existing patterns
- **Learn**: Review code comments and documentation

## Questions?

Check these files in order:
1. `QUICKSTART.md` (this file)
2. `SETUP.md` (detailed setup)
3. `README.md` (architecture)
4. `FILE_REFERENCE.md` (code structure)

---

**That's it! You're ready to go.** 🚀

For detailed setup, deployment, and troubleshooting, see `SETUP.md`.
