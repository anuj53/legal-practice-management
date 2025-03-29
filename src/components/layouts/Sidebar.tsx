
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Activity, 
  CreditCard, 
  Database, 
  MessageSquare, 
  BarChart2, 
  Settings,
  Users,
  File,
  MessageCircle,
  DollarSign,
  UserPlus,
  ClipboardList,
  GitBranch,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  to,
  collapsed 
}: { 
  icon: any;
  label: string;
  to: string;
  collapsed?: boolean;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        collapsed 
          ? "flex justify-center rounded-md py-2.5 text-sm font-medium transition-all group" 
          : "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:bg-yorpro-700/90 group",
        isActive 
          ? "bg-gradient-to-r from-yorpro-700 to-yorpro-600 text-white shadow-sm" 
          : "text-white/80 hover:text-white"
      )
    }
  >
    <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", collapsed && "mx-auto")} />
    {!collapsed && <span>{label}</span>}
  </NavLink>
);

const YorProLogo = ({ collapsed }: { collapsed?: boolean }) => (
  <div className={cn("flex items-center gap-3 px-3 py-6", collapsed && "justify-center")}>
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white to-gray-200 shadow-md">
      <span className="text-yorpro-800 font-bold text-xl">Y</span>
    </div>
    {!collapsed && (
      <div className="flex flex-col">
        <span className="font-bold text-white text-xl">YorPro</span>
        <span className="text-xs text-white/70">Legal Management</span>
      </div>
    )}
  </div>
);

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <div className={cn(
      "bg-gradient-to-b from-yorpro-800 to-yorpro-900 text-white h-screen flex flex-col border-r border-yorpro-700 shadow-xl",
      collapsed ? "w-16" : "w-64"
    )}>
      <YorProLogo collapsed={collapsed} />
      
      <Separator className="bg-yorpro-700/50 my-2" />
      
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-0.5">
          <SidebarItem icon={BarChart} label="Dashboard" to="/" collapsed={collapsed} />
          <SidebarItem icon={Calendar} label="Calendar" to="/calendar" collapsed={collapsed} />
          <SidebarItem icon={CheckSquare} label="Tasks" to="/tasks" collapsed={collapsed} />
          <SidebarItem icon={FileText} label="Matter" to="/matter" collapsed={collapsed} />
          <SidebarItem icon={Users} label="Contacts" to="/contacts" collapsed={collapsed} />
          <SidebarItem icon={Activity} label="Activities" to="/activities" collapsed={collapsed} />
          <SidebarItem icon={File} label="Documents" to="/documents" collapsed={collapsed} />
          <SidebarItem icon={MessageCircle} label="Interactions" to="/interactions" collapsed={collapsed} />
          <SidebarItem icon={DollarSign} label="Billings" to="/billings" collapsed={collapsed} />
          <SidebarItem icon={BarChart2} label="Reports" to="/reports" collapsed={collapsed} />
          <SidebarItem icon={UserPlus} label="Leads" to="/leads" collapsed={collapsed} />
          <SidebarItem icon={ClipboardList} label="Intake Form" to="/intake-form" collapsed={collapsed} />
          <SidebarItem icon={GitBranch} label="Workflows" to="/workflows" collapsed={collapsed} />
        </div>
        
        <Separator className="bg-yorpro-700/50 my-4" />
        
        <div className="space-y-0.5">
          <SidebarItem icon={Settings} label="Settings" to="/settings" collapsed={collapsed} />
          <SidebarItem icon={Palette} label="Appearance" to="/appearance" collapsed={collapsed} />
        </div>
      </ScrollArea>
      
      {!collapsed && (
        <div className="p-3 mt-auto">
          <div className="rounded-lg bg-gradient-to-r from-yorpro-700/80 to-yorpro-700/50 backdrop-blur-sm p-3 border border-yorpro-600/30 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yorpro-500 to-yorpro-400 flex items-center justify-center shadow-md">
                <span className="font-semibold text-white">JD</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-white/70">Attorney</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-yorpro-600/20">
              <Button variant="ghost" size="sm" className="w-full justify-center text-white/80 hover:text-white hover:bg-yorpro-600/50 text-xs">
                Manage Account
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {collapsed && (
        <div className="p-2 mt-auto flex justify-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yorpro-500 to-yorpro-400 flex items-center justify-center shadow-md">
            <span className="font-semibold text-white">JD</span>
          </div>
        </div>
      )}
    </div>
  );
}
