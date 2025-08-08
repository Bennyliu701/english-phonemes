# English Phonemes (MVP)

H5 online platform MVP for junior students to learn phonemes. Built with Next.js + Prisma (React stack). Ready for Vercel.

## Stack
- Next.js 14 (App Router, TypeScript)
- Prisma + PostgreSQL (use free Neon/Render/Supabase)
- Minimal API routes for health and attempts
- Client recording via MediaRecorder (demo only)

## Getting started
1. Create a free Postgres database (e.g., Neon). Get the `DATABASE_URL` connection string.
2. Copy env and install deps:
   - macOS/Linux:
     - cp .env.example .env
     - edit .env, set DATABASE_URL
   - npm install
3. Initialize Prisma:
   - npx prisma generate
   - npx prisma migrate dev --name init
   - npm run seed
4. Dev server (follow your rule: background + log):
   - nohup npm run dev > dev.log 2>&1 &
   - tail -f dev.log
5. Open http://localhost:3000

## Deploy to Vercel
- vercel link --yes
- vercel env add DATABASE_URL  # paste your connection string (or use Vercel secret)
- vercel --prod --confirm

## Notes
- Replace mock scoring in `src/lib/scoring.ts` with cloud service (server-side) later.
- For audio storage, integrate object storage and save URL into `Audio` table.
