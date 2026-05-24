# DonationFlow Setup Guide

This guide will help you set up the DonationFlow application locally and deploy it to production.

## Prerequisites

- Node.js 18 or higher
- npm, pnpm, or yarn package manager
- A Supabase account (free tier available at https://supabase.com)

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization and enter a project name
4. Set a strong database password
5. Select your region (choose closest to your location)
6. Wait for the project to be initialized (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Anon Key** (under "Project API keys" → "anon public")

## Step 3: Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials from Step 2.

## Step 4: Initialize the Database

The database schema is already created via the Supabase MCP during development. If you need to manually verify or re-create it:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query and paste the SQL from `database-schema.sql` (if provided)
3. Execute the query

The schema includes:
- `public.users` - User profiles
- `public.campaigns` - Fundraising campaigns
- `public.donations` - Donations to campaigns
- Row-Level Security (RLS) policies for data protection

## Step 5: Install Dependencies

```bash
pnpm install
# or
npm install
```

## Step 6: Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 7: Test the Application

1. **Create an Account**
   - Go to `/auth/sign-up`
   - Fill in email and password
   - Check your email for confirmation (in development, it may not send emails)
   - If email confirmation is skipped, you can proceed

2. **Create a Campaign**
   - Click "New Campaign" in the navbar
   - Fill in campaign details
   - Click "Create Campaign"

3. **View Campaigns**
   - Go to home page to see all active campaigns
   - Click on any campaign to view details

4. **Make a Donation**
   - On a campaign detail page, fill in the donation form
   - Select donation amount and donor info
   - Click "Donate"

5. **View Dashboard**
   - Go to `/dashboard` to see your campaigns and statistics
   - Edit or delete campaigns from here

## Deployment to Vercel

### Option 1: Using GitHub (Recommended)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/donationflow.git
git push -u origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Select your GitHub repository
5. Set environment variables in the "Environment Variables" section:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Option 2: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and set environment variables when asked.

## Common Issues & Solutions

### "Your project's URL and Key are required"
- **Cause**: Missing environment variables
- **Solution**: 
  - Check `.env.local` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Restart the dev server after adding environment variables
  - On Vercel, ensure environment variables are set in project settings

### "Email confirmation required"
- **Cause**: User hasn't confirmed email
- **Solution**: 
  - In development, you can disable email confirmation in Supabase settings
  - Go to Supabase Dashboard → Auth → Providers → Email
  - Toggle "Confirm email" off for development

### Donations not updating campaign amount
- **Cause**: RLS policies preventing updates
- **Solution**:
  - Ensure user is authenticated
  - Check RLS policies in Supabase Dashboard → SQL Editor
  - Verify the `campaigns` table has correct policies

### Build errors with TypeScript
- **Cause**: Missing type definitions
- **Solution**:
  ```bash
  pnpm install --save-dev @types/node @types/react
  ```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous public key |

Note: `NEXT_PUBLIC_` prefix means these are safe to expose in the browser. Never share your private keys or database password.

## Production Checklist

Before deploying to production:

- [ ] Set up email authentication in Supabase
- [ ] Enable HTTPS in Supabase settings
- [ ] Configure custom domain (optional)
- [ ] Set up email verification (production)
- [ ] Enable Row-Level Security (RLS) - already enabled in schema
- [ ] Configure backup schedule in Supabase
- [ ] Set up error tracking (optional)
- [ ] Test all features thoroughly
- [ ] Set up monitoring/logging
- [ ] Prepare privacy policy and terms of service

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - Add `.env.local` to `.gitignore`
   - Use Vercel/hosting platform's environment variable settings

2. **Use strong passwords**
   - For Supabase database
   - For user accounts

3. **Enable RLS policies** (already done in schema)
   - Prevents unauthorized data access
   - Review policies regularly

4. **Validate user input**
   - All forms validate input
   - Server-side validation on API routes

5. **Keep dependencies updated**
   ```bash
   pnpm update
   ```

## Learning Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Support & Issues

If you encounter issues:

1. Check the troubleshooting section above
2. Review the README.md for architecture details
3. Check browser console for errors (F12)
4. Check server logs in terminal
5. Consult Supabase documentation

## Next Steps

After setup, consider:

- [ ] Customize styling and branding
- [ ] Add more features (reviews, comments, etc.)
- [ ] Implement payment processing (Stripe)
- [ ] Add email notifications
- [ ] Create admin dashboard
- [ ] Set up analytics
- [ ] Add social sharing features

Happy fundraising! 🎉
