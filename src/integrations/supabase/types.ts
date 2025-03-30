export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendars: {
        Row: {
          color: string
          created_at: string
          id: string
          is_default: boolean | null
          is_firm: boolean | null
          is_public: boolean | null
          is_statute: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_firm?: boolean | null
          is_public?: boolean | null
          is_statute?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_firm?: boolean | null
          is_public?: boolean | null
          is_statute?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string
          email: string | null
          event_id: string
          id: string
          name: string | null
          response_status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id: string
          id?: string
          name?: string | null
          response_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string
          id?: string
          name?: string | null
          response_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_documents: {
        Row: {
          created_at: string
          event_id: string
          id: string
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          reminder_time: number
          reminder_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          reminder_time: number
          reminder_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          reminder_time?: number
          reminder_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          assigned_lawyer: string | null
          calendar_id: string
          case_id: string | null
          client_name: string | null
          court_name: string | null
          created_at: string
          created_by: string
          description: string | null
          docket_number: string | null
          end_time: string
          event_type_id: string | null
          id: string
          is_recurring: boolean | null
          judge_details: string | null
          location: string | null
          matter_id: string | null
          recurrence_pattern: Json | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_lawyer?: string | null
          calendar_id: string
          case_id?: string | null
          client_name?: string | null
          court_name?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          docket_number?: string | null
          end_time: string
          event_type_id?: string | null
          id?: string
          is_recurring?: boolean | null
          judge_details?: string | null
          location?: string | null
          matter_id?: string | null
          recurrence_pattern?: Json | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_lawyer?: string | null
          calendar_id?: string
          case_id?: string | null
          client_name?: string | null
          court_name?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          docket_number?: string | null
          end_time?: string
          event_type_id?: string | null
          id?: string
          is_recurring?: boolean | null
          judge_details?: string | null
          location?: string | null
          matter_id?: string | null
          recurrence_pattern?: Json | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email_alias: string | null
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          created_at?: string | null
          email_alias?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          created_at?: string | null
          email_alias?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
      task_templates: {
        Row: {
          created_at: string | null
          default_assignee: string | null
          depends_on_task_id: string | null
          description: string | null
          due_date_offset: number
          due_date_type: string
          id: string
          is_private: boolean
          name: string
          position: number
          priority: string
          task_type: string | null
          time_estimate: string | null
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          default_assignee?: string | null
          depends_on_task_id?: string | null
          description?: string | null
          due_date_offset?: number
          due_date_type?: string
          id?: string
          is_private?: boolean
          name: string
          position?: number
          priority?: string
          task_type?: string | null
          time_estimate?: string | null
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          default_assignee?: string | null
          depends_on_task_id?: string | null
          description?: string | null
          due_date_offset?: number
          due_date_type?: string
          id?: string
          is_private?: boolean
          name?: string
          position?: number
          priority?: string
          task_type?: string | null
          time_estimate?: string | null
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_templates_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          practice_area: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          practice_area?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          practice_area?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_table_exists: {
        Args: {
          table_name: string
        }
        Returns: boolean
      }
      create_recurrence_rule: {
        Args: {
          frequency: string
          interval_val?: number
          week_days_val?: string[]
          month_days_val?: number[]
          ends_on_val?: string
          ends_after_val?: number
        }
        Returns: string
      }
      create_recurrence_rules_table: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      delete_recurrence_rule: {
        Args: {
          rule_id: string
        }
        Returns: boolean
      }
      is_organization_admin: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      update_recurrence_rule: {
        Args: {
          rule_id: string
          frequency: string
          interval_val?: number
          week_days_val?: string[]
          month_days_val?: number[]
          ends_on_val?: string
          ends_after_val?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
