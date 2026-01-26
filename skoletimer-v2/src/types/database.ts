export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          org_number: string | null;
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
        };
        Insert: {
          id?: string;
          name: string;
          org_number?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          subscription_tier?: string;
          subscription_status?: string;
          trial_ends_at?: string | null;
        };
        Update: {
          name?: string;
          org_number?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          subscription_tier?: string;
          subscription_status?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          school_id: string | null;
          email: string;
          full_name: string;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          school_id?: string | null;
          email: string;
          full_name: string;
          role?: string;
          is_active?: boolean;
        };
        Update: {
          school_id?: string | null;
          email?: string;
          full_name?: string;
          role?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      teachers: {
        Row: {
          id: string;
          school_id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          position_percentage: number;
          is_contact_teacher: boolean;
          contact_teacher_class: string | null;
          contact_teacher_percentage: number;
          is_subject_leader: boolean;
          subject_leader_subject: string | null;
          subject_leader_percentage: number;
          other_roles: string | null;
          other_reduction_percentage: number;
          gap_hours: number;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          position_percentage?: number;
          is_contact_teacher?: boolean;
          contact_teacher_class?: string | null;
          contact_teacher_percentage?: number;
          is_subject_leader?: boolean;
          subject_leader_subject?: string | null;
          subject_leader_percentage?: number;
          other_roles?: string | null;
          other_reduction_percentage?: number;
          notes?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          position_percentage?: number;
          is_contact_teacher?: boolean;
          contact_teacher_class?: string | null;
          contact_teacher_percentage?: number;
          is_subject_leader?: boolean;
          subject_leader_subject?: string | null;
          subject_leader_percentage?: number;
          other_roles?: string | null;
          other_reduction_percentage?: number;
          notes?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          grade_level: number;
          study_program: string | null;
          students_count: number;
          contact_teacher_id: string | null;
          school_year: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          grade_level: number;
          study_program?: string | null;
          students_count?: number;
          contact_teacher_id?: string | null;
          school_year?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          grade_level?: number;
          study_program?: string | null;
          students_count?: number;
          contact_teacher_id?: string | null;
          school_year?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          code: string | null;
          hours_per_year: number | null;
          hours_per_week: number | null;
          subject_leader_id: string | null;
          category: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          code?: string | null;
          hours_per_year?: number | null;
          hours_per_week?: number | null;
          subject_leader_id?: string | null;
          category?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          code?: string | null;
          hours_per_year?: number | null;
          hours_per_week?: number | null;
          subject_leader_id?: string | null;
          category?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          school_id: string;
          class_id: string;
          subject_id: string;
          teacher_id: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          room: string | null;
          week_type: string;
          school_year: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class_id: string;
          subject_id: string;
          teacher_id?: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          room?: string | null;
          week_type?: string;
          school_year?: string | null;
          is_active?: boolean;
        };
        Update: {
          class_id?: string;
          subject_id?: string;
          teacher_id?: string | null;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          room?: string | null;
          week_type?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      time_logs: {
        Row: {
          id: string;
          school_id: string;
          teacher_id: string;
          date: string;
          hours: number;
          category: string;
          subject_id: string | null;
          class_id: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          teacher_id: string;
          date: string;
          hours: number;
          category: string;
          subject_id?: string | null;
          class_id?: string | null;
          description?: string | null;
        };
        Update: {
          date?: string;
          hours?: number;
          category?: string;
          subject_id?: string | null;
          class_id?: string | null;
          description?: string | null;
        };
        Relationships: [];
      };
      school_settings: {
        Row: {
          id: string;
          school_id: string;
          lesson_duration_minutes: number;
          school_start_time: string;
          school_end_time: string;
          gap_hours_factor: number;
          contact_teacher_default_percentage: number;
          current_school_year: string;
          first_semester_start: string | null;
          first_semester_end: string | null;
          second_semester_start: string | null;
          second_semester_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          school_id: string;
          lesson_duration_minutes?: number;
          school_start_time?: string;
          school_end_time?: string;
          gap_hours_factor?: number;
          contact_teacher_default_percentage?: number;
          current_school_year?: string;
        };
        Update: {
          lesson_duration_minutes?: number;
          school_start_time?: string;
          school_end_time?: string;
          gap_hours_factor?: number;
          contact_teacher_default_percentage?: number;
          current_school_year?: string;
          first_semester_start?: string | null;
          first_semester_end?: string | null;
          second_semester_start?: string | null;
          second_semester_end?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

// Helper types
export type School = Database["public"]["Tables"]["schools"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
export type Class = Database["public"]["Tables"]["classes"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type TimeLog = Database["public"]["Tables"]["time_logs"]["Row"];
export type SchoolSettings = Database["public"]["Tables"]["school_settings"]["Row"];
