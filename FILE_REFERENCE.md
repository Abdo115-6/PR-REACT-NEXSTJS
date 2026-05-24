# DonationFlow - File Reference Guide

This guide provides a quick reference to all important files in the project.

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation with architecture overview |
| `SETUP.md` | Step-by-step setup and deployment guide |
| `PROJECT_SUMMARY.md` | Comprehensive project completion summary |
| `FILE_REFERENCE.md` | This file - quick reference guide |

## Core Application Files

### Root Configuration Files
| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with metadata and global styles |
| `app/page.tsx` | Home page with campaign listing and hero section |
| `middleware.ts` | Authentication middleware for protected routes |
| `tailwind.config.ts` | Tailwind CSS configuration |

## Pages & Routes

### Public Pages
| File | Route | Purpose |
|------|-------|---------|
| `app/page.tsx` | `/` | Home page with campaigns and statistics |
| `app/auth/login/page.tsx` | `/auth/login` | User login page |
| `app/auth/sign-up/page.tsx` | `/auth/sign-up` | User registration page |
| `app/auth/callback/route.ts` | `/auth/callback` | OAuth/email confirmation callback |

### Campaign Pages
| File | Route | Purpose |
|------|-------|---------|
| `app/campaigns/[id]/page.tsx` | `/campaigns/[id]` | Campaign detail page with donations |

### Protected Dashboard Pages
| File | Route | Purpose |
|------|-------|---------|
| `app/dashboard/page.tsx` | `/dashboard` | Dashboard overview with statistics |
| `app/dashboard/create/page.tsx` | `/dashboard/create` | Create new campaign |
| `app/dashboard/campaigns/[id]/edit/page.tsx` | `/dashboard/campaigns/[id]/edit` | Edit campaign |

## Components

### Core Feature Components

#### Campaign Management
| File | Purpose |
|------|---------|
| `components/campaign-card.tsx` | Campaign listing card with progress |
| `components/campaign-form.tsx` | Campaign creation form |
| `components/campaign-edit-form.tsx` | Campaign editing form |
| `components/campaign-list.tsx` | Campaign management list for dashboard |

#### Donation System
| File | Purpose |
|------|---------|
| `components/donation-card.tsx` | Individual donation display |
| `components/donation-form.tsx` | Donation submission form |

#### Dashboard Components
| File | Purpose |
|------|---------|
| `components/dashboard-stats.tsx` | Statistics widget displaying metrics |
| `components/navbar.tsx` | Navigation bar with user menu |

#### Utility Components
| File | Purpose |
|------|---------|
| `components/progress-bar.tsx` | Progress visualization bar |
| `components/theme-provider.tsx` | Theme provider (light/dark mode) |

### shadcn/ui Components
All pre-built UI components are in `components/ui/` directory:
- `button.tsx` - Button component
- `card.tsx` - Card container
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line text input
- `dialog.tsx` - Modal dialog
- `dropdown-menu.tsx` - Dropdown menus
- And 60+ other components

## Library Files

### Supabase Integration
| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Client-side Supabase setup for browsers |
| `lib/supabase/server.ts` | Server-side Supabase setup for Next.js |
| `lib/supabase/middleware.ts` | Middleware for session management |
| `lib/utils.ts` | Utility functions (cn for class merging) |

## Database Schema Files

The database schema is created via Supabase SQL directly. The schema includes:

### Tables Created
1. **public.users** - User profiles
2. **public.campaigns** - Fundraising campaigns
3. **public.donations** - Donations to campaigns

### RLS Policies Created
- `users_select_public` - Public can view all users
- `users_insert_own` - Users can create own profile
- `users_update_own` - Users can update own profile
- `campaigns_select_public` - Public can view all campaigns
- `campaigns_insert_own` - Users can create own campaigns
- `campaigns_update_own` - Users can update own campaigns
- `campaigns_delete_own` - Users can delete own campaigns
- `donations_select_public` - Public can view all donations
- `donations_insert_allow` - Anyone can donate

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.mjs` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.mjs` | PostCSS configuration |
| `.env.local` | Environment variables (local development) |
| `.env.example` | Example environment variables |

## Key File Statistics

- **Total Pages**: 9
- **Reusable Components**: 9
- **shadcn/ui Components**: 60+
- **Pages with Authentication**: 3
- **API Routes**: 1
- **Supabase Config Files**: 3
- **Documentation Files**: 4

## File Organization Principles

### Pages (`app/`)
- One page per route
- Page files named `page.tsx`
- Dynamic routes use `[id]` syntax
- API routes use `route.ts`

### Components (`components/`)
- Reusable across multiple pages
- Feature-specific components in main folder
- UI components in `ui/` subfolder
- Each component in separate file

### Libraries (`lib/`)
- Utility functions and configurations
- Supabase setup and helpers
- TypeScript types and interfaces
- Shared constants

## Important Imports

### Common Component Imports
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
```

### Supabase Imports
```typescript
// Client-side
import { createClient } from '@/lib/supabase/client'

// Server-side
import { createClient } from '@/lib/supabase/server'
```

### Utility Imports
```typescript
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
```

## Navigation Flow

### Public User Flow
1. `/` - Browse campaigns
2. `/campaigns/[id]` - View campaign details
3. `/auth/sign-up` - Create account (if not registered)
4. Donate on campaign page
5. Redirect to `/auth/login` if accessing `/dashboard`

### Authenticated User Flow
1. Login via `/auth/login`
2. Redirected to `/dashboard`
3. Create campaign via `/dashboard/create`
4. Manage campaigns on `/dashboard`
5. Edit campaign via `/dashboard/campaigns/[id]/edit`
6. View all campaigns on `/`

## Modification Guide

### Adding New Page
1. Create folder in `app/` (e.g., `app/new-page/`)
2. Add `page.tsx` inside
3. Import components from `components/`

### Adding New Component
1. Create file in `components/` (e.g., `components/my-component.tsx`)
2. Export component as default or named export
3. Import in pages or other components

### Adding UI Component
1. Use shadcn/ui CLI: `npx shadcn-ui@latest add button`
2. Or copy from `components/ui/` examples
3. Import from `components/ui/[component-name]`

### Modifying Database Schema
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Create new query with modifications
4. Execute and test
5. Verify RLS policies

### Updating Styling
1. Modify Tailwind classes in components
2. Update `tailwind.config.ts` for custom colors
3. Update `app/globals.css` for global styles
4. Use `cn()` utility for conditional classes

## Dependencies by Purpose

### Frontend Framework
- `next` - React framework
- `react` - UI library
- `react-dom` - DOM rendering

### Styling
- `tailwindcss` - Utility CSS
- `tailwindcss-animate` - Animations
- `class-variance-authority` - Component variants

### Database/Auth
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering

### UI/Icons
- `lucide-react` - Icon library
- `radix-ui/*` - Component primitives

### Utilities
- `date-fns` - Date formatting
- `clsx` - Class merging
- `zustand` - State management (optional)

## Quick Command Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Run linter
pnpm type-check       # Check types

# Database
# (Accessed via Supabase Dashboard)

# Dependencies
pnpm install          # Install deps
pnpm add <package>    # Add new package
pnpm update           # Update packages
```

## Support & Troubleshooting

For issues with specific areas:
- **Setup**: See `SETUP.md`
- **Architecture**: See `README.md`
- **Features**: See `PROJECT_SUMMARY.md`
- **Deployment**: See `SETUP.md`

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Status**: Production Ready
