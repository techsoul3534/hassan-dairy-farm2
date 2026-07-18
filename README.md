# Hassan Dairy Farm — Livestock Register

A React + Vite app for managing your dairy herd, calves, beef & mutton
animals, vaccine reminders, and a daily to-do list. Data is saved in the
browser (localStorage), so it stays put between visits on the same device.

## Run it locally first (recommended)

You'll need Node.js installed (v18 or later): https://nodejs.org

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173) and try it out.

## Deploy to Vercel

1. Push this folder to a GitHub repository (see steps below).
2. Go to https://vercel.com and sign in with GitHub.
3. Click **Add New → Project**, select this repository.
4. Vercel auto-detects Vite — leave build command as `npm run build` and
   output directory as `dist`. Click **Deploy**.
5. You'll get a live URL like `hassan-dairy-farm.vercel.app`.

## Deploy to Netlify

1. Push this folder to a GitHub repository (see steps below).
2. Go to https://app.netlify.com and sign in with GitHub.
3. Click **Add new site → Import an existing project**, pick the repo.
4. Build command: `npm run build`  —  Publish directory: `dist`.
5. Click **Deploy site**.

## Pushing this folder to GitHub (needed for either option)

```bash
git init
git add .
git commit -m "Initial commit"
```

Then create a new empty repository on https://github.com/new (don't
add a README there), and run the two commands it shows you, e.g.:

```bash
git remote add origin https://github.com/YOUR_USERNAME/hassan-dairy-farm.git
git branch -M main
git push -u origin main
```

After that, Vercel/Netlify will redeploy automatically every time you
push a change to this repo.

## Notes

- Data is stored per-browser/device via localStorage — it won't sync
  between your phone and laptop automatically. If you want the whole
  family/farm crew to see the same live data from different devices,
  you'd need a real backend (e.g. Supabase or Firebase) instead of
  localStorage — ask if you'd like help wiring that up.
- Photos are stored as part of the record data, so avoid adding a very
  large number of high-resolution photos, as browser storage has limits
  (~5-10MB total depending on the browser).
