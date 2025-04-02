
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileEdit, 
  Trash2,
  Filter 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
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

interface Matter {
  id: string;
  name: string;
  description?: string;
  status: string;
  practice_area?: string;
  responsible_attorney_id?: string;
  client_id?: string;
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
          <Button onClick={() => navigate('/matter-templates/new')}>
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
                <Button onClick={() => navigate('/matter-templates')} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Matter
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Practice Area</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatters.map((matter) => (
                  <TableRow 
                    key={matter.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewMatter(matter.id)}
                  >
                    <TableCell className="font-medium">{matter.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        matter.status === 'Open' ? 'bg-green-100 text-green-800' : 
                        matter.status === 'Closed' ? 'bg-gray-100 text-gray-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {matter.status}
                      </span>
                    </TableCell>
                    <TableCell>{matter.practice_area || '-'}</TableCell>
                    <TableCell>{matter.client_id || '-'}</TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMatter(matter.id)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
