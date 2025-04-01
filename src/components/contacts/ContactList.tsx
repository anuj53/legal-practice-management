
import React from 'react';
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
  User
} from 'lucide-react';
import { Contact, ContactType } from '@/types/contact';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ContactListProps {
  contacts: Contact[];
  contactTypes: ContactType[];
}

export function ContactList({ contacts, contactTypes }: ContactListProps) {
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

  return (
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
            <TableRow key={contact.id}>
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
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${contact.email}`} className="text-yorpro-600 hover:underline">
                      {contact.email}
                    </a>
                  </div>
                ) : (
                  <span className="text-gray-400">Not provided</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {contact.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${contact.phone}`} className="text-yorpro-600 hover:underline">
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
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center">
                      <FileEdit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    {contact.contact_type_id === contactTypes.find(t => t.name === 'Company')?.id && (
                      <DropdownMenuItem className="flex items-center">
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Add Employee</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="flex items-center text-red-600">
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
  );
}
