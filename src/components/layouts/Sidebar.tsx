
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Activity, 
  Users,
  File,
  MessageCircle,
  DollarSign,
  BarChart2, 
  Settings,
  Palette,
  UserPlus,
  ClipboardList,
  GitBranch,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserProfile } from './UserProfile';
import { useAuth } from '@/hooks/useAuth';

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
          ? "flex justify-center rounded-xl py-3 text-sm font-medium transition-all duration-300 group hover:bg-white/15" 
          : "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 hover:bg-white/15 group",
        isActive 
          ? "bg-gradient-to-r from-white/25 to-white/10 shadow-lg backdrop-blur-sm border border-white/10 text-white" 
          : "text-white/80 hover:text-white"
      )
    }
  >
    <div className={cn(
      "flex items-center justify-center rounded-xl transition-all duration-300",
      collapsed ? "h-10 w-10 bg-gradient-to-br from-white/15 to-white/5 shadow-inner p-2.5 border border-white/10" : ""
    )}>
      <Icon className={cn("h-5 w-5 transition-all duration-300 group-hover:scale-110", collapsed && "mx-auto")} />
    </div>
    {!collapsed && <span className="font-medium">{label}</span>}
  </NavLink>
);

const LPMLogo = ({ collapsed }: { collapsed?: boolean }) => (
  <div className={cn("flex items-center justify-center px-4 py-6", collapsed && "justify-center")}>
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/30 to-white/5 backdrop-blur-md shadow-lg border border-white/20 hover:scale-105 transition-all duration-300">
      <span className="text-white font-bold text-2xl">L</span>
    </div>
  </div>
);

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth();
  
  return (
    <div className={cn(
      "bg-gradient-to-b from-yorpro-800 via-yorpro-900 to-yorpro-950 text-white h-screen flex flex-col border-r border-white/10 shadow-xl relative overflow-hidden",
      collapsed ? "w-24" : "w-72"
    )}>
      {onToggleCollapse && (
        <Button 
          variant="glass" 
          size="icon" 
          className="absolute top-1/2 -right-3 h-8 w-8 rounded-full shadow-lg border border-white/20 z-20"
          onClick={onToggleCollapse}
        >
          {collapsed ? 
            <ChevronRight className="h-4 w-4" /> : 
            <ChevronLeft className="h-4 w-4" />
          }
        </Button>
      )}
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-yorpro-400/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-yorpro-950/50 to-transparent"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-grid-gray-100"></div>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-1 flex-col h-full overflow-hidden">
        <div className="flex-shrink-0">
          <LPMLogo collapsed={collapsed} />
          <Separator className="bg-white/10 mx-4 my-2" />
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <ScrollArea className="flex-1 px-4 py-2">
            <div className="space-y-1">
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
              <div className="mt-8 mb-2">
                <p className="text-xs uppercase font-semibold text-white/40 tracking-widest">Business</p>
              </div>
            )}
            
            <div className="space-y-1 mt-4">
              <SidebarItem icon={UserPlus} label="Leads" to="/leads" collapsed={collapsed} />
              <SidebarItem icon={ClipboardList} label="Intake Form" to="/intake-form" collapsed={collapsed} />
              <SidebarItem icon={GitBranch} label="Workflows" to="/workflows" collapsed={collapsed} />
            </div>
            
            {!collapsed && (
              <div className="mt-8 mb-2">
                <p className="text-xs uppercase font-semibold text-white/40 tracking-widest">System</p>
              </div>
            )}
            
            <div className="space-y-1 mt-4">
              <SidebarItem icon={Settings} label="Settings" to="/settings" collapsed={collapsed} />
              <SidebarItem icon={Palette} label="Appearance" to="/appearance" collapsed={collapsed} />
            </div>
            
            <div className="h-6"></div>
          </ScrollArea>
        </div>
        
        <div className="flex-shrink-0">
          <UserProfile collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}
