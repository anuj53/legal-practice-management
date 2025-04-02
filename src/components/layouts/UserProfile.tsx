
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';

interface UserProfileProps {
  collapsed?: boolean;
}

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_alias: string | null;
  designation: string | null;
  avatar_url: string | null;
  organization_id: string | null;
}

export function UserProfile({ collapsed = false }: UserProfileProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email_alias, designation, avatar_url, organization_id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching profile data:', error);
          return;
        }
        
        if (data) {
          setProfileData(data);
        } else {
          console.log('No profile found, creating one...');
          
          // Get the default organization ID
          const { data: orgData } = await supabase
            .from('organizations')
            .select('id')
            .eq('name', 'Harvey and Partners')
            .single();
            
          const organizationId = orgData?.id;
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              first_name: '',
              last_name: '',
              email_alias: user.email,
              organization_id: organizationId
            });
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast({
              title: "Error",
              description: "Failed to create user profile",
              variant: "destructive",
            });
            return;
          }
          
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email_alias, designation, avatar_url, organization_id')
            .eq('id', user.id)
            .maybeSingle();
            
          if (newProfile) {
            setProfileData(newProfile);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const getDisplayName = () => {
    if (loading) return 'Loading...';
    
    if (profileData?.first_name && profileData?.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`;
    }
    
    if (profileData?.first_name) {
      return profileData.first_name;
    }
    
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };
  
  const getUserRole = () => {
    return profileData?.designation || 'Attorney';
  };
  
  const getInitials = () => {
    if (profileData?.first_name && profileData?.last_name) {
      return `${profileData.first_name[0]}${profileData.last_name[0]}`.toUpperCase();
    }
    
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return "U";
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("flex-shrink-0 p-4 relative z-10", collapsed && "p-2")}>
      <div className="rounded-xl bg-gradient-to-r from-yorpro-700/30 to-yorpro-800/30 backdrop-blur-md p-4 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-yorpro-400/80 to-yorpro-500/80 flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition-all duration-300 overflow-hidden h-12 w-12">
            <Avatar className="h-full w-full">
              {profileData?.avatar_url ? (
                <AvatarImage 
                  src={profileData.avatar_url} 
                  alt={getDisplayName()} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="font-semibold text-white">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                <p className="text-xs text-white/70">{getUserRole()}</p>
              </div>
              <Button
                variant="glass"
                size="sm"
                className="w-8 h-8 p-0 flex items-center justify-center hover:bg-white/20 hover:text-red-300"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {collapsed && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="glass"
              size="sm"
              className="w-8 h-8 p-0 flex items-center justify-center hover:bg-white/20 hover:text-red-300"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
