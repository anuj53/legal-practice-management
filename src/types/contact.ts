
export interface ContactType {
  id: string;
  name: string;
}

export interface ContactTag {
  id: string;
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  contact_type_id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  notes: string | null;
  is_client: boolean | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  organization_id: string | null;
  tags?: ContactTag[];
  employees?: Contact[];
  
  // Billing information fields (could be expanded in the future)
  client_id?: string | null;
  payment_terms?: string | null;
  billing_rate?: number | null;
}

export interface CompanyEmployee {
  id: string;
  company_id: string;
  person_id: string;
  job_title: string | null;
  created_at?: string;
  updated_at?: string;
  person?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export interface ContactFormValues {
  contact_type_id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  is_client?: boolean;
  tags?: string[];
}

// New interface for matter/case related to a contact
export interface Matter {
  id: string;
  title: string;
  status: string;
  client_id: string;
  created_at: string;
  practice_area?: string;
}
