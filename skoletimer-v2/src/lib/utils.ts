import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGapHours(hours: number): string {
  return hours.toFixed(2) + " timer";
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatTime(time: string): string {
  return time.slice(0, 5); // HH:MM
}

export const DAYS_OF_WEEK = [
  { value: 1, label: "Mandag" },
  { value: 2, label: "Tirsdag" },
  { value: 3, label: "Onsdag" },
  { value: 4, label: "Torsdag" },
  { value: 5, label: "Fredag" },
];

export const TIME_LOG_CATEGORIES = [
  { value: "undervisning", label: "Undervisning" },
  { value: "for_og_etterarbeid", label: "For- og etterarbeid" },
  { value: "kontaktlaerer", label: "Kontaktlærerarbeid" },
  { value: "fagleder", label: "Faglederarbeid" },
  { value: "moter", label: "Møter" },
  { value: "faglig_utvikling", label: "Faglig utvikling" },
  { value: "annet", label: "Annet" },
];

export const GRADE_LEVELS = [
  { value: 8, label: "8. trinn" },
  { value: 9, label: "9. trinn" },
  { value: 10, label: "10. trinn" },
  { value: 11, label: "VG1" },
  { value: 12, label: "VG2" },
  { value: 13, label: "VG3" },
];

export const SUBJECT_CATEGORIES = [
  { value: "fellesfag", label: "Fellesfag" },
  { value: "programfag", label: "Programfag" },
  { value: "valgfag", label: "Valgfag" },
];
