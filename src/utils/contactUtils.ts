
import { Contact, EmailAddress, PhoneNumber, Website, Address } from '@/types/contact';
import { Json } from '@/integrations/supabase/types';

/**
 * Prepares contact data for Supabase by converting typed arrays to JSON
 */
export function prepareContactForDatabase(contactData: Partial<Contact>): Record<string, any> {
  // Make sure required fields are present before preparing data
  if (!contactData.contact_type_id) {
    throw new Error('contact_type_id is required');
  }
  
  if (!contactData.created_by) {
    throw new Error('created_by is required');
  }
  
  // Create a new object with all original properties
  const result = {
    ...contactData,
    // Convert typed arrays to JSON stringifiable format
    emails: contactData.emails ? JSON.parse(JSON.stringify(contactData.emails)) : null,
    phones: contactData.phones ? JSON.parse(JSON.stringify(contactData.phones)) : null,
    websites: contactData.websites ? JSON.parse(JSON.stringify(contactData.websites)) : null,
    addresses: contactData.addresses ? JSON.parse(JSON.stringify(contactData.addresses)) : null,
  };

  return result;
}

/**
 * Processes contact data from Supabase to ensure proper typing
 */
export function processContactFromDatabase(contactData: any): Contact {
  return {
    id: contactData.id,
    contact_type_id: contactData.contact_type_id,
    prefix: contactData.prefix || null,
    first_name: contactData.first_name || null,
    middle_name: contactData.middle_name || null,
    last_name: contactData.last_name || null,
    company_name: contactData.company_name || null,
    job_title: contactData.job_title || null,
    date_of_birth: contactData.date_of_birth || null,
    profile_image_url: contactData.profile_image_url || null,
    email: contactData.email || null,
    phone: contactData.phone || null,
    address: contactData.address || null,
    city: contactData.city || null,
    state: contactData.state || null,
    zip: contactData.zip || null,
    country: contactData.country || null,
    notes: contactData.notes || null,
    is_client: Boolean(contactData.is_client),
    created_at: contactData.created_at,
    updated_at: contactData.updated_at,
    created_by: contactData.created_by,
    organization_id: contactData.organization_id || null,
    tags: contactData.contact_tag_assignments?.map(
      (assignment: any) => assignment.contact_tags
    ) || [],
    // Parse JSON data into typed arrays
    emails: Array.isArray(contactData.emails) ? contactData.emails : [],
    phones: Array.isArray(contactData.phones) ? contactData.phones : [],
    websites: Array.isArray(contactData.websites) ? contactData.websites : [],
    addresses: Array.isArray(contactData.addresses) ? contactData.addresses : [],
  };
}
