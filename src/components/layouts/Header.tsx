
import React, { useState } from 'react';
import { Search, Bell, Plus, Clock, Menu, Sun, Moon, Calendar, FileText, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export function Header() {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  return (
    <header className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white shadow-sm backdrop-blur-md bg-white/90 sticky top-0 z-30">
      <div className="flex items-center gap-4 w-full max-w-md">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search YorPro" 
            className="pl-10 h-9 w-full rounded-full bg-gray-50 border-gray-200 focus-visible:bg-white transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1 text-sm ${isTimerRunning ? 'text-white bg-yorpro-600' : 'text-gray-600 bg-gray-100'} px-3 py-1.5 rounded-full transition-colors cursor-pointer shadow-sm hover:shadow`} onClick={toggleTimer}>
          <Clock className={`h-4 w-4 ${isTimerRunning ? 'text-white' : 'text-yorpro-600'}`} />
          <span>{timerDisplay}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-gray-100">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-gray-600" />
          </Button>
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
          <PopoverContent className="w-80 p-0 shadow-lg rounded-xl border-gray-200" align="end">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <span className="bg-legal-red text-white text-xs font-medium px-2 py-0.5 rounded-full">3 new</span>
            </div>
            <div className="py-1 max-h-64 overflow-y-auto">
              <div className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Meeting Reminder</span>
                  <span className="text-xs text-gray-500">10m ago</span>
                </div>
                <p className="text-sm text-gray-600">Client consultation with Johnson in 30 minutes</p>
              </div>
              <div className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Document Uploaded</span>
                  <span className="text-xs text-gray-500">1h ago</span>
                </div>
                <p className="text-sm text-gray-600">Sarah uploaded 3 files to Smith v. Jones case</p>
              </div>
              <div className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Case Update</span>
                  <span className="text-xs text-gray-500">3h ago</span>
                </div>
                <p className="text-sm text-gray-600">Court date changed for Williams Estate case</p>
              </div>
            </div>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full hover:bg-gray-50">View all</Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-1 rounded-full px-4 bg-gradient-to-r from-yorpro-600 to-yorpro-700 hover:from-yorpro-700 hover:to-yorpro-800 shadow-md transition-shadow hover:shadow-lg">
              <Plus className="h-4 w-4" />
              Create new
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-1 rounded-lg shadow-lg w-56">
            <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 rounded-md m-1 cursor-pointer">
              <Calendar className="mr-2 h-4 w-4 text-yorpro-600" />
              <span>New Event</span>
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 rounded-md m-1 cursor-pointer">
              <CheckSquare className="mr-2 h-4 w-4 text-legal-green" />
              <span>New Task</span>
              <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 rounded-md m-1 cursor-pointer">
              <FileText className="mr-2 h-4 w-4 text-legal-purple" />
              <span>New Matter</span>
              <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 rounded-md m-1 cursor-pointer">
              <Plus className="mr-2 h-4 w-4 text-legal-red" />
              <span>New Contact</span>
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Separator orientation="vertical" className="h-8 mx-1" />
        
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yorpro-500 to-yorpro-400 flex items-center justify-center shadow-md">
                <span className="font-semibold text-white text-sm">JD</span>
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">John</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 shadow-lg rounded-xl border-gray-200" align="end">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yorpro-500 to-yorpro-400 flex items-center justify-center shadow-md">
                  <span className="font-semibold text-white">JD</span>
                </div>
                <div>
                  <h4 className="font-medium">John Doe</h4>
                  <p className="text-sm text-gray-500">Attorney</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <Button variant="ghost" className="w-full justify-start text-sm px-4 py-2 hover:bg-gray-50">
                <span>My Profile</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm px-4 py-2 hover:bg-gray-50">
                <span>Account Settings</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm px-4 py-2 hover:bg-gray-50">
                <span>Help & Support</span>
              </Button>
              <Separator className="my-1" />
              <Button variant="ghost" className="w-full justify-start text-sm px-4 py-2 hover:bg-gray-50 text-legal-red">
                <span>Sign Out</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
