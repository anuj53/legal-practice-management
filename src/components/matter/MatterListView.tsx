
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileEdit, 
  Trash2,
  Filter, 
  Bell,
  User,
  Calendar,
  File
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface Matter {
  id: string;
  name: string;
  description?: string;
  status: string;
  practice_area?: string;
  responsible_attorney_id?: string;
  client_id?: string;
  originating_attorney_id?: string;
  responsible_staff_id?: string;
  notifications?: boolean;
  stage?: string;
  open_date?: string;
  created_at: string;
}

export function MatterListView() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fetchMatters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matters')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching matters:', error);
        toast({
          title: 'Error',
          description: 'Failed to load matters',
          variant: 'destructive',
        });
      } else {
        setMatters(data as Matter[] || []);
      }
    } catch (error) {
      console.error('Error in fetchMatters:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchMatters();
  }, []);
  
  const filteredMatters = matters.filter(matter => 
    matter.name.toLowerCase().includes(search.toLowerCase()) ||
    matter.description?.toLowerCase().includes(search.toLowerCase()) ||
    matter.practice_area?.toLowerCase().includes(search.toLowerCase()) ||
    matter.status.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleEditMatter = (id: string) => {
    navigate(`/matters/${id}/edit`);
  };
  
  const handleViewMatter = (id: string) => {
    navigate(`/matters/${id}`);
  };
  
  const handleDeleteMatter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('matters')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state to remove the deleted matter
      setMatters(matters.filter(matter => matter.id !== id));
      
      toast({
        title: 'Matter Deleted',
        description: 'The matter has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting matter:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete matter',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search matters..."
            className="w-full bg-background pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button onClick={() => navigate('/matter-templates')}>
            <Plus className="mr-2 h-4 w-4" />
            New Matter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matters</CardTitle>
          <CardDescription>
            List of all matters and cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Loading matters...</p>
            </div>
          ) : filteredMatters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <h3 className="text-lg font-semibold">No matters found</h3>
              <p className="text-muted-foreground mt-1">
                {search ? "Try a different search term" : "Create your first matter to get started"}
              </p>
              {!search && (
                <Button onClick={() => navigate('/matter-templates/new')} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Matter
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Actions</TableHead>
                    <TableHead>Matter</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Responsible Attorney</TableHead>
                    <TableHead>Originating Attorney</TableHead>
                    <TableHead>Responsible Staff</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead>Practice Area</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Open Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatters.map((matter) => (
                    <TableRow 
                      key={matter.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div 
                          className="flex items-center space-x-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMatter(matter.id)}
                            title="Edit Matter"
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewMatter(matter.id)}
                            title="View Matter Details"
                          >
                            <File className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Delete Matter">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Matter</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this matter? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteMatter(matter.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{matter.name}</TableCell>
                      <TableCell>{matter.client_id || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-500" />
                          {matter.responsible_attorney_id || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-500" />
                          {matter.originating_attorney_id || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-500" />
                          {matter.responsible_staff_id || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {matter.notifications ? (
                          <Badge variant="outline" className="flex items-center">
                            <Bell className="h-3 w-3 mr-1" /> Enabled
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{matter.practice_area || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          matter.stage === 'Discovery' ? 'bg-blue-100 text-blue-800' : 
                          matter.stage === 'Trial' ? 'bg-purple-100 text-purple-800' : 
                          matter.stage === 'Closing' ? 'bg-orange-100 text-orange-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {matter.stage || 'Not Set'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {matter.open_date || formatDate(matter.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}
