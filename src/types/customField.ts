
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
}

export interface CustomFieldSet {
  id: string;
  organization_id: string;
  name: string;
  entity_type: 'contact' | 'matter' | 'task';
  position: number;
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
}

export interface CustomFieldFormValue {
  definition_id: string;
  value: string | null;
}
