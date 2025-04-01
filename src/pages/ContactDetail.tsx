import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Contact, ContactType, Matter, CompanyEmployee } from '@/types/contact';
import { CustomFieldValue } from '@/types/customField';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building, 
  User,
  FileText,
  Edit,
  UserPlus,
  Users,
  Trash2,
  Calendar,
  PencilIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/contacts/EmptyState';
import { Loader2 } from 'lucide-react';
import { processContactFromDatabase } from '@/utils/contactUtils';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomFieldValue[]>([]);

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
  }, []); // Only run once on mount

  useEffect(() => {
    const fetchContact = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        
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

        console.log('Contact data from database:', contactData);
        const processedContact = processContactFromDatabase(contactData);
        console.log('Processed contact data:', processedContact);
        
        setContact(processedContact);

        if (contactTypes.length > 0 && processedContact.contact_type_id === contactTypes.find(t => t.name === 'Company')?.id) {
          const { data: employeeData, error: employeeError } = await supabase
            .from('company_employees')
            .select(`
              *,
              person:person_id(
                id,
                first_name,
                last_name,
                email,
                phone
              )
            `)
            .eq('company_id', id);
          
          if (employeeError) throw employeeError;
          
          const typedEmployees = employeeData as unknown as CompanyEmployee[];
          setEmployees(typedEmployees);
        }

        setMatters([]);
        
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
    
    if (contactTypes.length > 0) {
      fetchContact();
    }
  }, [id, user, contactTypes]); // Only run when id, user, or contactTypes change

  useEffect(() => {
    const fetchCustomFields = async () => {
      if (!id || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('custom_field_values')
          .select(`
            id,
            definition_id,
            entity_id,
            value,
            definition:custom_field_definitions(*)
          `)
          .eq('entity_id', id);
          
        if (error) throw error;
        
        setCustomFields(data || []);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
      }
    };
    
    if (contact) {
      fetchCustomFields();
    }
  }, [id, user, contact]);

  const getContactTypeName = (typeId: string | undefined) => {
    if (!typeId) return 'Unknown';
    return contactTypes.find(t => t.id === typeId)?.name || 'Unknown';
  };

  const getContactName = () => {
    if (!contact) return '';
    
    const isCompany = getContactTypeName(contact.contact_type_id) === 'Company';
    return isCompany 
      ? contact.company_name || 'Unnamed Company'
      : `${contact.prefix ? contact.prefix + ' ' : ''}${contact.first_name || ''} ${contact.middle_name ? contact.middle_name + ' ' : ''}${contact.last_name || ''}`.trim() || 'Unnamed Contact';
  };

  const getInitials = () => {
    if (!contact) return '';
    
    const isCompany = getContactTypeName(contact.contact_type_id) === 'Company';
    if (isCompany) {
      return contact.company_name?.[0]?.toUpperCase() || 'C';
    } else {
      const firstInitial = contact.first_name?.[0] || '';
      const lastInitial = contact.last_name?.[0] || '';
      return (firstInitial + lastInitial).toUpperCase();
    }
  };

  const getAvatarColor = () => {
    const isCompany = contact && getContactTypeName(contact.contact_type_id) === 'Company';
    return isCompany ? "bg-blue-600" : "bg-purple-600";
  };

  const formatAddress = () => {
    if (!contact) return '';
    
    const parts = [];
    if (contact.address) parts.push(contact.address);
    
    const cityStateZip = [];
    if (contact.city) cityStateZip.push(contact.city);
    if (contact.state) cityStateZip.push(contact.state);
    if (contact.zip) cityStateZip.push(contact.zip);
    
    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(', '));
    }
    
    if (contact.country) parts.push(contact.country);
    
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  const handleDelete = async () => {
    if (!contact || isDeleting) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      // Check if company has employees
      if (getContactTypeName(contact.contact_type_id) === 'Company') {
        const { data: employeeData, error: employeeCheckError, count } = await supabase
          .from('company_employees')
          .select('id', { count: 'exact' })
          .eq('company_id', contact.id);
        
        if (employeeCheckError) throw employeeCheckError;
        
        if (count && count > 0) {
          setDeleteError(
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
      
      toast({
        title: "Contact deleted",
        description: "The contact has been removed successfully."
      });
      
      // Navigate back to contacts list
      navigate('/contacts');
      
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      setDeleteError(error.message || 'Failed to delete contact. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCustomFields = () => {
    if (customFields.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Custom Fields let you configure the system to meet your firm's unique needs. Create Custom Fields to store useful details and quickly find information when you need it.
          </p>
          <Button variant="outline" onClick={() => navigate(`/contacts/${id}/edit`)}>
            Add Custom Field
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customFields.map((field) => (
          <div key={field.id} className="p-2 border-b">
            <div className="text-sm font-medium text-gray-500">
              {field.definition?.name}
            </div>
            <div className="mt-1">
              {field.field_type === 'checkbox' ? (
                field.value === 'true' ? 'Yes' : 'No'
              ) : (
                field.value || <span className="text-gray-400">Not specified</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
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
        <p className="text-gray-500 mb-6">The requested contact could not be found.</p>
        <Button onClick={() => navigate('/contacts')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>
      </div>
    );
  }

  const isCompany = getContactTypeName(contact.contact_type_id) === 'Company';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Avatar className="h-10 w-10">
          <AvatarFallback className={`${getAvatarColor()} text-white`}>
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{getContactName()}</h1>
          <div className="flex items-center gap-2">
            {isCompany ? (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Building className="h-3 w-3 mr-1" /> Company
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                <User className="h-3 w-3 mr-1" /> Person
              </Badge>
            )}
            {contact.is_client && (
              <Badge variant="outline" className="bg-green-100 text-green-700">
                Client
              </Badge>
            )}
            {contact.tags?.map(tag => (
              <Badge 
                key={tag.id} 
                variant="outline" 
                style={{ 
                  backgroundColor: `${tag.color}20`, 
                  color: tag.color,
                  borderColor: `${tag.color}40`  
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline">
          Quick bill
        </Button>
        <Button variant="outline">
          New trust request
        </Button>
        <Button variant="outline" onClick={() => navigate(`/contacts/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit contact
        </Button>
        <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <User className="h-5 w-5 mr-2" />
                    Contact information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!isCompany && contact.job_title && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Job Title</div>
                        <span>{contact.job_title}</span>
                      </div>
                    )}
                    
                    {!isCompany && contact.date_of_birth && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{contact.date_of_birth}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>
                      {contact.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${contact.phone}`} className="text-yorpro-600 hover:underline">
                            {contact.phone}
                          </a>
                          <span className="text-sm text-gray-500">(Primary)</span>
                        </div>
                      ) : contact.phones && contact.phones.length > 0 ? (
                        <div className="space-y-2">
                          {contact.phones.map((phone, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <a href={`tel:${phone.phone}`} className="text-yorpro-600 hover:underline">
                                {phone.phone}
                              </a>
                              {phone.type && <span className="text-sm text-gray-500">({phone.type})</span>}
                              {phone.is_primary && <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-xs">Primary</Badge>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                      {contact.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${contact.email}`} className="text-yorpro-600 hover:underline">
                            {contact.email}
                          </a>
                          <span className="text-sm text-gray-500">(Primary)</span>
                        </div>
                      ) : contact.emails && contact.emails.length > 0 ? (
                        <div className="space-y-2">
                          {contact.emails.map((email, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <a href={`mailto:${email.email}`} className="text-yorpro-600 hover:underline">
                                {email.email}
                              </a>
                              {email.type && <span className="text-sm text-gray-500">({email.type})</span>}
                              {email.is_primary && <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-xs">Primary</Badge>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Website</div>
                      {contact.websites && contact.websites.length > 0 ? (
                        <div className="space-y-2">
                          {contact.websites.map((website, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a href={website.url.startsWith('http') ? website.url : `https://${website.url}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="text-yorpro-600 hover:underline">
                                {website.url}
                              </a>
                              {website.type && <span className="text-sm text-gray-500">({website.type})</span>}
                              {website.is_primary && <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-xs">Primary</Badge>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
                      {contact.addresses && contact.addresses.length > 0 ? (
                        <div className="space-y-3">
                          {contact.addresses.map((address, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                              <div>
                                <div>{address.street}</div>
                                <div>
                                  {address.city}{address.city && address.state ? ', ' : ''}
                                  {address.state} {address.zip}
                                </div>
                                {address.country && <div>{address.country}</div>}
                                {address.type && <div className="text-sm text-gray-500 mt-1">{address.type} Address</div>}
                                {address.is_primary && <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 text-xs">Primary</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : formatAddress() !== '—' ? (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <span>{formatAddress()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <FileText className="h-5 w-5 mr-2" />
                    Billing information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">LEDES client ID</div>
                      {contact.ledes_client_id ? (
                        <span>{contact.ledes_client_id}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Payment profile</div>
                      <span>{contact.payment_profile || 'Default (30 days)'}</span>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Billing rate</div>
                      {contact.billing_rate ? (
                        <span>${contact.billing_rate}/hour</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {contact.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg font-medium">
                      <FileText className="h-5 w-5 mr-2" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{contact.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6 col-span-1 lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg font-medium">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Custom Fields
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderCustomFields()}
                </CardContent>
              </Card>

              {isCompany && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg font-medium">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Employees
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {employees.length > 0 ? (
                      <div className="space-y-4">
                        {employees.map((employee) => (
                          <div key={employee.id} className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-purple-600 text-white">
                                  {employee.person?.first_name?.[0] || ''}
                                  {employee.person?.last_name?.[0] || ''}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link 
                                  to={`/contacts/${employee.person_id}`}
                                  className="font-medium hover:text-yorpro-600 hover:underline"
                                >
                                  {employee.person?.first_name} {employee.person?.last_name}
                                </Link>
                                {employee.job_title && (
                                  <div className="text-sm text-gray-500">{employee.job_title}</div>
                                )}
                              </div>
                            </div>
                            {employee.person?.email && (
                              <a 
                                href={`mailto:${employee.person.email}`}
                                className="text-yorpro-600 hover:underline text-sm"
                              >
                                {employee.person.email}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">
                          This company has no employees yet.
                        </p>
                        <Button>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add employee
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg font-medium">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Client's matters
                    </div>
                    <Button size="sm">
                      New matter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {matters.length > 0 ? (
                    <div className="space-y-4">
                      {matters.map((matter) => (
                        <div key={matter.id} className="flex items-center justify-between border-b pb-3">
                          <div>
                            <Link 
                              to={`/matters/${matter.id}`}
                              className="font-medium hover:text-yorpro-600 hover:underline"
                            >
                              {matter.title}
                            </Link>
                            {matter.practice_area && (
                              <div className="text-sm text-gray-500">{matter.practice_area}</div>
                            )}
                          </div>
                          <Badge variant="outline">
                            {matter.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">
                        This contact has no matters yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg font-medium">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Associated matters
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        All
                      </Button>
                      <Button variant="ghost" size="sm">
                        Open
                      </Button>
                      <Button variant="outline" size="sm">
                        Link matter
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-center py-6">
                    <p className="text-gray-600">
                      This contact isn't associated with any matters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="communications">
          <EmptyState
            title="Communications"
            description="Track calls, emails and other communications with this contact."
            icon={<Mail className="h-10 w-10 text-gray-400" />}
          />
        </TabsContent>
        
        <TabsContent value="notes">
          {contact.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              title="Notes"
              description="Add notes related to this contact."
              icon={<FileText className="h-10 w-10 text-gray-400" />}
            />
          )}
        </TabsContent>
        
        <TabsContent value="documents">
          <EmptyState
            title="Documents"
            description="Store and organize documents related to this contact."
            icon={<FileText className="h-10 w-10 text-gray-400" />}
          />
        </TabsContent>
        
        <TabsContent value="bills">
          <EmptyState
            title="Bills"
            description="View and manage bills for this contact."
            icon={<FileText className="h-10 w-10 text-gray-400" />}
          />
        </TabsContent>
        
        <TabsContent value="transactions">
          <EmptyState
            title="Transactions"
            description="Track financial transactions with this contact."
            icon={<FileText className="h-10 w-10 text-gray-400" />}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact 
              {contact ? ` "${getContactName()}"` : ''} and all associated data.
            </AlertDialogDescription>
            {deleteError && (
              <div className="mt-2 p-3 border border-red-200 bg-red-50 text-red-600 rounded-md">
                {deleteError}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                handleDelete();
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
