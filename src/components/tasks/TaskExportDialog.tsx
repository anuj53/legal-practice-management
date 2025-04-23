
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Task } from '@/types/task';
import { exportTasksToPDF } from '@/utils/taskExportUtils';
import { toast } from '@/hooks/use-toast';

interface TaskExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
}

export function TaskExportDialog({ open, onOpenChange, tasks }: TaskExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportTasksToPDF(tasks);
      onOpenChange(false);
      toast({
        title: "Export Successful",
        description: "Your tasks have been exported to PDF",
      });
    } catch (error) {
      console.error('Error exporting tasks:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Tasks</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Generate a beautifully formatted PDF report of your tasks. The report will include task details, priorities, status, and other relevant information.
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              'Export PDF'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
