
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
    <header className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search YorPro" 
            className="pl-10 h-9 w-full rounded-full bg-gray-50 border-gray-200 focus-visible:bg-white transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
          <Clock className="h-4 w-4 text-yorpro-600" />
          <span>00:00:00</span>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-legal-red text-[10px] font-medium text-white animate-pulse">
                3
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-lg rounded-xl" align="end">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <span className="bg-legal-red text-white text-xs font-medium px-2 py-0.5 rounded-full">3 new</span>
            </div>
            <div className="py-1 max-h-64 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">Meeting Reminder</span>
                    <span className="text-xs text-gray-500">10m ago</span>
                  </div>
                  <p className="text-sm text-gray-600">Client consultation in 30 minutes</p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full hover:bg-gray-50">View all</Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-1 rounded-full px-4 bg-gradient-to-r from-yorpro-600 to-yorpro-700 hover:from-yorpro-700 hover:to-yorpro-800 shadow-md">
              <Plus className="h-4 w-4" />
              Create new
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-1 rounded-lg shadow-lg">
            <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 rounded-md m-1 cursor-pointer">
              New Event
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 rounded-md m-1 cursor-pointer">
              New Task
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 rounded-md m-1 cursor-pointer">
              New Matter
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 rounded-md m-1 cursor-pointer">
              New Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
