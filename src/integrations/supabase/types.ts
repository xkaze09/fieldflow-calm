export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      calls: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          from_number: string
          id: string
          lead_id: string | null
          notes: string | null
          recording_url: string | null
          started_at: string
          status: string
          to_number: string
          twilio_sid: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          recording_url?: string | null
          started_at?: string
          status?: string
          to_number: string
          twilio_sid?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          recording_url?: string | null
          started_at?: string
          status?: string
          to_number?: string
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      job_parts: {
        Row: {
          id: string
          job_id: string
          part_id: string
          qty: number
          total_cost: number
          total_price: number
        }
        Insert: {
          id?: string
          job_id: string
          part_id: string
          qty?: number
          total_cost?: number
          total_price?: number
        }
        Update: {
          id?: string
          job_id?: string
          part_id?: string
          qty?: number
          total_cost?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_parts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_parts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          call_id: string | null
          created_at: string
          id: string
          labor_cost: number | null
          labor_hours: number | null
          lead_id: string | null
          location: string | null
          parts_cost: number | null
          profit: number | null
          scheduled_at: string | null
          status: string
          technician_id: string | null
          total_price: number | null
          updated_at: string
        }
        Insert: {
          call_id?: string | null
          created_at?: string
          id?: string
          labor_cost?: number | null
          labor_hours?: number | null
          lead_id?: string | null
          location?: string | null
          parts_cost?: number | null
          profit?: number | null
          scheduled_at?: string | null
          status?: string
          technician_id?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          call_id?: string | null
          created_at?: string
          id?: string
          labor_cost?: number | null
          labor_hours?: number | null
          lead_id?: string | null
          location?: string | null
          parts_cost?: number | null
          profit?: number | null
          scheduled_at?: string | null
          status?: string
          technician_id?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          location: string | null
          name: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      parts_catalog: {
        Row: {
          created_at: string
          id: string
          name: string
          sku: string
          stock: number | null
          unit_cost: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sku: string
          stock?: number | null
          unit_cost?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sku?: string
          stock?: number | null
          unit_cost?: number
          unit_price?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          priority: string | null
          related_job_id: string | null
          related_lead_id: string | null
          status: string
          type: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          related_job_id?: string | null
          related_lead_id?: string | null
          status?: string
          type?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          related_job_id?: string | null
          related_lead_id?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_related_job_id_fkey"
            columns: ["related_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_lead_id_fkey"
            columns: ["related_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          commission_rate: number | null
          contact: string | null
          created_at: string
          hourly_cost: number
          hourly_rate: number
          id: string
          name: string
          team: string | null
        }
        Insert: {
          commission_rate?: number | null
          contact?: string | null
          created_at?: string
          hourly_cost?: number
          hourly_rate?: number
          id?: string
          name: string
          team?: string | null
        }
        Update: {
          commission_rate?: number | null
          contact?: string | null
          created_at?: string
          hourly_cost?: number
          hourly_rate?: number
          id?: string
          name?: string
          team?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
