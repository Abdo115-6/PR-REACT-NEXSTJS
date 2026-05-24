# DonationFlow - Crowdfunding Platform

A modern, full-stack donation and crowdfunding platform built with Next.js 15, React 19, Supabase, and Tailwind CSS.

## Project Overview

DonationFlow is an educational project demonstrating modern web development practices including:

- **Frontend**: Next.js 15 with React 19 for a responsive, dynamic user interface
- **Backend**: Supabase with PostgreSQL for secure data management
- **Authentication**: Supabase Auth with email/password authentication
- **Styling**: Tailwind CSS with shadcn/ui components
- **Architecture**: Server Components, Client Components, API Routes, and Server Actions

## Key Features

### Core Functionality
- **Campaign Management**: Create, edit, and delete fundraising campaigns
- **Donation System**: Accept donations with optional messaging and anonymous support
- **Progress Tracking**: Visual progress bars and donation statistics
- **User Dashboard**: View all campaigns and donation analytics
- **Public Listings**: Browse all active campaigns with detailed information

### Technical Features
- Row-Level Security (RLS) for data protection
- Real-time updates with Supabase subscriptions
- Responsive design for mobile, tablet, and desktop
- Form validation and error handling
- Toast notifications for user feedback

## Architecture

### File Structure

```
/app
  /auth                          # Authentication pages
    /login
    /sign-up
    /callback
  /campaigns
    /[id]                       # Campaign detail page
      /page.tsx
  /dashboard                     # Protected dashboard
    /page.tsx                   # Dashboard overview
    /create                     # Create campaign
    /campaigns/[id]/edit        # Edit campaign
  /layout.tsx                   # Root layout
  /page.tsx                     # Home page

/components
  /ui                           # shadcn/ui components
  navbar.tsx                    # Navigation component
  campaign-card.tsx             # Campaign display card
  campaign-form.tsx             # Campaign creation form
  campaign-edit-form.tsx        # Campaign editing form
  campaign-list.tsx             # Campaign management list
  donation-card.tsx             # Donation display card
  donation-form.tsx             # Donation submission form
  dashboard-stats.tsx           # Statistics widgets
  progress-bar.tsx              # Progress visualization

/lib
  /supabase
    client.ts                   # Client-side Supabase
    server.ts                   # Server-side Supabase
    middleware.ts               # Auth middleware

middleware.ts                   # Route protection middleware

```

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built UI components
- **lucide-react** - Icon library
- **date-fns** - Date formatting utilities

### Backend & Database
- **Supabase** - PostgreSQL database + authentication
- **@supabase/supabase-js** - Supabase client library
- **@supabase/ssr** - Server-side rendering utilities

## Database Schema

### Users Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Campaigns Table
```sql
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  category TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Donations Table
```sql
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id),
  donor_id UUID REFERENCES public.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  message TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account and project

### Installation

1. **Clone and install dependencies**
```bash
npm install
# or
pnpm install
```

2. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Run the development server**
```bash
npm run dev
# or
pnpm dev
```

4. **Open in browser**
Navigate to `http://localhost:3000`

## Key Concepts Demonstrated

### Next.js 15 Features
- **App Router**: File-based routing with `app/` directory
- **Server Components**: Default rendering on the server for performance
- **Client Components**: `'use client'` directive for interactive features
- **API Routes**: RESTful endpoints in `app/api/`
- **Dynamic Routes**: `[id]` segments for parameterized pages
- **Middleware**: Request interception for authentication

### React 19 Patterns
- **Hooks**: useState, useEffect, useCallback for state management
- **Functional Components**: Component-based architecture
- **JSX**: Declarative UI rendering
- **Props**: Component communication
- **Conditional Rendering**: Show/hide elements based on state

### Supabase & Authentication
- **Email/Password Auth**: User registration and login
- **Session Management**: Automatic token refresh with middleware
- **Row-Level Security (RLS)**: Data access control via SQL policies
- **Server-Client Split**: `lib/supabase/client.ts` for browser, `lib/supabase/server.ts` for server

### Database Design
- **Foreign Keys**: Relationships between tables
- **Cascading Deletes**: Clean data removal
- **Default Values**: Automatic field population
- **Timestamps**: Automatic created_at/updated_at tracking

### UI/UX Patterns
- **Form Handling**: Validation and submission
- **Loading States**: User feedback during async operations
- **Toast Notifications**: Non-intrusive alerts
- **Responsive Design**: Mobile-first approach with Tailwind
- **Progress Visualization**: Visual progress bars and statistics

## Security Considerations

1. **Row-Level Security**: Database policies ensure users can only access their own data
2. **Authentication**: Supabase Auth handles password hashing and session management
3. **CORS**: Supabase client handles cross-origin requests
4. **Input Validation**: Form validation prevents invalid data submission
5. **Protected Routes**: Middleware redirects unauthenticated users to login

## Performance Optimizations

- **Server Components**: Reduced JavaScript bundle size
- **Image Optimization**: Responsive image loading with object-fit
- **Lazy Loading**: Components loaded on demand
- **Caching**: Supabase query results cached effectively

## Common Workflows

### Creating a Campaign
1. User logs in and navigates to `/dashboard/create`
2. Fills out `CampaignForm` with title, description, goal amount
3. Form submitted via `supabase.from('campaigns').insert()`
4. User redirected to campaign detail page
5. Campaign appears on home page listing

### Making a Donation
1. User clicks "Donate" on campaign detail page
2. Fills out `DonationForm` with amount and optional message
3. Form submitted via `supabase.from('donations').insert()`
4. Campaign's `current_amount` updated
5. Donation appears in recent donations list

### Viewing Dashboard
1. User clicks "Dashboard" in navbar
2. Middleware verifies authentication
3. Page fetches user's campaigns and donation statistics
4. `DashboardStats` component displays metrics
5. `CampaignList` shows all user's campaigns with edit/delete options

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue in the repository or contact the development team.
