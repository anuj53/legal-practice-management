
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, FileText, CheckSquare, Users, Folder, BarChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  to 
}: { 
  icon: any;
  label: string;
  to: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-yorpro-700",
        isActive ? "bg-yorpro-700 text-white" : "text-white/70 hover:text-white"
      )
    }
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </NavLink>
);

const YorProLogo = () => (
  <div className="flex items-center gap-2 px-3 py-4">
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
      <span className="text-yorpro-800 font-bold text-lg">Y</span>
    </div>
    <div className="flex flex-col">
      <span className="font-semibold text-white text-lg">YorPro</span>
      <span className="text-xs text-white/70">Legal Management</span>
    </div>
  </div>
);

export function Sidebar() {
  return (
    <div className="bg-yorpro-800 text-white h-screen w-64 flex flex-col border-r border-yorpro-700 overflow-y-auto custom-scrollbar">
      <YorProLogo />
      
      <Separator className="bg-yorpro-700 my-2" />
      
      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          <SidebarItem icon={BarChart} label="Dashboard" to="/" />
          <SidebarItem icon={Calendar} label="Calendar" to="/calendar" />
          <SidebarItem icon={CheckSquare} label="Tasks" to="/tasks" />
          <SidebarItem icon={FileText} label="Matters" to="/matters" />
          <SidebarItem icon={Users} label="Contacts" to="/contacts" />
          <SidebarItem icon={Folder} label="Documents" to="/documents" />
        </div>
        
        <Separator className="bg-yorpro-700 my-4" />
        
        <div className="space-y-1">
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
        </div>
      </div>
      
      <div className="p-3 mt-auto">
        <div className="rounded-md bg-yorpro-700 p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-yorpro-500 flex items-center justify-center">
              <span className="font-medium text-white">JD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-white/70">Attorney</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
