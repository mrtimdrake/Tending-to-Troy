# Tending to Troy — Setup Guide

Follow these steps once to get the app running. After this, development is just `npm run dev`.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Name it `tending-to-troy`. Choose a strong database password and save it somewhere safe.
4. Select the region closest to you (UK-based: `eu-west-2` London if available).
5. Wait for the project to finish provisioning (~1 minute).

---

## 2. Run the Database Migrations

In Supabase, open the **SQL Editor** (left sidebar).

Run each migration file in order:

### Migration 1 — Schema
Copy the contents of `supabase/migrations/001_schema.sql` and run it.

### Migration 2 — RLS Policies
Copy the contents of `supabase/migrations/002_rls.sql` and run it.

You should see no errors. The tables will appear in the **Table Editor**.

---

## 3. Configure Authentication

In Supabase, go to **Authentication > Providers**.

- Confirm **Email** provider is enabled.
- Under **Auth > Settings**, disable "Confirm email" for now (you can enable it later when you have a custom email domain set up).

---

## 4. Get Your API Keys

In Supabase, go to **Project Settings > API**.

Copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

> The service role key has full database access. Never commit it or expose it to the browser.

---

## 5. Create Your Local Environment File

In the project root, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the three Supabase values from Step 4.

---

## 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You should be redirected to the sign-in page. From there:
1. Click **Register** to create the first account (yours).
2. After registering, you'll land on the home screen with an invitation link.
3. Copy that link and send it to your partner.
4. Your partner follows the link and creates their account.
5. The household is now complete.

---

## 7. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** and import the `Tending-to-Troy` repository.
3. Under **Environment Variables**, add the same three Supabase values plus:
   - `NEXT_PUBLIC_APP_URL` = your Vercel production URL (e.g. `https://tending-to-troy.vercel.app`)
4. Click **Deploy**.

From this point, every push to `main` deploys automatically.

---

## 8. Update Supabase Auth Redirect URL

Once deployed, go to Supabase **Authentication > URL Configuration** and add your Vercel URL to the **Redirect URLs** list.

---

## Verifying RLS (Optional but Recommended)

To confirm RLS is working correctly:

1. Create two Supabase Auth users in different households (use the SQL Editor to insert test rows if needed).
2. Sign in as each user and confirm they can only see their own tasks.

The SQL to test this manually:
```sql
-- Check that get_my_household_id() returns the right value
select get_my_household_id();

-- Attempt to read another household's tasks (should return 0 rows)
select * from tasks where household_id = '<other-household-id>';
```

---

## Troubleshooting

**"Unable to create your account"** — Check that email confirmation is disabled in Supabase Auth settings.

**"A household already exists"** — The first user registration is one-time only. If you need to reset, delete all rows from `households` and `users` in the Supabase Table Editor.

**Environment variables not loading** — Make sure the file is named `.env.local` (not `.env`) and that you've restarted `npm run dev` after creating it.
