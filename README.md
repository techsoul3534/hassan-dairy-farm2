# Hassan Dairy Farm — Livestock Register

A React + Vite app for managing your dairy herd, calves, beef & mutton
animals, vaccine reminders, and a daily to-do list. Data is stored in
Supabase (a free hosted database), so every device — phone, tablet,
laptop — sees the same live data, and changes on one device appear on
the others automatically.

## One-time setup: create your Supabase project

1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Pick any name, set a database password
   (save it somewhere), pick a region close to you, and create it.
   Wait ~2 minutes while it provisions.
3. In the left sidebar, open the **SQL Editor**, click **New query**,
   paste in the contents of `supabase-setup.sql` (included in this
   project), and click **Run**. This creates the table that stores
   your farm's data.
4. In the left sidebar, go to **Project Settings → Data API**. Copy:
   - **Project URL**
   - **anon public** key (under Project API keys)
5. (Recommended) In the left sidebar go to **Database → Replication**
   and enable replication for the `farm_state` table — this powers
   the instant sync between devices. Without it, the app still works,
   it just needs a manual refresh to see another device's changes.

## Run it locally

You'll need Node.js installed (v18 or later): https://nodejs.org

```bash
npm install
cp .env.example .env
```

Open the new `.env` file and paste in your Project URL and anon key
from step 4 above. Then:

```bash
npm run dev
```

Open the URL it prints (usually http://localhost:5173) and try it out.

## Deploy to Netlify (or Vercel)

Same as before — push this folder to GitHub, then import it in
Netlify/Vercel with build command `npm run build` and publish
directory `dist`.

**Important extra step:** your live site also needs the same two
environment variables, since `.env` is never uploaded to GitHub:

- **Netlify**: Site configuration → Environment variables → Add a
  variable → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with
  the same values from your `.env` file. Then trigger a new deploy
  (Deploys → Trigger deploy → Clear cache and deploy site).
- **Vercel**: Project Settings → Environment Variables → add the same
  two, then redeploy.

## Notes

- Every device that opens your site URL shares the exact same data —
  no per-device copies anymore.
- The anon key is meant to be used in browser code, but this setup
  gives anyone with that key full read/write access to your farm data
  (there's no login screen). That's fine for a small private tool used
  by you and your farm staff — just don't publish the live link
  somewhere public. Ask if you'd like a login screen added later.
- Photos are still stored as part of each record's data — avoid a very
  large number of high-resolution photos, since Supabase's free tier
  has a database size limit (500MB), and each photo adds to that.

