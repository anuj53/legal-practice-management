
export interface ContactType {
  id: string;
  name: string;
}

export interface ContactTag {
  id: string;
  name: string;
  color: string;
}

export interface EmailAddress {
  email: string;
  type: string;
  is_primary: boolean;
}

export interface PhoneNumber {
  phone: string;
  type: string;
  is_primary: boolean;
}

export interface Website {
  url: string;
  type: string;
  is_primary: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: string;
  is_primary: boolean;
}

export interface Contact {
  id: string;
  contact_type_id: string;
  prefix: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  company_name: string | null;
  job_title: string | null;
  date_of_birth: string | null;
  profile_image_url: string | null;
  
  // These fields will be used for backward compatibility
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  
  // New detailed fields (will be stored as JSON in the contact record)
  emails?: EmailAddress[];
  phones?: PhoneNumber[];
  websites?: Website[];
  addresses?: Address[];
  
  notes: string | null;
  is_client: boolean | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  organization_id: string | null;
  tags?: ContactTag[];
  employees?: Contact[];
  
  // Billing information fields
  client_id?: string | null;
  payment_terms?: string | null;
  payment_profile?: string | null;
  billing_rate?: number | null;
  ledes_client_id?: string | null;
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
  prefix?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  company_name?: string;
  job_title?: string;
  date_of_birth?: string;
  profile_image_url?: string;
  
  // For backward compatibility
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  
  // New detailed contact information
  emails?: EmailAddress[];
  phones?: PhoneNumber[];
  websites?: Website[];
  addresses?: Address[];
  
  notes?: string;
  is_client?: boolean;
  tags?: string[];
  payment_profile?: string;
  billing_rate?: number;
  ledes_client_id?: string;
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
