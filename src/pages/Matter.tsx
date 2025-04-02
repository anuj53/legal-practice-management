
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { 
  BookTemplate, 
  FilePlus, 
  BarChart2, 
  ListFilter 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function Matter() {
  const navigate = useNavigate();

  return (
    <div className="container py-6">
      <PageHeader
        title="Matters"
        description="Manage your legal cases and matters"
        actions={
          <Button onClick={() => navigate('/matter-templates')}>
            <FilePlus className="mr-2 h-4 w-4" />
            New Matter
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/matter-templates')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookTemplate className="mr-2 h-5 w-5 text-yorpro-600" />
              Matter Templates
            </CardTitle>
            <CardDescription>
              Create and manage templates for different types of matters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use templates to quickly set up new matters with predefined settings and documents.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/matter')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-yorpro-600" />
              Matter Pipeline
            </CardTitle>
            <CardDescription>
              Track matters through their lifecycle stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Visualize and manage matters at different stages of the legal process.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/matter')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListFilter className="mr-2 h-5 w-5 text-yorpro-600" />
              Matter List
            </CardTitle>
            <CardDescription>
              View and search all matters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>See all matters in a searchable and filterable list view.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
