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
      company_employees: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          job_title: string | null
          person_id: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          job_title?: string | null
          person_id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          job_title?: string | null
          person_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employees_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tag_assignments: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tag_assignments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "contact_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          addresses: Json | null
          billing_rate: number | null
          city: string | null
          company_name: string | null
          contact_type_id: string
          country: string | null
          created_at: string | null
          created_by: string
          date_of_birth: string | null
          email: string | null
          emails: Json | null
          first_name: string | null
          id: string
          is_client: boolean | null
          job_title: string | null
          last_name: string | null
          ledes_client_id: string | null
          middle_name: string | null
          notes: string | null
          organization_id: string | null
          payment_profile: string | null
          phone: string | null
          phones: Json | null
          prefix: string | null
          profile_image_url: string | null
          state: string | null
          updated_at: string | null
          websites: Json | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          addresses?: Json | null
          billing_rate?: number | null
          city?: string | null
          company_name?: string | null
          contact_type_id: string
          country?: string | null
          created_at?: string | null
          created_by: string
          date_of_birth?: string | null
          email?: string | null
          emails?: Json | null
          first_name?: string | null
          id?: string
          is_client?: boolean | null
          job_title?: string | null
          last_name?: string | null
          ledes_client_id?: string | null
          middle_name?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_profile?: string | null
          phone?: string | null
          phones?: Json | null
          prefix?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string | null
          websites?: Json | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          addresses?: Json | null
          billing_rate?: number | null
          city?: string | null
          company_name?: string | null
          contact_type_id?: string
          country?: string | null
          created_at?: string | null
          created_by?: string
          date_of_birth?: string | null
          email?: string | null
          emails?: Json | null
          first_name?: string | null
          id?: string
          is_client?: boolean | null
          job_title?: string | null
          last_name?: string | null
          ledes_client_id?: string | null
          middle_name?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_profile?: string | null
          phone?: string | null
          phones?: Json | null
          prefix?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string | null
          websites?: Json | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_contact_type_id_fkey"
            columns: ["contact_type_id"]
            isOneToOne: false
            referencedRelation: "contact_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string | null
          default_value: string | null
          entity_type: string
          field_set: string | null
          field_type: string
          id: string
          is_required: boolean | null
          name: string
          options: Json | null
          organization_id: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          entity_type: string
          field_set?: string | null
          field_type: string
          id?: string
          is_required?: boolean | null
          name: string
          options?: Json | null
          organization_id: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          entity_type?: string
          field_set?: string | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          name?: string
          options?: Json | null
          organization_id?: string
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_field_set_fkey"
            columns: ["field_set"]
            isOneToOne: false
            referencedRelation: "custom_field_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_sets: {
        Row: {
          created_at: string | null
          entity_type: string
          id: string
          name: string
          organization_id: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_type: string
          id?: string
          name: string
          organization_id: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_type?: string
          id?: string
          name?: string
          organization_id?: string
          position?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_field_values: {
        Row: {
          created_at: string | null
          definition_id: string
          entity_id: string
          id: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          definition_id: string
          entity_id: string
          id?: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          definition_id?: string
          entity_id?: string
          id?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
        ]
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
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          designation: string | null
          email_alias: string | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          designation?: string | null
          email_alias?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          organization_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          designation?: string | null
          email_alias?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_private: boolean
          matter_id: string | null
          name: string
          priority: string
          status: string
          task_type: string | null
          time_estimate: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_private?: boolean
          matter_id?: string | null
          name: string
          priority?: string
          status?: string
          task_type?: string | null
          time_estimate?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_private?: boolean
          matter_id?: string | null
          name?: string
          priority?: string
          status?: string
          task_type?: string | null
          time_estimate?: string | null
          updated_at?: string
        }
        Relationships: []
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
