# Skoletimer v3.0 – Fase 1

Multi-tenant SaaS for norske skoler - stillingsberegning og GAP-timer.

## Fase 1 Funksjoner

- **Lærere med funksjoner** – Kontaktlærer, rådgiver, fagleder osv. med prosentsatser
- **Trinn og klasser** – Definer trinn (1-10, VG1-3) og klasser (8A, 8B, osv.)
- **Fag med årsrammer** – SFS 2213 årsrammer med automatisk vekting
- **Stillingsberegning** – Automatisk beregning av GAP-timer
- **Inspeksjonsminutter** – Basert på stillingsprosent
- **Skoleinnstillinger** – Konfigurerbare parametere

## Beregningslogikk

### GAP-timer formel:
```
GAP% = Stillingsprosent - Funksjoner% - Undervisning%

Undervisning% = Σ (uketimer × 38 uker × vekting per time)
Vekting per time = 100% / årsramme
```

### Eksempel:
```
Lærer: 100% stilling
- Kontaktlærer: 5%
- Undervisning: 20 t/u × 38 uker × (100/700) = 108.57%

Totalt brukt: 5% + 108.57% = 113.57%
GAP: 100% - 113.57% = -13.57% (overbelastet!)
```

## Årsrammer (SFS 2213)

| Skoleslag | Fag | Årsramme 45min |
|-----------|-----|----------------|
| Grunnskole - Barnetrinnet | Alle fag | 988 |
| Grunnskole - Ungdomstrinnet | Norsk | 847 |
| Grunnskole - Ungdomstrinnet | Engelsk, Mat og helse | 885 |
| Grunnskole - Ungdomstrinnet | Øvrige fag | 948 |
| VGS | Varierer | 622-856 |

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + RLS)
- Vercel (Hosting)

## Miljøvariabler

```env
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key
```

## Neste faser

- **Fase 2:** Timeplanbygger med kollisjonsdeteksjon
- **Fase 3:** IOP-støtte og fagarbeidere
- **Fase 4:** Rapporter og eksport
