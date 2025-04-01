
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { User, UserRound, Mail, Key, Shield, Image, Camera } from 'lucide-react';

// Form schema for profile update
const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }).optional(),
  designation: z.string().optional(),
  role: z.string().optional(),
  organization: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Interface for profile data
interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_alias: string | null;
  designation: string | null;
  created_at: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  organization_name?: string | null;
}

export default function AccountSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  
  // Initialize the form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      designation: '',
      role: 'User',
      organization: '',
    },
  });

  // Fetch organization info
  const fetchOrganizationInfo = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching organization:', error);
        return null;
      }
      
      return data?.name;
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  };

  // Fetch profile data
  useEffect(() => {
    const getProfileData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setProfileData(data);
          
          // Fetch organization name if there's an organization_id
          if (data.organization_id) {
            const orgName = await fetchOrganizationInfo(data.organization_id);
            setOrganizationName(orgName);
          }
          
          // Update form values
          form.reset({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: user.email || '',
            designation: data.designation || '',
            organization: organizationName || 'Harvey and Partners',
          });
        } else {
          // No profile found, create one
          console.log('No profile found in settings page, creating one...');
          const { error: insertError, data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              first_name: '',
              last_name: '',
              email_alias: user.email,
              organization_id: (await getDefaultOrganizationId()) || null,
            })
            .select()
            .single();
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast({
              title: "Error",
              description: "Failed to create user profile",
              variant: "destructive",
            });
            return;
          }
          
          if (newProfile) {
            setProfileData(newProfile);
            setOrganizationName('Harvey and Partners');
            form.reset({
              firstName: newProfile.first_name || '',
              lastName: newProfile.last_name || '',
              email: user.email || '',
              designation: '',
              organization: 'Harvey and Partners',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getProfileData();
  }, [user, form]);
  
  // Get default organization ID
  const getDefaultOrganizationId = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', 'Harvey and Partners')
        .maybeSingle();
      
      if (error || !data) {
        console.error('Error fetching default organization:', error);
        return null;
      }
      
      return data.id;
    } catch (error) {
      console.error('Error fetching default organization:', error);
      return null;
    }
  };

  // Handle profile picture upload
  const handleUploadProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !user) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    setUploading(true);
    
    try {
      // Check if 'avatars' storage bucket exists
      const { data: bucketExists } = await supabase
        .storage
        .getBucket('avatars');
      
      // If bucket doesn't exist, create it
      if (!bucketExists) {
        const { error: createBucketError } = await supabase
          .storage
          .createBucket('avatars', { 
            public: true,
            fileSizeLimit: 1024 * 1024 * 2 // 2MB limit
          });
        
        if (createBucketError) {
          throw createBucketError;
        }
      }
      
      // Upload file
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      if (profileData) {
        setProfileData({
          ...profileData,
          avatar_url: data.publicUrl,
        });
      }
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
      
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          designation: values.designation || null,
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      // Update local state
      if (profileData) {
        setProfileData({
          ...profileData,
          first_name: values.firstName,
          last_name: values.lastName,
          designation: values.designation || null,
        });
      }
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (profileData?.first_name && profileData?.last_name) {
      return `${profileData.first_name[0]}${profileData.last_name[0]}`.toUpperCase();
    }
    
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return "U";
  };

  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-fit">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and how it appears in the system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative group">
                      <Avatar className="h-20 w-20 border-2 border-gray-200">
                        {profileData?.avatar_url ? (
                          <AvatarImage src={profileData.avatar_url} alt="Profile Picture" />
                        ) : (
                          <AvatarFallback className="bg-yorpro-600 text-white text-xl">
                            {getInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 bg-yorpro-600 rounded-full p-1 text-white cursor-pointer hover:bg-yorpro-700 transition-colors"
                      >
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={handleUploadProfilePicture}
                          disabled={uploading}
                        />
                        <Camera size={16} />
                      </label>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Profile Picture</h3>
                      <p className="text-sm text-muted-foreground">
                        {uploading ? 'Uploading...' : 'Click the camera icon to upload a new profile picture'}
                      </p>
                    </div>
                  </div>

                  <Separator />
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Designation/Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Your designation" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization</FormLabel>
                            <FormControl>
                              <Input value={organizationName || 'Harvey and Partners'} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Input placeholder="Your role" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Password change functionality will be implemented in the future.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your application experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    User preferences will be implemented in the future.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
