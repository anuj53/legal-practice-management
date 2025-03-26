
import React from 'react';
import { Search, Bell, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function Header() {
  return (
    <header className="h-14 border-b border-gray-200 px-4 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search YorPro" 
            className="pl-10 h-9 w-full border-gray-200"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
          <Clock className="h-4 w-4" />
          <span>00:00:00</span>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                3
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-2 border-b">
              <h3 className="font-medium">Notifications</h3>
            </div>
            <div className="py-1 max-h-64 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">Meeting Reminder</span>
                    <span className="text-xs text-gray-500">10m ago</span>
                  </div>
                  <p className="text-sm text-gray-600">Client consultation in 30 minutes</p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full">View all</Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-1 bg-yorpro-600 hover:bg-yorpro-700">
              <Plus className="h-4 w-4" />
              Create new
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              New Event
            </DropdownMenuItem>
            <DropdownMenuItem>
              New Task
            </DropdownMenuItem>
            <DropdownMenuItem>
              New Matter
            </DropdownMenuItem>
            <DropdownMenuItem>
              New Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
