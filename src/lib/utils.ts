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
  { name: "Norsk", code: "NOR", annualHours: 1770, category: "fellesfag" },
  { name: "Matematikk", code: "MAT", annualHours: 1201, category: "fellesfag" },
  { name: "Engelsk", code: "ENG", annualHours: 588, category: "fellesfag" },
  { name: "Naturfag", code: "NAT", annualHours: 615, category: "fellesfag" },
  { name: "Samfunnsfag", code: "SAF", annualHours: 634, category: "fellesfag" },
  { name: "KRLE", code: "KRL", annualHours: 580, category: "fellesfag" },
  { name: "Kunst og håndverk", code: "KHV", annualHours: 623, category: "fellesfag" },
  { name: "Musikk", code: "MUS", annualHours: 368, category: "fellesfag" },
  { name: "Mat og helse", code: "MHE", annualHours: 197, category: "fellesfag" },
  { name: "Kroppsøving", code: "KRO", annualHours: 701, category: "fellesfag" },
  { name: "Fremmedspråk/Fordypning", code: "FSP", annualHours: 222, category: "fellesfag" },
  { name: "Utdanningsvalg", code: "UTV", annualHours: 110, category: "fellesfag" },
  { name: "Valgfag", code: "VAL", annualHours: 171, category: "valgfag" },
];
