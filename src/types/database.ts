export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// SFS 2213 Årsrammer
export interface SfsAnnualFramework {
  id: string;
  school_type: 'grunnskole' | 'vgs';
  level_category: string;
  subject_category: string;
  description: string;
  hours_60min: number;
  hours_45min: number;
  weight_per_lesson: number;
  notes: string | null;
}

// Skole
export interface School {
  id: string;
  name: string;
  org_number: string | null;
  school_type: 'grunnskole' | 'vgs' | 'kombinert';
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

// Skoleinnstillinger
export interface SchoolSettings {
  id: string;
  school_id: string;
  current_school_year: string;
  school_weeks_per_year: number;
  lesson_duration_minutes: number;
  inspection_minutes_per_100_percent: number;
  school_day_start: string;
  school_day_end: string;
  default_contact_teacher_percent: number;
  default_advisor_percent: number;
  created_at: string;
  updated_at: string;
}

// Skolerute
export interface SchoolCalendar {
  id: string;
  school_id: string;
  school_year: string;
  week_number: number;
  start_date: string;
  end_date: string;
  week_type: 'school_week' | 'planning_day' | 'fall_break' | 'christmas_break' | 'winter_break' | 'easter_break' | 'summer_break' | 'other_break';
  description: string | null;
  is_teaching_week: boolean;
  created_at: string;
}

// Bruker
export interface User {
  id: string;
  school_id: string | null;
  email: string;
  full_name: string;
  role: 'super_admin' | 'school_admin' | 'teacher';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Trinn
export interface GradeLevel {
  id: string;
  school_id: string;
  name: string;
  level_number: number;
  school_type: 'grunnskole' | 'vgs';
  level_category: string;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

// Klasse
export interface Class {
  id: string;
  school_id: string;
  grade_level_id: string;
  name: string;
  study_program: string | null;
  student_count: number;
  school_year: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  grade_level?: GradeLevel;
}

// Fag
export interface Subject {
  id: string;
  school_id: string;
  name: string;
  short_name: string | null;
  subject_code: string | null;
  annual_hours_students: number | null;
  sfs_framework_id: string | null;
  custom_framework_hours_45min: number | null;
  category: 'fellesfag' | 'programfag' | 'valgfag' | 'annet' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  sfs_framework?: SfsAnnualFramework;
}

// Fag per klasse
export interface ClassSubject {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  hours_per_week: number;
  school_year: string;
  created_at: string;
  // Joins
  class?: Class;
  subject?: Subject;
}

// Lærer
export interface Teacher {
  id: string;
  school_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  employee_id: string | null;
  position_percent: number;
  default_sfs_framework_id: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  default_sfs_framework?: SfsAnnualFramework;
  functions?: TeacherFunction[];
  subjects?: TeacherSubject[];
}

// Lærerfunksjon
export interface TeacherFunction {
  id: string;
  school_id: string;
  teacher_id: string;
  function_type: 'contact_teacher' | 'advisor' | 'subject_leader' | 'department_head' | 'special_ed_coord' | 'ict_contact' | 'safety_rep' | 'union_rep' | 'other';
  description: string | null;
  percent_of_position: number;
  hours_per_week: number | null;
  class_id: string | null;
  subject_id: string | null;
  school_year: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  class?: Class;
  subject?: Subject;
}

// Lærer-fag kobling
export interface TeacherSubject {
  id: string;
  school_id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string | null;
  hours_per_week: number;
  custom_sfs_framework_id: string | null;
  school_year: string;
  created_at: string;
  // Joins
  subject?: Subject;
  class?: Class;
  custom_sfs_framework?: SfsAnnualFramework;
}

// Elev
export interface Student {
  id: string;
  school_id: string;
  class_id: string | null;
  name: string;
  student_id: string | null;
  has_iop: boolean;
  iop_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  class?: Class;
}

// Assistent/Fagarbeider
export interface Assistant {
  id: string;
  school_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  employee_id: string | null;
  position_percent: number;
  role_type: 'assistant' | 'fagarbeider' | 'miljøarbeider' | 'other';
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Beregnet stillingsdata
export interface TeacherPositionCalculation {
  teacher_id: string;
  teacher_name: string;
  base_position: number;
  functions_percent: number;
  teaching_hours_per_week: number;
  teaching_percent: number;
  total_percent: number;
  gap_percent: number;
  gap_hours_per_year: number;
  inspection_minutes_per_week: number;
}

// Funksjonstyper for visning
export const FUNCTION_TYPES = {
  contact_teacher: 'Kontaktlærer',
  advisor: 'Rådgiver',
  subject_leader: 'Fagleder',
  department_head: 'Avdelingsleder',
  special_ed_coord: 'Spesialpedagogisk koordinator',
  ict_contact: 'IKT-kontakt',
  safety_rep: 'Verneombud',
  union_rep: 'Tillitsvalgt',
  other: 'Annet',
} as const;

// Uketyper for skolerute
export const WEEK_TYPES = {
  school_week: 'Skoleuke',
  planning_day: 'Planleggingsdag',
  fall_break: 'Høstferie',
  christmas_break: 'Juleferie',
  winter_break: 'Vinterferie',
  easter_break: 'Påskeferie',
  summer_break: 'Sommerferie',
  other_break: 'Annen fri',
} as const;

// Fagkategorier
export const SUBJECT_CATEGORIES = {
  fellesfag: 'Fellesfag',
  programfag: 'Programfag',
  valgfag: 'Valgfag',
  annet: 'Annet',
} as const;

// Leseplikt / Undervisningsplikt
export interface TeachingLoad {
  id: string;
  school_type: 'grunnskole' | 'vgs';
  level_category: string;
  subject_category: string;
  description: string;
  hours_per_week: number;
  hours_per_year: number;
  percent_per_lesson: number;
  notes: string | null;
}

// Leseplikt-kategorier for visning
export const TEACHING_LOAD_CATEGORIES = {
  'norsk': 'Norsk/Samisk/Tegnspråk',
  'engelsk_mathelse': 'Engelsk, Mat og helse',
  'ovrige_fag': 'Øvrige fag',
  'alle_fag': 'Alle fag (barnetrinnet)',
  'norsk_vgs': 'Norsk VGS',
  'realfag': 'Realfag/Fremmedspråk VGS',
  'fellesfag_vgs': 'Fellesfag VGS',
  'yrkesfag': 'Yrkesfag VGS',
} as const;
