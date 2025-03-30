
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { RecurrenceFrequency, RecurrencePattern } from '@/types/calendar';

interface RecurrenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pattern: RecurrencePattern) => void;
  initialPattern?: RecurrencePattern | null;
}

export function RecurrenceDialog({
  isOpen,
  onClose,
  onSave,
  initialPattern
}: RecurrenceDialogProps) {
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(initialPattern?.frequency || 'daily');
  const [interval, setInterval] = useState<number>(initialPattern?.interval || 1);
  const [endType, setEndType] = useState<'never' | 'after' | 'on'>(
    initialPattern?.occurrences ? 'after' : initialPattern?.endDate ? 'on' : 'never'
  );
  const [occurrences, setOccurrences] = useState<number>(initialPattern?.occurrences || 10);
  const [endDate, setEndDate] = useState<Date | undefined>(initialPattern?.endDate);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (initialPattern) {
      setFrequency(initialPattern.frequency);
      setInterval(initialPattern.interval);
      setEndType(
        initialPattern.occurrences ? 'after' :
        initialPattern.endDate ? 'on' : 'never'
      );
      setOccurrences(initialPattern.occurrences || 10);
      setEndDate(initialPattern.endDate);
    }
  }, [initialPattern, isOpen]);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recurrence Pattern</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Repeats</Label>
            <Select 
              value={frequency} 
              onValueChange={(value: RecurrenceFrequency) => setFrequency(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="interval" className="whitespace-nowrap">Every</Label>
            <Input 
              id="interval"
              type="number" 
              min={1} 
              value={interval} 
              onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <span className="ml-1">
              {frequency === 'daily' && (interval > 1 ? 'days' : 'day')}
              {frequency === 'weekly' && (interval > 1 ? 'weeks' : 'week')}
              {frequency === 'monthly' && (interval > 1 ? 'months' : 'month')}
              {frequency === 'yearly' && (interval > 1 ? 'years' : 'year')}
            </span>
          </div>
          
          <div className="space-y-2">
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
                  min={1} 
                  disabled={endType !== 'after'}
                  value={occurrences} 
                  onChange={(e) => setOccurrences(parseInt(e.target.value) || 1)}
                  className="w-20 ml-2"
                />
                <span>occurrences</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="on" id="on" />
                <Label htmlFor="on">On date</Label>
                
                <Popover open={datePickerOpen && endType === 'on'} onOpenChange={(open) => endType === 'on' && setDatePickerOpen(open)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={endType !== 'on'}
                      className="ml-2 w-[200px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
