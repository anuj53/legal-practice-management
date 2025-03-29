
import React, { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, ChevronDown, Plus, Search, Clock } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  const [filterType, setFilterType] = useState('Recently');
  const isMobile = useIsMobile();

  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-5 h-16 flex items-center justify-between shadow-sm backdrop-blur-sm">
      <div className="flex items-center">
        {children}
        <div className={isMobile ? "w-full max-w-[180px]" : "flex-1 max-w-md"}>
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={isMobile ? "Search" : "Search Here"}
              className="w-full bg-gray-50 border-gray-100 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yorpro-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-3">
        {!isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass-dark" className="flex items-center gap-2 bg-gray-50 text-gray-700">
                {filterType}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType('Recently')}>
                Recently
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('This Week')}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('This Month')}>
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!isMobile && (
          <div className="hidden sm:flex items-center px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
            <Clock className="h-5 w-5 mr-2 text-yorpro-600" />
            <span className="font-medium text-gray-700">00:00:00</span>
          </div>
        )}

        <Button 
          variant="gradient" 
          className="btn-modern gap-1" 
          size={isMobile ? "sm" : "default"}
        >
          <Plus className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          {!isMobile && "Add New Entry"}
        </Button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-700" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </Button>
        
        <UserMenu />
      </div>
    </header>
  );
}
