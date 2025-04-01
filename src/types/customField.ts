
export interface CustomFieldDefinition {
  id: string;
  organization_id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'email' | 'phone' | 'url';
  entity_type: 'contact' | 'matter' | 'task';
  default_value: string | null;
  is_required: boolean;
  options: string[] | null;
  field_set: string | null;
  position: number | null;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldValue {
  id: string;
  definition_id: string;
  entity_id: string;
  value: string | null;
  created_at: string;
  updated_at: string;
  definition?: CustomFieldDefinition;
}

export interface CustomFieldFormValue {
  definition_id: string;
  value: string | null;
}

export interface CustomFieldSet {
  id: string;
  name: string;
  entity_type: 'contact' | 'matter' | 'task';
  organization_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// Add a type helper for Supabase database tables
export type DbTables = 'calendars' | 'company_employees' | 'contacts' | 
  'contact_tag_assignments' | 'contact_tags' | 'organizations' | 
  'contact_types' | 'custom_field_definitions' | 'custom_field_values' | 
  'custom_field_sets' | 'event_attendees' | 'event_documents' | 'event_reminders' | 
  'event_types' | 'events' | 'profiles' | 'task_templates' | 'tasks' | 'workflow_templates';

// Create a type for selected custom fields on a contact
export interface ContactCustomField {
  contact_id: string;
  field_definition_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
