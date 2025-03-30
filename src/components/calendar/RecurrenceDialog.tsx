
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { RecurrencePattern } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RecurrenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPattern?: RecurrencePattern;
  onSave: (pattern: RecurrencePattern) => void;
}

export function RecurrenceDialog({ 
  open, 
  onOpenChange, 
  initialPattern, 
  onSave 
}: RecurrenceDialogProps) {
  const [frequency, setFrequency] = useState<RecurrencePattern['frequency']>(initialPattern?.frequency || 'WEEKLY');
  const [interval, setInterval] = useState<number>(initialPattern?.interval || 1);
  const [endType, setEndType] = useState<'never' | 'after' | 'on'>(
    initialPattern?.endDate ? 'on' : 
    initialPattern?.occurrences ? 'after' : 'never'
  );
  const [occurrences, setOccurrences] = useState<number>(initialPattern?.occurrences || 5);
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialPattern?.endDate ? new Date(initialPattern.endDate) : undefined
  );

  const handleSave = () => {
    const pattern: RecurrencePattern = {
      frequency,
      interval,
      ...(endType === 'after' ? { occurrences } : {}),
      ...(endType === 'on' ? { endDate } : {})
    };
    
    onSave(pattern);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recurrence Pattern</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(value: RecurrencePattern['frequency']) => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="interval">Every</Label>
            <div className="flex items-center gap-2">
              <Input
                id="interval"
                type="number"
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="w-20"
              />
              <span className="text-sm text-gray-500">
                {frequency === 'DAILY' && 'day(s)'}
                {frequency === 'WEEKLY' && 'week(s)'}
                {frequency === 'MONTHLY' && 'month(s)'}
                {frequency === 'YEARLY' && 'year(s)'}
              </span>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>Ends</Label>
            <RadioGroup value={endType} onValueChange={(value: 'never' | 'after' | 'on') => setEndType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never">Never</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after" id="after" />
                <Label htmlFor="after">After</Label>
                <Input
                  type="number"
                  value={occurrences}
                  onChange={(e) => setOccurrences(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-16 ml-2"
                  disabled={endType !== 'after'}
                />
                <span className="text-sm text-gray-500">occurrence(s)</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="on" id="on" />
                <Label htmlFor="on">On</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "ml-2 w-[180px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      disabled={endType !== 'on'}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
