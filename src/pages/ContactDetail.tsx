import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Contact, ContactType } from '@/types/contact';
import { processContactFromDatabase } from '@/utils/contactUtils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileEdit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

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
          .maybeSingle();
          
        if (contactError) throw contactError;

        if (!contactData) {
          // Contact not found, redirect to contacts list
          toast({
            title: "Contact not found",
            description: "This contact may have been deleted.",
            variant: "destructive"
          });
          navigate('/contacts');
          return;
        }

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
  }, [id, user, navigate]);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    setDeleteErrorMessage(null);
  };

  const handleDeleteConfirm = async () => {
    if (!contact || isDeleting) return;
    
    try {
      setIsDeleting(true);
      setDeleteErrorMessage(null);
      
      const isCompany = contact.contact_type_id === contactTypes.find(t => t.name === 'Company')?.id;
      
      // If it's a company, check for employees
      if (isCompany) {
        const { data: employeeData, error: employeeCheckError, count } = await supabase
          .from('company_employees')
          .select('id', { count: 'exact' })
          .eq('company_id', contact.id);
        
        if (employeeCheckError) throw employeeCheckError;
        
        if (count && count > 0) {
          setDeleteErrorMessage(
            `Cannot delete this company because it has ${count} employee${count > 1 ? 's' : ''} linked to it. ` +
            'Please remove all employee links first.'
          );
          setIsDeleting(false);
          return;
        }
      }
      
      // Delete any tag assignments for this contact
      await supabase
        .from('contact_tag_assignments')
        .delete()
        .eq('contact_id', contact.id);
      
      // Now delete the contact
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id);
      
      if (error) throw error;
      
      setDeleteConfirmOpen(false);
      
      toast({
        title: "Contact deleted",
        description: "The contact has been removed successfully."
      });
      
      // Redirect to contacts page
      navigate('/contacts');
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      setDeleteErrorMessage(error.message || 'Failed to delete contact. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getContactTypeName = (contactTypeId: string) => {
    return contactTypes.find(t => t.id === contactTypeId)?.name || 'Unknown';
  };

  const getContactName = () => {
    if (!contact) return '';
    
    if (contact.contact_type_id === contactTypes.find(t => t.name === 'Person')?.id) {
      return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact';
    }
    
    return contact.company_name || 'Unnamed Company';
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
        <p className="text-gray-500 mb-4">The requested contact could not be found.</p>
        <Button onClick={() => navigate('/contacts')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contacts
        </Button>
      </div>
    );
  }

  // Render the contact detail display
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/contacts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{getContactName()}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/contacts/${contact.id}/edit`)}>
            <FileEdit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Rest of contact detail display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p>{getContactTypeName(contact.contact_type_id)}</p>
          </div>
          {contact.contact_type_id === contactTypes.find(t => t.name === 'Person')?.id ? (
            <>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p>{contact.first_name} {contact.last_name}</p>
              </div>
              {contact.job_title && (
                <div>
                  <p className="text-sm text-gray-500">Job Title</p>
                  <p>{contact.job_title}</p>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p>{contact.company_name}</p>
            </div>
          )}
        </div>

        <div className="space-y-4 border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Contact Details</h2>
          {contact.email && (
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a href={`mailto:${contact.email}`} className="text-yorpro-600 hover:underline">
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <a href={`tel:${contact.phone}`} className="text-yorpro-600 hover:underline">
                {contact.phone}
              </a>
            </div>
          )}
          {(contact.city || contact.state || contact.address) && (
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p>
                {contact.address && `${contact.address}, `}
                {contact.city && `${contact.city}, `}
                {contact.state && `${contact.state} `}
                {contact.zip && `${contact.zip}, `}
                {contact.country && `${contact.country}`}
              </p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact
              {contact ? ` "${getContactName()}"` : ''} and all associated data.
            </AlertDialogDescription>
            {deleteErrorMessage && (
              <div className="mt-2 p-3 border border-red-200 bg-red-50 text-red-600 rounded-md">
                {deleteErrorMessage}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                handleDeleteConfirm();
              }} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
