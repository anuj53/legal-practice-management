
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function MatterPipelineView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Matter Pipeline</CardTitle>
          <CardDescription>
            Track your matters through various stages of the legal process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold">Matter Pipeline Coming Soon</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              This feature is currently under development. Soon you'll be able to visualize 
              and manage matters at different stages of the legal process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
