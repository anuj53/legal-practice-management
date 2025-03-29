
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
          ? "flex justify-center rounded-lg py-3 text-sm font-medium transition-all duration-200 group" 
          : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/10 group",
        isActive 
          ? "bg-white/15 text-white shadow-sm backdrop-blur-sm" 
          : "text-white/80 hover:text-white"
      )
    }
  >
    <div className={cn(
      "flex items-center justify-center rounded-md transition-all duration-200",
      collapsed ? "h-9 w-9 bg-gradient-to-br from-white/10 to-white/5 p-2" : ""
    )}>
      <Icon className={cn("h-5 w-5 transition-all duration-300 group-hover:scale-110", collapsed && "mx-auto")} />
    </div>
    {!collapsed && <span className="font-medium">{label}</span>}
  </NavLink>
);

const YorProLogo = ({ collapsed }: { collapsed?: boolean }) => (
  <div className={cn("flex items-center gap-3 px-4 py-6", collapsed && "justify-center")}>
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md shadow-lg border border-white/10">
      <span className="text-white font-bold text-2xl">Y</span>
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
      "bg-gradient-to-b from-yorpro-800 via-yorpro-900 to-yorpro-950 text-white h-screen flex flex-col border-r border-white/5 shadow-xl",
      collapsed ? "w-20" : "w-64"
    )}>
      <YorProLogo collapsed={collapsed} />
      
      <Separator className="bg-white/10 my-2" />
      
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1.5">
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
        </div>
        
        {!collapsed && (
          <div className="mt-6 mb-2 px-3">
            <p className="text-xs uppercase font-semibold text-white/50 tracking-wider">Business</p>
          </div>
        )}
        
        <div className="space-y-1.5">
          <SidebarItem icon={UserPlus} label="Leads" to="/leads" collapsed={collapsed} />
          <SidebarItem icon={ClipboardList} label="Intake Form" to="/intake-form" collapsed={collapsed} />
          <SidebarItem icon={GitBranch} label="Workflows" to="/workflows" collapsed={collapsed} />
        </div>
        
        {!collapsed && (
          <div className="mt-6 mb-2 px-3">
            <p className="text-xs uppercase font-semibold text-white/50 tracking-wider">System</p>
          </div>
        )}
        
        <div className="space-y-1.5">
          <SidebarItem icon={Settings} label="Settings" to="/settings" collapsed={collapsed} />
          <SidebarItem icon={Palette} label="Appearance" to="/appearance" collapsed={collapsed} />
        </div>
      </ScrollArea>
      
      {!collapsed && (
        <div className="p-4 mt-auto">
          <div className="rounded-xl bg-gradient-to-r from-yorpro-600/20 to-yorpro-700/20 backdrop-blur-sm p-4 border border-white/10 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yorpro-400/80 to-yorpro-500/80 flex items-center justify-center shadow-md border border-white/10">
                <span className="font-semibold text-white">JD</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-white/70">Attorney</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <Button variant="gradient-teal" size="sm" className="w-full justify-center text-xs font-medium">
                Manage Account
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {collapsed && (
        <div className="p-3 mt-auto mb-4 flex justify-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yorpro-400/80 to-yorpro-500/80 flex items-center justify-center shadow-md border border-white/10">
            <span className="font-semibold text-white">JD</span>
          </div>
        </div>
      )}
    </div>
  );
}
