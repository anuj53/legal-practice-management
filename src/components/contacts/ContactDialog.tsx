
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
import { toast } from '@/hooks/use-toast';
import { Building2, User, Loader2 } from 'lucide-react';
import { Contact, ContactType, ContactFormValues } from '@/types/contact';

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
  
  // Form state
  const [formValues, setFormValues] = useState<ContactFormValues>(
    contact ? {
      contact_type_id: contact.contact_type_id,
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      company_name: contact.company_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      zip: contact.zip || '',
      country: contact.country || '',
      notes: contact.notes || '',
      is_client: Boolean(contact.is_client),
    } : {
      contact_type_id: contactTypes.find(t => t.name === 'Person')?.id || '',
      is_client: false,
    }
  );

  // Utility function to get contact type name
  const getContactTypeName = (id: string) => {
    return contactTypes.find(t => t.id === id)?.name || '';
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch (boolean) fields
  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormValues(prev => ({ ...prev, [name]: checked }));
  };

  // Handle contact type selection
  const handleContactTypeChange = (value: string) => {
    setFormValues(prev => ({ ...prev, contact_type_id: value }));
  };

  // Submit form
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
      
      // Get organization ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!profileData?.organization_id) {
        throw new Error("Organization not found");
      }
      
      // Prepare contact data
      const contactData = {
        ...formValues,
        organization_id: profileData.organization_id,
        created_by: user.id,
      };
      
      // Insert or update contact
      const operation = contact 
        ? supabase.from('contacts').update(contactData).eq('id', contact.id)
        : supabase.from('contacts').insert(contactData);
      
      const { data, error } = await operation.select().single();
      
      if (error) throw error;
      
      // Success
      onSuccess(data);
      
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
          {/* Contact Type Selection */}
          <div className="space-y-2">
            <Label>Contact Type</Label>
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
          
          {/* Person or Company specific fields */}
          {isPersonType ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formValues.first_name || ''}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formValues.last_name || ''}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formValues.company_name || ''}
                onChange={handleChange}
                placeholder="Acme Corporation"
              />
            </div>
          )}
          
          {/* Common fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formValues.email || ''}
                onChange={handleChange}
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formValues.phone || ''}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          {/* Address */}
          <div className="space-y-4">
            <Label>Address</Label>
            <Input
              id="address"
              name="address"
              value={formValues.address || ''}
              onChange={handleChange}
              placeholder="Street Address"
            />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <Input
                  id="city"
                  name="city"
                  value={formValues.city || ''}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>
              <div>
                <Input
                  id="state"
                  name="state"
                  value={formValues.state || ''}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>
              <div>
                <Input
                  id="zip"
                  name="zip"
                  value={formValues.zip || ''}
                  onChange={handleChange}
                  placeholder="ZIP"
                />
              </div>
            </div>
            
            <Input
              id="country"
              name="country"
              value={formValues.country || ''}
              onChange={handleChange}
              placeholder="Country"
            />
          </div>
          
          {/* Notes */}
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
          
          {/* Client indicator */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_client"
              checked={Boolean(formValues.is_client)}
              onCheckedChange={(checked) => handleSwitchChange(checked, 'is_client')}
            />
            <Label htmlFor="is_client">This is a client</Label>
          </div>
          
          {/* Form actions */}
          <div className="flex justify-end gap-2">
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
