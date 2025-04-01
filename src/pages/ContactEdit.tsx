
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Contact, ContactType } from '@/types/contact';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { processContactFromDatabase } from '@/utils/contactUtils';

export default function ContactEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  // Fetch contact types once on component mount
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

  // Fetch contact data
  useEffect(() => {
    const fetchContact = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        
        // Fetch the contact with tags
        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select(`
            *,
            contact_tag_assignments(
              contact_tags(*)
            )
          `)
          .eq('id', id)
          .single();
          
        if (contactError) throw contactError;

        // Process contact data for type safety
        const processedContact = processContactFromDatabase(contactData);
        
        setContact(processedContact);
      } catch (error) {
        console.error('Error fetching contact:', error);
        toast({
          title: "Error",
          description: "Failed to load contact details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchContact();
    }
  }, [id, user]);

  const handleSuccess = (updatedContact: Contact) => {
    toast({
      title: "Contact Updated",
      description: "Contact has been updated successfully."
    });
    navigate(`/contacts/${updatedContact.id}`);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      navigate(`/contacts/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-yorpro-600" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-2">Contact not found</h2>
        <p className="text-gray-500">The requested contact could not be found.</p>
      </div>
    );
  }

  return (
    <>
      {contactTypes.length > 0 && contact && (
        <ContactDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          contact={contact}
          contactTypes={contactTypes}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
