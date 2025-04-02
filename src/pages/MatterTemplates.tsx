
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { MatterTemplatesView } from '@/components/matter/MatterTemplatesView';

export default function MatterTemplates() {
  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/matter" className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Matters
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Matter Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <MatterTemplatesView />
      </div>
    </div>
  );
}
