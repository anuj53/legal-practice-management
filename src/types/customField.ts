
export interface CustomFieldDefinition {
  id: string;
  organization_id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'email' | 'phone' | 'url';
  entity_type: 'contact' | 'matter' | 'task';
  default_value: string | null;
  is_required: boolean;
  options: string[] | null;
  created_at: string;
  updated_at: string;
  field_set: string | null;
  position: number;
  pos_order?: number; // Added for compatibility with RPC function returns
}

export interface CustomFieldSet {
  id: string;
  organization_id: string;
  name: string;
  entity_type: 'contact' | 'matter' | 'task';
  position: number;
  pos_order?: number; // Added for compatibility with RPC function returns
  created_at: string;
  updated_at: string;
  fields?: CustomFieldDefinition[];
}

export interface CustomFieldValue {
  id: string;
  definition_id: string;
  entity_id: string;
  value: string | null;
  created_at: string;
  updated_at: string;
  definition?: CustomFieldDefinition;
  field_type?: string; // Added this for ContactDetail.tsx
}

export interface CustomFieldFormValue {
  definition_id: string;
  value: string | null;
}

// Interface for contact field assignments
export interface ContactFieldSetAssignment {
  id: string;
  contact_id: string;
  field_set_id: string;
  created_at?: string;
}

export interface ContactFieldAssignment {
  id: string;
  contact_id: string;
  field_id: string;
  created_at?: string;
}

// Helper type for Supabase query responses to avoid TypeScript errors
export type CustomFieldSetWithFields = CustomFieldSet & { fields: CustomFieldDefinition[] };

// Define type-safe function to handle Supabase responses
export function mapToCustomFieldDefinition(data: any): CustomFieldDefinition {
  return {
    id: data.id,
    organization_id: data.organization_id,
    name: data.name,
    field_type: data.field_type,
    entity_type: data.entity_type,
    default_value: data.default_value,
    is_required: data.is_required || false,
    options: data.options,
    created_at: data.created_at,
    updated_at: data.updated_at,
    field_set: data.field_set,
    position: data.position || data.pos_order || 0 // Support both field names
  };
}

export function mapToCustomFieldValue(data: any): CustomFieldValue {
  return {
    id: data.id,
    definition_id: data.definition_id,
    entity_id: data.entity_id,
    value: data.value,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    definition: data.definition ? mapToCustomFieldDefinition(data.definition) : undefined,
    field_type: data.definition?.field_type
  };
}

export function mapToCustomFieldSet(data: any): CustomFieldSet {
  return {
    id: data.id,
    organization_id: data.organization_id,
    name: data.name,
    entity_type: data.entity_type,
    position: data.position || data.pos_order || 0, // Support both field names
    created_at: data.created_at,
    updated_at: data.updated_at,
    fields: data.fields ? 
      (Array.isArray(data.fields) ? data.fields.map(mapToCustomFieldDefinition) : []) 
      : []
  };
}

export function mapToContactFieldSetAssignment(data: any): ContactFieldSetAssignment {
  return {
    id: data.id,
    contact_id: data.contact_id,
    field_set_id: data.field_set_id,
    created_at: data.created_at
  };
}

export function mapToContactFieldAssignment(data: any): ContactFieldAssignment {
  return {
    id: data.id,
    contact_id: data.contact_id,
    field_id: data.field_id,
    created_at: data.created_at
  };
}
