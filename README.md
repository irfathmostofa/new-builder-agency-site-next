# Meridian Builders — Portfolio Site

Next.js App Router + Supabase portfolio site for a building/construction company,
with a full admin panel at `/admin`.

## What's here

**Public site**
- **Home** — signature "blueprint constructs into photograph" scroll hero (now visible from
  the very first frame, no blank state), intro, about us with image, featured buildings,
  stats, gallery preview, products preview, client logos, brochure download, CTA
- **Buildings** — filterable grid by building type
- **Building Detail** — hero, spec sheet, description, gallery
- **Products** (`/products`) — filterable grid by category, with detail pages
- **Gallery** (`/gallery`) — dynamic masonry gallery, filterable by category
- **What We Do** (`/what-we-do`) — services list
- **Board of Directors** (`/board`)
- **Blog** (`/blog`) — listing + individual post pages
- **About**, **Contact** (writes to Supabase `inquiries` table)
- Fully responsive — mobile nav menu, responsive grids throughout
- Logo and site name are dynamic (set in `/admin/hero`)

**Admin panel** (`/admin`)
- Login-gated (see Authentication setup below), responsive (collapses to a
  mobile menu under the `lg` breakpoint)
- **Dashboard** — quick counts
- **Hero & Home** — logo/site name, hero copy + hero building, about section,
  all section headings, brochure file, stats row, client logos
- **Buildings** / **Building Types** — full CRUD, gallery images per building
- **Products** / **Product Categories** — full CRUD
- **Gallery** — add/delete images with optional category tagging
- **Services** — CRUD for the What We Do page
- **Board** — CRUD for board members
- **Blog** — CRUD, draft vs published
- **Inquiries** — view and delete contact form submissions

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project**, then in the SQL editor run, in order:
    - `supabase/schema.sql` — the complete schema for a fresh project
      (all tables through the admin panel, products, gallery, services, board)
    - `supabase/storage.sql` — public `media` bucket for the image uploader

   If you already have an existing project from an earlier version, run
   only the migration file(s) you haven't applied yet, in order:
   `migration_v2_admin.sql` → `migration_v3_content.sql`.

3. **Environment variables** — copy `.env.example` to `.env` and fill in your
   Supabase project URL and anon key (Project Settings → API):
   ```bash
   cp .env.example .env
   ```

4. **Authentication setup (admin login)**

   The admin login form takes the username `irfath` and password `Irfath@98`,
   but under the hood it signs in through Supabase Auth — a password baked
   directly into the frontend code would be visible to anyone via browser
   dev tools, so this keeps the exact credentials you asked for while
   actually checking them server-side.

   To make it work:
   - In the Supabase dashboard, go to **Authentication → Users → Add user**
   - Email: `irfath@meridianbuilders.com`
   - Password: `Irfath@98`
   - That's it — the login page maps the username "irfath" to this email
     automatically. You can change the email in
     `src/pages/admin/AdminLogin.jsx` (the `ADMIN_EMAIL` constant) if you'd
     rather use your real email.

5. **Add data** — either through `/admin` once it's running, or directly via
   the Supabase Table Editor. For the home hero to render, mark at least one
   building `featured = true` with a `hero_image`, and ideally a
   `blueprint_image` (a line-drawing/sketch version of the same building —
   this powers the scroll-reveal effect).

6. **Run locally**
   ```bash
   npm run dev
   ```
   Visit `/admin` and log in with the credentials above.

7. **Deploy** — build command `npm run build`, then `npm start`, and add
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (or the older `VITE_SUPABASE_*` names) in the host dashboard.

## Notes

- Anyone signed in via Supabase Auth can write to buildings/blog/settings —
  fine for a single-admin site. If you ever add more admin accounts, all of
  them would have full write access.
- Row Level Security keeps writes locked to authenticated sessions only;
  the public site only ever reads, plus inserts into `inquiries`.
- The blueprint scroll effect degrades gracefully to a static photo if
  `blueprint_image` is left empty.
# building-site
