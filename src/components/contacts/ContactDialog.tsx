
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Building2, User, Loader2, Phone, Mail, Globe, MapPin, Plus, Trash2, 
  Calendar, Upload, Tag, FileText, Users 
} from 'lucide-react';
import { 
  Contact, ContactType, ContactFormValues, EmailAddress, PhoneNumber, Website, Address 
} from '@/types/contact';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { prepareContactForDatabase, processContactFromDatabase } from '@/utils/contactUtils';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact;
  contactTypes: ContactType[];
  onSuccess: (contact: Contact) => void;
}

export function ContactDialog({
  open,
  onOpenChange,
  contact,
  contactTypes,
  onSuccess
}: ContactDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contact-info');
  
  const [formValues, setFormValues] = useState<ContactFormValues>(
    contact ? {
      contact_type_id: contact.contact_type_id,
      prefix: contact.prefix || '',
      first_name: contact.first_name || '',
      middle_name: contact.middle_name || '',
      last_name: contact.last_name || '',
      company_name: contact.company_name || '',
      job_title: contact.job_title || '',
      date_of_birth: contact.date_of_birth || '',
      profile_image_url: contact.profile_image_url || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      zip: contact.zip || '',
      country: contact.country || '',
      notes: contact.notes || '',
      is_client: Boolean(contact.is_client),
      emails: contact.emails || [{ email: contact.email || '', type: 'Work', is_primary: true }],
      phones: contact.phones || [{ phone: contact.phone || '', type: 'Work', is_primary: true }],
      websites: contact.websites || [{ url: '', type: 'Work', is_primary: true }],
      addresses: contact.addresses || [{
        street: contact.address || '',
        city: contact.city || '',
        state: contact.state || '',
        zip: contact.zip || '',
        country: contact.country || '',
        type: 'Work',
        is_primary: true
      }],
      payment_profile: contact.payment_profile || 'Default',
      billing_rate: contact.billing_rate || undefined,
      ledes_client_id: contact.ledes_client_id || '',
    } : {
      contact_type_id: contactTypes.find(t => t.name === 'Person')?.id || '',
      is_client: false,
      emails: [{ email: '', type: 'Work', is_primary: true }],
      phones: [{ phone: '', type: 'Work', is_primary: true }],
      websites: [{ url: '', type: 'Work', is_primary: true }],
      addresses: [{ 
        street: '', 
        city: '', 
        state: '', 
        zip: '', 
        country: '', 
        type: 'Work', 
        is_primary: true 
      }],
      payment_profile: 'Default',
    }
  );

  const getContactTypeName = (id: string) => {
    return contactTypes.find(t => t.id === id)?.name || '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormValues(prev => ({ ...prev, [name]: checked }));
  };

  const handleContactTypeChange = (value: string) => {
    setFormValues(prev => ({ ...prev, contact_type_id: value }));
  };
  
  const handleEmailChange = (index: number, field: keyof EmailAddress, value: string | boolean) => {
    setFormValues(prev => {
      const newEmails = [...(prev.emails || [])];
      newEmails[index] = { ...newEmails[index], [field]: value };
      return { ...prev, emails: newEmails };
    });
  };
  
  const addEmail = () => {
    setFormValues(prev => ({
      ...prev,
      emails: [...(prev.emails || []), { email: '', type: 'Work', is_primary: false }]
    }));
  };
  
  const removeEmail = (index: number) => {
    setFormValues(prev => {
      const newEmails = [...(prev.emails || [])];
      newEmails.splice(index, 1);
      return { ...prev, emails: newEmails };
    });
  };
  
  const handlePhoneChange = (index: number, field: keyof PhoneNumber, value: string | boolean) => {
    setFormValues(prev => {
      const newPhones = [...(prev.phones || [])];
      newPhones[index] = { ...newPhones[index], [field]: value };
      return { ...prev, phones: newPhones };
    });
  };
  
  const addPhone = () => {
    setFormValues(prev => ({
      ...prev,
      phones: [...(prev.phones || []), { phone: '', type: 'Work', is_primary: false }]
    }));
  };
  
  const removePhone = (index: number) => {
    setFormValues(prev => {
      const newPhones = [...(prev.phones || [])];
      newPhones.splice(index, 1);
      return { ...prev, phones: newPhones };
    });
  };
  
  const handleWebsiteChange = (index: number, field: keyof Website, value: string | boolean) => {
    setFormValues(prev => {
      const newWebsites = [...(prev.websites || [])];
      newWebsites[index] = { ...newWebsites[index], [field]: value };
      return { ...prev, websites: newWebsites };
    });
  };
  
  const addWebsite = () => {
    setFormValues(prev => ({
      ...prev,
      websites: [...(prev.websites || []), { url: '', type: 'Work', is_primary: false }]
    }));
  };
  
  const removeWebsite = (index: number) => {
    setFormValues(prev => {
      const newWebsites = [...(prev.websites || [])];
      newWebsites.splice(index, 1);
      return { ...prev, websites: newWebsites };
    });
  };
  
  const handleAddressChange = (index: number, field: keyof Address, value: string | boolean) => {
    setFormValues(prev => {
      const newAddresses = [...(prev.addresses || [])];
      newAddresses[index] = { ...newAddresses[index], [field]: value };
      return { ...prev, addresses: newAddresses };
    });
  };
  
  const addAddress = () => {
    setFormValues(prev => ({
      ...prev,
      addresses: [...(prev.addresses || []), { 
        street: '', 
        city: '', 
        state: '', 
        zip: '', 
        country: '', 
        type: 'Work', 
        is_primary: false 
      }]
    }));
  };
  
  const removeAddress = (index: number) => {
    setFormValues(prev => {
      const newAddresses = [...(prev.addresses || [])];
      newAddresses.splice(index, 1);
      return { ...prev, addresses: newAddresses };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create contacts.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!profileData?.organization_id) {
        throw new Error("Organization not found");
      }
      
      const primaryEmail = formValues.emails?.find(e => e.is_primary)?.email || formValues.emails?.[0]?.email || '';
      const primaryPhone = formValues.phones?.find(p => p.is_primary)?.phone || formValues.phones?.[0]?.phone || '';
      const primaryAddress = formValues.addresses?.find(a => a.is_primary) || formValues.addresses?.[0];
      
      const contactData = {
        contact_type_id: formValues.contact_type_id,
        prefix: formValues.prefix || null,
        first_name: formValues.first_name || null,
        middle_name: formValues.middle_name || null,
        last_name: formValues.last_name || null,
        company_name: formValues.company_name || null,
        job_title: formValues.job_title || null,
        date_of_birth: formValues.date_of_birth || null,
        profile_image_url: formValues.profile_image_url || null,
        email: primaryEmail || null,
        phone: primaryPhone || null,
        address: primaryAddress?.street || null,
        city: primaryAddress?.city || null,
        state: primaryAddress?.state || null,
        zip: primaryAddress?.zip || null,
        country: primaryAddress?.country || null,
        notes: formValues.notes || null,
        is_client: formValues.is_client || false,
        organization_id: profileData.organization_id,
        created_by: user.id,
        emails: formValues.emails,
        phones: formValues.phones,
        websites: formValues.websites,
        addresses: formValues.addresses,
        payment_profile: formValues.payment_profile,
        billing_rate: formValues.billing_rate,
        ledes_client_id: formValues.ledes_client_id,
      };

      const databaseContactData = prepareContactForDatabase(contactData);
      
      let result;
      
      if (contact) {
        const { data, error } = await supabase
          .from('contacts')
          .update({
            ...databaseContactData,
            created_by: contact.created_by,
            contact_type_id: contactData.contact_type_id
          })
          .eq('id', contact.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('contacts')
          .insert({
            ...databaseContactData,
            contact_type_id: contactData.contact_type_id,
            created_by: user.id
          })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      const processedContact = processContactFromDatabase(result);
      
      onSuccess(processedContact);
      
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Failed to save contact.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isPersonType = getContactTypeName(formValues.contact_type_id) === 'Person';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Edit Contact' : 'New Contact'}
          </DialogTitle>
          <DialogDescription>
            {contact 
              ? 'Update contact information.' 
              : 'Add a new contact to your directory.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
              <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
              <TabsTrigger value="billing-prefs">Billing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contact-info" className="mt-4 space-y-6">
              <div className="space-y-2">
                <Label>Is this contact a person or a company?</Label>
                <RadioGroup 
                  value={formValues.contact_type_id} 
                  onValueChange={handleContactTypeChange}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  {contactTypes.map(type => (
                    <div 
                      key={type.id} 
                      className={`
                        flex items-center space-x-2 border rounded-lg p-4 cursor-pointer
                        ${formValues.contact_type_id === type.id ? 'border-yorpro-600 bg-yorpro-50' : 'border-gray-200'}
                      `}
                      onClick={() => handleContactTypeChange(type.id)}
                    >
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id} className="cursor-pointer flex items-center gap-2">
                        {type.name === 'Person' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Profile photo</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline">
                    <Upload className="h-4 w-4 mr-2" /> Upload photo
                  </Button>
                </div>
              </div>
              
              {isPersonType ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="prefix">Prefix</Label>
                      <Select 
                        value={formValues.prefix || "none"} 
                        onValueChange={(value) => setFormValues(prev => ({ ...prev, prefix: value === "none" ? '' : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Mr.">Mr.</SelectItem>
                          <SelectItem value="Mrs.">Mrs.</SelectItem>
                          <SelectItem value="Ms.">Ms.</SelectItem>
                          <SelectItem value="Dr.">Dr.</SelectItem>
                          <SelectItem value="Prof.">Prof.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="first_name">First name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formValues.first_name || ''}
                        onChange={handleChange}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="middle_name">Middle name</Label>
                      <Input
                        id="middle_name"
                        name="middle_name"
                        value={formValues.middle_name || ''}
                        onChange={handleChange}
                        placeholder="Michael"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formValues.last_name || ''}
                        onChange={handleChange}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="company_name">Company</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={formValues.company_name || ''}
                        onChange={handleChange}
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="job_title">Title</Label>
                      <Input
                        id="job_title"
                        name="job_title"
                        value={formValues.job_title || ''}
                        onChange={handleChange}
                        placeholder="General Manager"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">Date of birth</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formValues.date_of_birth || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="company_name">Name</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formValues.company_name || ''}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <Label>Email</Label>
                {formValues.emails?.map((email, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-start">
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Email address"
                        value={email.email}
                        onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Select 
                        value={email.type} 
                        onValueChange={(value) => handleEmailChange(index, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={email.is_primary}
                        onCheckedChange={(checked) => {
                          formValues.emails?.forEach((e, i) => {
                            if (i !== index) handleEmailChange(i, 'is_primary', false);
                          });
                          handleEmailChange(index, 'is_primary', checked);
                        }}
                      />
                      <Label>Primary</Label>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeEmail(index)}
                        disabled={index === 0 && formValues.emails?.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmail}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add email address
                </Button>
              </div>
              
              <div className="space-y-4">
                <Label>Phone</Label>
                {formValues.phones?.map((phone, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-start">
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Phone number"
                        value={phone.phone}
                        onChange={(e) => handlePhoneChange(index, 'phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Select 
                        value={phone.type} 
                        onValueChange={(value) => handlePhoneChange(index, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Mobile">Mobile</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Fax">Fax</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={phone.is_primary}
                        onCheckedChange={(checked) => {
                          formValues.phones?.forEach((p, i) => {
                            if (i !== index) handlePhoneChange(i, 'is_primary', false);
                          });
                          handlePhoneChange(index, 'is_primary', checked);
                        }}
                      />
                      <Label>Primary</Label>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removePhone(index)}
                        disabled={index === 0 && formValues.phones?.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhone}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add phone number
                </Button>
              </div>
              
              <div className="space-y-4">
                <Label>Website</Label>
                {formValues.websites?.map((website, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-start">
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Web address"
                        value={website.url}
                        onChange={(e) => handleWebsiteChange(index, 'url', e.target.value)}
                      />
                    </div>
                    <div>
                      <Select 
                        value={website.type} 
                        onValueChange={(value) => handleWebsiteChange(index, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={website.is_primary}
                        onCheckedChange={(checked) => {
                          formValues.websites?.forEach((w, i) => {
                            if (i !== index) handleWebsiteChange(i, 'is_primary', false);
                          });
                          handleWebsiteChange(index, 'is_primary', checked);
                        }}
                      />
                      <Label>Primary</Label>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeWebsite(index)}
                        disabled={index === 0 && formValues.websites?.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWebsite}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add website
                </Button>
              </div>
              
              <div className="space-y-4">
                <Label>Address</Label>
                {formValues.addresses?.map((address, index) => (
                  <div key={index} className="space-y-3 p-3 border border-gray-100 rounded-md">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium text-gray-700">Address {index + 1}</div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAddress(index)}
                        disabled={index === 0 && formValues.addresses?.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-1 sm:inline hidden">Remove</span>
                      </Button>
                    </div>
                    <Input
                      placeholder="Street"
                      value={address.street}
                      onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                      className="mb-2"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="City"
                        value={address.city}
                        onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                      />
                      <Input
                        placeholder="State/Province"
                        value={address.state}
                        onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                      />
                      <Input
                        placeholder="ZIP/Postal Code"
                        value={address.zip}
                        onChange={(e) => handleAddressChange(index, 'zip', e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Country"
                      value={address.country}
                      onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex items-center justify-between">
                      <Select 
                        value={address.type} 
                        onValueChange={(value) => handleAddressChange(index, 'type', value)}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={address.is_primary}
                          onCheckedChange={(checked) => {
                            formValues.addresses?.forEach((a, i) => {
                              if (i !== index) handleAddressChange(i, 'is_primary', false);
                            });
                            handleAddressChange(index, 'is_primary', checked);
                          }}
                        />
                        <Label>Primary</Label>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAddress}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add address
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="p-4 border border-gray-100 rounded-md">
                  <p className="text-sm mb-4">
                    Add up to 50 tags to a contact for easier searching, filtering, and categorization. 
                    The tags will appear on a contact's dashboard, the contacts table, related contacts section 
                    in a matter's dashboard, and contact selector drop-downs.
                  </p>
                  <p className="text-sm mb-2">
                    <a href="#" className="text-yorpro-600 hover:underline">
                      How do I manage my contact tags?
                    </a>
                  </p>
                  <div className="mt-2">
                    <Input placeholder="Type to search or create tags..." />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formValues.notes || ''}
                  onChange={handleChange}
                  placeholder="Add any additional information here..."
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="custom-fields" className="mt-4 space-y-4">
              <div className="p-4 border border-gray-100 rounded-md">
                <div className="flex items-start">
                  <FileText className="h-8 w-8 text-yorpro-600 mr-3" />
                  <div>
                    <h3 className="text-base font-medium mb-1">Custom Fields</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Speed up your workflow by creating Custom Field sets for often-used Custom Fields.
                    </p>
                    <Button variant="outline">Add custom field</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="billing-prefs" className="mt-4 space-y-4">
              {!isPersonType && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-gray-600 mr-2 mt-1" />
                    <h3 className="text-base font-medium">Employees</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    No employees have been added yet. You can add employees to this company after saving.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Billing preferences</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Payment profile</Label>
                    <Select 
                      value={formValues.payment_profile || 'Default'} 
                      onValueChange={(value) => setFormValues(prev => ({ ...prev, payment_profile: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="Net15">Net 15</SelectItem>
                        <SelectItem value="Net30">Net 30</SelectItem>
                        <SelectItem value="Net60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      30 days grace period. No discount. No interest.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formValues.billing_rate !== undefined}
                        onCheckedChange={(checked) => {
                          setFormValues(prev => ({
                            ...prev,
                            billing_rate: checked ? prev.billing_rate || 0 : undefined
                          }));
                        }}
                      />
                      <Label>Hourly billing</Label>
                    </div>
                    
                    {formValues.billing_rate !== undefined && (
                      <div className="ml-8 mt-2">
                        <Label htmlFor="billing_rate">Custom rate</Label>
                        <Input
                          id="billing_rate"
                          type="number"
                          value={formValues.billing_rate || ''}
                          onChange={(e) => setFormValues(prev => ({ 
                            ...prev, 
                            billing_rate: e.target.value ? Number(e.target.value) : undefined 
                          }))}
                          placeholder="0.00"
                          className="max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="ledes_client_id">LEDES client ID</Label>
                    <Input
                      id="ledes_client_id"
                      value={formValues.ledes_client_id || ''}
                      onChange={(e) => setFormValues(prev => ({ ...prev, ledes_client_id: e.target.value }))}
                      placeholder="Enter LEDES ID"
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="pt-3 border-t flex items-center space-x-2">
            <Switch
              id="is_client"
              checked={Boolean(formValues.is_client)}
              onCheckedChange={(checked) => handleSwitchChange(checked, 'is_client')}
            />
            <Label htmlFor="is_client">This is a client</Label>
          </div>
          
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {contact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
