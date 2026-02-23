# OrgHub Platform

> Open-source member portal platform for nonprofits — self-hostable or managed cloud.

Events · Committees · Newsletters · Messaging · Volunteer Hub · Zoom Meetings

## What is OrgHub?

OrgHub gives any nonprofit — lodges, cultural societies, service clubs, HOAs, youth leagues — a full-featured member portal out of the box. One platform, unlimited organizations, each with their own subdomain, branding, and feature set.

## Repository Structure

```
orghub-platform/
├── apps/
│   ├── web/          # Per-org member portal (Next.js 15)
│   ├── marketing/    # Public landing page & pricing (Next.js 15)
│   └── admin/        # Platform super-admin dashboard (Next.js 15)
├── packages/
│   ├── db/           # Shared Supabase types & client utilities
│   ├── ui/           # Shared React component library
│   └── config/       # Org config schema & loader
├── supabase/
│   └── migrations/   # Multi-tenant database schema
└── docs/             # Architecture & contribution guides
```

## Architecture

- **Multi-tenant DB**: Single Supabase project, `org_id` on every table, RLS scopes all queries per org
- **Subdomain routing**: `org-slug.orghub.app` → resolved by Next.js middleware
- **Custom domains**: `members.myorg.org` → Vercel domain mapping
- **Auth**: Supabase Auth with custom JWT claims carrying `org_id`
- **Monorepo**: Turborepo + pnpm workspaces

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/marketing/.env.example apps/marketing/.env.local

# Run all apps in dev mode
pnpm dev

# Or run a specific app
pnpm --filter web dev
```

## Apps & Ports (dev)

| App | Port | URL |
|-----|------|-----|
| web | 3000 | http://localhost:3000?org=elks-672 |
| marketing | 3001 | http://localhost:3001 |
| admin | 3002 | http://localhost:3002 |

## Database Setup

```bash
# Apply migrations to your Supabase project
supabase db push

# Or run against local Supabase
supabase start
supabase db reset
```

## License

MIT — free to use, self-host, and modify. Contributions welcome.
