# Skoletimer v2.0

Multi-tenant SaaS for norske skoler - automatisk timeplanlegging og GAP-timeberegning.

## Funksjoner

- **Multi-tenant:** Hver skole har isolert data
- **GAP-timer:** Automatisk beregning basert på stillingsprosent og roller
- **Læreradministrasjon:** Kontaktlærere, fagledere, stillingsbrøk
- **Klasseadministrasjon:** Klasser med kontaktlærere
- **Fagadministrasjon:** Fag med fagledere og uketimer
- **Timeplan:** Ukentlig timeplanvisning
- **Timeføring:** Lærere kan logge arbeidstid

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Vercel (Hosting)

## Miljøvariabler

```env
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key
```

## Roller

- **super_admin:** Kan administrere alle skoler
- **school_admin:** Kan administrere sin skole (lærere, klasser, fag, timeplan)
- **teacher:** Kan se data og føre timer
