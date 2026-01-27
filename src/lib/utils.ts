import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatering
export function formatPercent(value: number): string {
  return value.toFixed(2) + "%";
}

export function formatHours(hours: number): string {
  return hours.toFixed(2) + " t";
}

export function formatMinutes(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} t`;
  return `${hrs} t ${mins} min`;
}

// Beregninger
export function calculateWeeklyHours(annualHours: number, weeks: number = 38): number {
  return annualHours / weeks;
}

export function calculateTeachingPercent(
  hoursPerWeek: number,
  frameworkHours45min: number,
  schoolWeeks: number = 38
): number {
  // Vekting per time = 100 / årsramme
  const weightPerLesson = 100 / frameworkHours45min;
  // Årstimer = uketimer * antall uker
  const annualHours = hoursPerWeek * schoolWeeks;
  // Prosent = årstimer * vekting
  return annualHours * weightPerLesson;
}

export function calculateGapHours(
  gapPercent: number,
  frameworkHours45min: number
): number {
  // GAP-timer = GAP% / vekting per time
  const weightPerLesson = 100 / frameworkHours45min;
  return gapPercent / weightPerLesson;
}

export function calculateInspectionMinutes(
  positionPercent: number,
  inspectionPer100: number
): number {
  return Math.round((positionPercent / 100) * inspectionPer100);
}

// Hjelpefunksjoner
export function getSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Skoleåret starter i august
  if (month >= 7) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Trinn-hjelpere
export const GRADE_LEVELS_GRUNNSKOLE = [
  { level: 1, name: "1. trinn", category: "barnetrinnet" },
  { level: 2, name: "2. trinn", category: "barnetrinnet" },
  { level: 3, name: "3. trinn", category: "barnetrinnet" },
  { level: 4, name: "4. trinn", category: "barnetrinnet" },
  { level: 5, name: "5. trinn", category: "barnetrinnet" },
  { level: 6, name: "6. trinn", category: "barnetrinnet" },
  { level: 7, name: "7. trinn", category: "barnetrinnet" },
  { level: 8, name: "8. trinn", category: "ungdomstrinnet" },
  { level: 9, name: "9. trinn", category: "ungdomstrinnet" },
  { level: 10, name: "10. trinn", category: "ungdomstrinnet" },
];

export const GRADE_LEVELS_VGS = [
  { level: 11, name: "VG1", category: "vgs" },
  { level: 12, name: "VG2", category: "vgs" },
  { level: 13, name: "VG3", category: "vgs" },
];

// Standard fag med årstimer fra Udir (grunnskole totalt)
export const STANDARD_SUBJECTS_GRUNNSKOLE = [
  { name: "Norsk", code: "NOR", annualHours: 1770, category: "fellesfag", teachingLoadCategory: "norsk" },
  { name: "Matematikk", code: "MAT", annualHours: 1201, category: "fellesfag", teachingLoadCategory: "ovrige_fag" },
  { name: "Engelsk", code: "ENG", annualHours: 588, category: "fellesfag", teachingLoadCategory: "engelsk_mathelse" },
  { name: "Naturfag", code: "NAT", annualHours: 615, category: "fellesfag", teachingLoadCategory: "ovrige_fag" },
  { name: "Samfunnsfag", code: "SAF", annualHours: 634, category: "fellesfag", teachingLoadCategory: "ovrige_fag" },
  { name: "KRLE", code: "KRL", annualHours: 580, category: "fellesfag", teachingLoadCategory: "ovrige_fag" },
  { name: "Kunst og håndverk", code: "KHV", annualHours: 623, category: "fellesfag", teachingLoadCategory: "ovrige_fag" },
  { name: "Musikk", code: "MUS", annualHours: 368, category: "fellesfag", teachingLoadCategory: "ovrige_fag" },
  { name: "Mat og helse", code: "MHE", annualHours: 197, category: "fellesfag", teachingLoadCategory: "engelsk_mathelse" },
  { name: "Kroppsøving", code: "KRO", annualHours: 701, category: "fellesfag", teachingLoadCategory: "ovrige_fag" },
  { name: "Fremmedspråk/Fordypning", code: "FSP", annualHours: 222, category: "fellesfag", teachingLoadCategory: "ovrige_fag" },
  { name: "Utdanningsvalg", code: "UTV", annualHours: 110, category: "fellesfag", teachingLoadCategory: "ovrige_fag" },
  { name: "Valgfag", code: "VAL", annualHours: 171, category: "valgfag", teachingLoadCategory: "ovrige_fag" },
];

// Leseplikt-verdier (timer per uke) fra særavtalen
export const LESEPLIKT = {
  // Barnetrinnet
  barnetrinnet: {
    alle_fag: 26.00,
  },
  // Ungdomstrinnet
  ungdomstrinnet: {
    norsk: 22.30,           // Norsk, Samisk, Tegnspråk
    engelsk_mathelse: 23.29, // Engelsk, Mat og helse
    ovrige_fag: 24.95,      // Øvrige fag (standard)
  },
  // VGS
  vgs: {
    norsk_vgs: 16.37,       // Norsk stud.spes VG2/3
    realfag: 17.39,         // Realfag, Fremmedspråk VG2/3
    fellesfag_vgs: 18.42,   // Fellesfag standard
    yrkesfag: 22.53,        // Yrkesfag programfag
  }
};

// Beregn stillingsprosent fra undervisningstimer
export function calculateTeachingPercentFromLeseplikt(
  hoursPerWeek: number,
  lesepliktHoursPerWeek: number
): number {
  if (lesepliktHoursPerWeek === 0) return 0;
  return (hoursPerWeek / lesepliktHoursPerWeek) * 100;
}

// Standard leseplikt for "øvrige fag" ungdomstrinnet
export const DEFAULT_LESEPLIKT_HOURS_PER_WEEK = 24.95;
