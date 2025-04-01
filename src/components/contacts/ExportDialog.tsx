
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Contact } from '@/types/contact';
import { exportContactsToCSV, exportContactsToPDF, ExportColumnOption } from '@/utils/exportUtils';
import { Info, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
}

export function ExportDialog({ open, onOpenChange, contacts }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [columnOption, setColumnOption] = useState<ExportColumnOption>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      if (exportFormat === 'csv') {
        exportContactsToCSV(contacts, columnOption);
        onOpenChange(false);
      } else {
        await exportContactsToPDF(contacts);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your contacts. Please try again.",
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
          <DialogTitle>Export contacts</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium">Select export format</h3>
            <RadioGroup
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as 'csv' | 'pdf')}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
            </RadioGroup>
          </div>
          
          {exportFormat === 'csv' && (
            <div>
              <div className="flex items-center mb-3">
                <h3 className="text-sm font-medium">Select column layout</h3>
                <div className="ml-1 cursor-help" title="Choose which columns to include in your export">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <RadioGroup
                value={columnOption}
                onValueChange={(value) => setColumnOption(value as ExportColumnOption)}
                className="space-y-3"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="all" id="all-columns" className="mt-1" />
                  <div>
                    <Label htmlFor="all-columns" className="font-medium">Available columns</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Default columns, all custom fields, and system defined columns
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="visible" id="visible-columns" className="mt-1" />
                  <div>
                    <Label htmlFor="visible-columns" className="font-medium">Visible columns only</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
        <DialogFooter className="border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="mr-2"
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
