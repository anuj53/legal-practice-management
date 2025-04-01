
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search } from 'lucide-react';

interface ContactsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isClientOnly: boolean;
  setIsClientOnly: (value: boolean) => void;
}

export function ContactsFilters({
  searchTerm,
  setSearchTerm,
  isClientOnly,
  setIsClientOnly
}: ContactsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full sm:w-64 bg-white"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="client-only"
          checked={isClientOnly}
          onCheckedChange={setIsClientOnly}
        />
        <Label htmlFor="client-only" className="text-sm font-medium cursor-pointer">
          Clients only
        </Label>
      </div>
    </div>
  );
}
