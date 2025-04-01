
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Contact, ContactType } from '@/types/contact';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { ContactList } from '@/components/contacts/ContactList';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { ContactsFilters } from '@/components/contacts/ContactsFilters';
import { Loader2, Users, Building2, Plus, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Contacts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isClientOnly, setIsClientOnly] = useState(false);

  // Fetch contact types on mount
  useEffect(() => {
    const fetchContactTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('contact_types')
          .select('*');
          
        if (error) throw error;
        setContactTypes(data);
      } catch (error) {
        console.error('Error fetching contact types:', error);
        toast({
          title: "Error",
          description: "Failed to load contact types.",
          variant: "destructive"
        });
      }
    };
    
    fetchContactTypes();
  }, []);

  // Fetch contacts when user changes
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!profileData?.organization_id) {
          setLoading(false);
          return;
        }
        
        let query = supabase
          .from('contacts')
          .select(`
            *,
            contact_tag_assignments(
              contact_tags(*)
            )
          `)
          .eq('organization_id', profileData.organization_id);
          
        if (isClientOnly) {
          query = query.eq('is_client', true);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform data to include tags as a property and ensure all required fields are present
        const processedContacts: Contact[] = data.map(contact => {
          const tags = contact.contact_tag_assignments?.map(assignment => assignment.contact_tags) || [];
          
          // Create a properly typed Contact object with default values for missing fields
          const typedContact: Contact = {
            id: contact.id,
            contact_type_id: contact.contact_type_id,
            prefix: contact.prefix || null,
            first_name: contact.first_name || null,
            middle_name: contact.middle_name || null,
            last_name: contact.last_name || null,
            company_name: contact.company_name || null,
            job_title: contact.job_title || null,
            date_of_birth: contact.date_of_birth || null,
            profile_image_url: contact.profile_image_url || null,
            email: contact.email || null,
            phone: contact.phone || null,
            address: contact.address || null,
            city: contact.city || null,
            state: contact.state || null,
            zip: contact.zip || null,
            country: contact.country || null,
            notes: contact.notes || null,
            is_client: Boolean(contact.is_client),
            created_at: contact.created_at,
            updated_at: contact.updated_at,
            created_by: contact.created_by,
            organization_id: contact.organization_id || null,
            tags: tags,
            emails: contact.emails || [],
            phones: contact.phones || [],
            websites: contact.websites || [],
            addresses: contact.addresses || [],
          };
          
          return typedContact;
        });
        
        setContacts(processedContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load contacts.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, [user, isClientOnly]);

  // Filter contacts based on active tab and search term
  const filteredContacts = contacts.filter(contact => {
    const matchesType = activeTab === 'all' || 
      (activeTab === 'people' && contact.contact_type_id === contactTypes.find(t => t.name === 'Person')?.id) ||
      (activeTab === 'companies' && contact.contact_type_id === contactTypes.find(t => t.name === 'Company')?.id);
      
    const matchesSearch = searchTerm.trim() === '' || 
      (contact.first_name && contact.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.last_name && contact.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.company_name && contact.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesType && matchesSearch;
  });

  const handleCreateContact = async (newContact: Contact) => {
    setContacts(prev => [...prev, newContact]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Contact Created",
      description: "New contact has been added successfully."
    });
  };

  const handleExportContacts = () => {
    // Export functionality will be implemented here
    toast({
      title: "Export Initiated",
      description: "Contact export feature will be implemented soon."
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage your clients, companies, and other contacts."
        actions={
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleExportContacts}
              className="hidden md:flex"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="gradient" 
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        }
      />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Contacts
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              People
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
          </TabsList>
          
          <ContactsFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isClientOnly={isClientOnly}
            setIsClientOnly={setIsClientOnly}
          />
        </div>
        
        <TabsContent value="all" className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yorpro-600" />
            </div>
          ) : (
            <ContactList 
              contacts={filteredContacts} 
              contactTypes={contactTypes}
            />
          )}
        </TabsContent>
        
        <TabsContent value="people" className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yorpro-600" />
            </div>
          ) : (
            <ContactList 
              contacts={filteredContacts} 
              contactTypes={contactTypes}
            />
          )}
        </TabsContent>
        
        <TabsContent value="companies" className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yorpro-600" />
            </div>
          ) : (
            <ContactList 
              contacts={filteredContacts} 
              contactTypes={contactTypes}
            />
          )}
        </TabsContent>
      </Tabs>
      
      {isCreateDialogOpen && (
        <ContactDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          contactTypes={contactTypes}
          onSuccess={handleCreateContact}
        />
      )}
    </div>
  );
}
