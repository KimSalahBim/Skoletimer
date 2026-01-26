# Skoletimer

Timeregistrering for lærere - en Next.js applikasjon med Supabase backend.

## Funksjonalitet

- **Autentisering** - Registrering og innlogging med e-post/passord
- **Fag** - Legg til, rediger og slett fag med årsrammer
- **Loggføring** - Registrer timer per fag per dag
- **Statistikk** - Se progress mot årsrammer

## Oppsett

Denne appen er hostet på Vercel og bruker Supabase som backend.

Miljøvariabler settes i Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

