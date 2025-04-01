import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Phone, 
  Mail, 
  MoreHorizontal, 
  FileEdit, 
  Trash2, 
  UserPlus, 
  Building,
  User,
  Loader2
} from 'lucide-react';
import { Contact, ContactType } from '@/types/contact';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ContactListProps {
  contacts: Contact[];
  contactTypes: ContactType[];
  onContactDeleted?: () => void;
}

export function ContactList({ contacts, contactTypes, onContactDeleted }: ContactListProps) {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [contactToDelete, setContactToDelete] = React.useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = React.useState<string | null>(null);
  
  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg bg-gray-50">
        <p className="text-gray-500">No contacts found</p>
        <p className="text-sm text-gray-400">Try adjusting your filters or add a new contact</p>
      </div>
    );
  }

  const getContactTypeIcon = (contactTypeId: string) => {
    const type = contactTypes.find(t => t.id === contactTypeId)?.name;
    return type === 'Company' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getContactTypeColor = (contactTypeId: string) => {
    const type = contactTypes.find(t => t.id === contactTypeId)?.name;
    return type === 'Company' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800";
  };

  const getContactTypeName = (contactTypeId: string) => {
    return contactTypes.find(t => t.id === contactTypeId)?.name || 'Unknown';
  };

  const getInitials = (contact: Contact) => {
    if (contact.contact_type_id === contactTypes.find(t => t.name === 'Person')?.id) {
      const firstInitial = contact.first_name?.[0] || '';
      const lastInitial = contact.last_name?.[0] || '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    
    return contact.company_name?.[0]?.toUpperCase() || 'C';
  };

  const getContactName = (contact: Contact) => {
    if (contact.contact_type_id === contactTypes.find(t => t.name === 'Person')?.id) {
      return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact';
    }
    
    return contact.company_name || 'Unnamed Company';
  };

  const getContactAvatar = (contact: Contact) => {
    const isCompany = contact.contact_type_id === contactTypes.find(t => t.name === 'Company')?.id;
    const bgColor = isCompany ? "bg-blue-600" : "bg-purple-600";
    
    return (
      <Avatar className="h-10 w-10">
        <AvatarFallback className={`${bgColor} text-white`}>
          {getInitials(contact)}
        </AvatarFallback>
      </Avatar>
    );
  };

  const handleRowClick = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, contact: Contact) => {
    e.stopPropagation(); // Prevent row click event
    setContactToDelete(contact);
    setDeleteErrorMessage(null);
    setDeleteConfirmOpen(true);
  };

  const checkAndDeleteEmployeeLinks = async (contactId: string) => {
    return true; // Always return true since the database will handle cascade deletion
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      setDeleteErrorMessage(null);
      
      const isCompany = contactToDelete.contact_type_id === contactTypes.find(t => t.name === 'Company')?.id;
      
      // If it's a company, check for employees
      if (isCompany) {
        const { data: employeeData, error: employeeCheckError, count } = await supabase
          .from('company_employees')
          .select('id', { count: 'exact' })
          .eq('company_id', contactToDelete.id);
        
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
        .eq('contact_id', contactToDelete.id);
      
      // Now delete the contact
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Contact deleted",
        description: "The contact has been removed successfully."
      });
      
      // Close dialog first before refreshing
      setDeleteConfirmOpen(false);
      setContactToDelete(null);
      
      // Then refresh contact list
      if (onContactDeleted) {
        onContactDeleted();
      }
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      setDeleteErrorMessage(error.message || 'Failed to delete contact. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow 
                key={contact.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(contact)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {getContactAvatar(contact)}
                    <div>
                      <div className="font-medium">{getContactName(contact)}</div>
                      {contact.is_client && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                          Client
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {contact.email ? (
                    <div 
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`mailto:${contact.email}`} 
                        className="text-yorpro-600 hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {contact.phone ? (
                    <div 
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="text-yorpro-600 hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {contact.city ? (
                    <span>
                      {contact.city}{contact.state ? `, ${contact.state}` : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className={`flex items-center gap-1 ${getContactTypeColor(contact.contact_type_id)}`}>
                    {getContactTypeIcon(contact.contact_type_id)}
                    <span>{getContactTypeName(contact.contact_type_id)}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex items-center" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/contacts/${contact.id}/edit`);
                      }}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      {contact.contact_type_id === contactTypes.find(t => t.name === 'Company')?.id && (
                        <DropdownMenuItem className="flex items-center" onClick={(e) => e.stopPropagation()}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          <span>Add Employee</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="flex items-center text-red-600" 
                        onClick={(e) => handleDeleteClick(e, contact)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact 
              {contactToDelete ? ` "${getContactName(contactToDelete)}"` : ''} and all associated data.
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
    </>
  );
}
