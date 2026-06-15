# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The line above is intentional and important. This repo runs a version of Next.js with breaking changes from what you may know. **Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`** and heed deprecation notices.

## Project

A Duolingo-style learning app for kids ("RomduolKids" / package `romduol-kids`). Courses (Khmer, English, Math) → units → lessons → challenges (multiple-choice quizzes) with hearts, XP/points, quests, a leaderboard, and a shop. Forked from `sanidhyy/duolingo-clone` and adapted with i18n and Math content.

## Commands

```bash
npm run dev          # dev server (Next.js + Turbopack)
npm run build        # production build (Turbopack)
npm run start        # serve the production build
npm run lint         # eslint
npm run lint:fix     # eslint --fix
npm run format:fix   # prettier --write

npm run db:push      # push db/schema.ts to the database (drizzle-kit, no migration files)
npm run db:studio    # open Drizzle Studio
npm run db:prod      # seed the database (runs scripts/prod.ts — WIPES all data first)
npm run templates:gen # regenerate admin Excel import templates into public/template/
```

There is **no test suite**. Schema changes are applied with `db:push` (Drizzle generates no migration files in this project).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS 3 + shadcn/ui (Radix) · Drizzle ORM on Neon serverless Postgres · Clerk auth · custom shadcn admin panel (+ SheetJS `xlsx` for Excel import) · Zustand (client modals) · Stripe (subscriptions — see caveat below). Path alias `@/*` → repo root.

## Architecture

### Data layer (`db/`)
- `db/schema.ts` — single source of truth. Hierarchy: `courses → units → lessons → challenges → challengeOptions`. Plus `challengeProgress`, `userProgress` (hearts/points/active course), `userSubscription`. `challengesEnum` is `SELECT | ASSIST`.
- `db/drizzle.ts` — exports the `db` client (Neon HTTP driver + schema).
- `db/queries.ts` — all reads. Every query is wrapped in React `cache()` and scoped to the Clerk `userId` from `auth()`. Returns "normalized" data (e.g. lessons/challenges decorated with a computed `completed` boolean). Read from here in Server Components.
- Writes happen through **server actions** in `actions/` (`"use server"`): `upsertChallengeProgress`, `reduceHearts`, `refillHearts`, `upsertUserProgress`. They call `auth()`, mutate, then `revalidatePath(...)` for every affected route. Gameplay constants live in `constants.ts` (`MAX_HEARTS = 5`, `POINTS_TO_REFILL = 10`, +10 points per challenge).

### Internationalization (`app/[lang]/`)
The entire app lives under the `[lang]` dynamic segment.
- `app/[lang]/dictionaries.ts` (`server-only`) — `locales = ["km", "en"]`, default `km`. **Gotcha:** the Khmer locale code is `km` but its translation file is `dictionaries/kh.json` (`en` → `en.json`). `generateStaticParams` pre-renders both locales.
- `app/[lang]/layout.tsx` resolves the dictionary server-side and passes it to `DictionaryProvider` (`lang-provider.tsx`). Client components read copy via `useDictionary()` and the active locale via `useLocale()`.
- **Navigation must be locale-prefixed** — push to `/${locale}/learn`, not `/learn`. Dictionary lookups use flat dotted keys with a fallback string, e.g. `dict["lesson.greatJob"] || "Great job!"`.

### Route groups under `[lang]`
`(marketing)` (landing), `(auth)` (Clerk sign-in/up), `(main)` (app shell: learn, courses, leaderboard, quests, shop), plus `lesson/` (the quiz player) and `admin/`.

### Quiz gameplay
`app/[lang]/lesson/quiz.tsx` is the core client game loop: tracks active challenge, selection, and correct/wrong status; plays audio + confetti; calls `upsertChallengeProgress` / `reduceHearts` inside `useTransition`. Server actions return `{ error: "hearts" | "practice" | "subscription" }` sentinels that the UI branches on (e.g. open the hearts modal). Modal open/close state is global Zustand stores in `store/`.

### Admin panel (`app/[lang]/admin/`)
A **custom shadcn admin** (replaced react-admin), loaded client-only via `next/dynamic` (`ssr: false`) — `page.tsx` (server, `getIsAdmin()` guard) → `app.tsx` → `app-content.tsx` (the shell: sidebar nav + list/form views, all in client state, no nested routes). It is **config-driven**:
- `app/[lang]/admin/resources.ts` — the single source of truth for the admin. A pure-data array (no React, no server imports) describing each resource's fields (`text` / `number` / `boolean` / `select` / `reference`), table columns, and `representation` (label field for FK dropdowns). Imported by **both** the client UI and the server import route.
- `app/[lang]/admin/data-provider.ts` — thin browser `fetch` client over the existing `/api/<resource>` REST routes (list/getOne/create/update/remove) plus `importExcel`.
- `app/[lang]/admin/components/` — generic `ResourceList` (shadcn `Table`, client-side pagination + rows-per-page, edit/delete, FK label resolution), `ResourceForm` (create/edit, all field types, FK `Select`s populated from the referenced resource), and `ExcelUpload`.
- Excel import: `app/api/import/route.ts` (POST, `getIsAdmin`-gated) parses the uploaded workbook server-side with **SheetJS (`xlsx`)**, coerces each cell by the resource's field types, and **appends** rows (FK violations surface as a 400). Per-resource "Upload Excel" button lives in `ResourceList`. Header-only `.xlsx` templates live in `public/template/<resource>.xlsx` (linked from the upload dialog) and are generated from `resources.ts` by `scripts/gen-templates.ts` (`npm run templates:gen`) — regenerate when a resource's fields change.

Backing REST routes in `app/api/*` (courses, units, lessons, challenges, challengeOptions, each with `[id]`) and the admin page are gated by `getIsAdmin()` (`lib/admin.ts`), which checks the Clerk `userId` against `CLERK_ADMIN_IDS`. **To add a resource:** add an entry to `resources.ts` and create `app/api/<resource>/route.ts` (+ `[id]/route.ts`) and a `case` in `app/api/import/route.ts`. (`next.config.ts` still adds CORS + a hardcoded `Content-Range` header on `/api/*` — leftover from react-admin; now unused but harmless.)

## Important caveats

- **Subscriptions are stubbed.** `getUserSubscription()` in `db/queries.ts` ignores the database and always returns `isActive: true` (expiry ~100 years out), so hearts are effectively unlimited for everyone. The `userSubscription` table, Stripe lib (`lib/stripe.ts`), and the webhook (`app/api/webhooks/stripe/route.ts`) still exist but are bypassed. Don't assume subscription state is real.
- **There is no `middleware.ts`.** Clerk is wired only through `<ClerkProvider>` in the layout; route protection is enforced per-page/per-action via `auth()` / `getIsAdmin()`, not middleware.
- `scripts/prod.ts` (`db:prod`) **deletes all data** before seeding. Never run it against a database with real progress.

## Environment

Copy `.env.example` to `.env` (the `db:*` commands load `.env` via `dotenv/config`, not `.env.local`). Vars: `DATABASE_URL` (Neon), Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`), `CLERK_ADMIN_IDS` (admin Clerk user IDs, **comma-and-space** separated: `id1, id2`), `NEXT_PUBLIC_APP_URL` (used by `absoluteUrl` in `lib/utils.ts`), and Stripe keys for the (stubbed) billing flow — note the secret is named **`STRIPE_API_SECRET_KEY`** (not `STRIPE_SECRET_KEY`), plus `STRIPE_WEBHOOK_SECRET`.
