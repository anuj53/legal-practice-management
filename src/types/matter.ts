
export interface MatterTemplate {
  id: string;
  name: string;
  description: string | null;
  responsible_attorney_id: string | null;
  originating_attorney_id: string | null;
  practice_area: string | null;
  location: string | null;
  permissions: string | null;
  status: string | null;
  is_default: boolean | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateBillingPreference {
  id: string;
  template_id: string;
  billing_method: string | null;
  custom_rate: number | null;
  split_billing: boolean | null;
  budget: number | null;
  trust_notification: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateDocumentFolder {
  id: string;
  template_id: string;
  name: string;
  category: string | null;
  position: number | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateTaskList {
  id: string;
  template_id: string;
  workflow_template_id: string;
  created_at: string;
  updated_at: string;
  workflow_template?: {
    name: string;
    description: string | null;
  };
}

export interface Matter {
  id: string;
  name: string;
  description: string | null;
  practice_area: string | null;
  responsible_attorney_id: string | null;
  status: string;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}
