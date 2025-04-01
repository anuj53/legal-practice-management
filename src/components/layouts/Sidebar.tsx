
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Settings, Calendar, User, CheckSquare, FileText } from 'lucide-react';

export default function Sidebar({ collapsed, onToggleCollapse }: { collapsed?: boolean, onToggleCollapse?: () => void }) {
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Settings },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Contacts', href: '/contacts', icon: User },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Matter', href: '/matter', icon: FileText },
  ];
  
  return (
    <div className="flex h-screen flex-col border-r bg-white">
      <div className="flex h-16 shrink-0 items-center justify-center border-b">
        <Link to="/" className="font-bold text-xl text-yorpro-600">YorPro</Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                active
                  ? 'bg-yorpro-50 text-yorpro-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-yorpro-600',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                collapsed && 'justify-center'
              )}
            >
              <item.icon
                className={cn(
                  active ? 'text-yorpro-600' : 'text-gray-400 group-hover:text-yorpro-600',
                  'flex-shrink-0 h-5 w-5',
                  collapsed ? 'mx-auto' : 'mr-3'
                )}
                aria-hidden="true"
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className="px-2 py-4 space-y-1">
        {/* Settings navigation */}
        {!collapsed && (
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Settings
          </div>
        )}
        
        <Link
          to="/settings"
          className={cn(
            isActive('/settings') && !isActive('/settings/custom-fields')
              ? 'bg-yorpro-50 text-yorpro-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-yorpro-600',
            'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
            collapsed && 'justify-center'
          )}
        >
          <Settings
            className={cn(
              isActive('/settings') && !isActive('/settings/custom-fields') ? 'text-yorpro-600' : 'text-gray-400 group-hover:text-yorpro-600',
              'flex-shrink-0 h-5 w-5',
              collapsed ? 'mx-auto' : 'mr-3'
            )}
            aria-hidden="true"
          />
          {!collapsed && <span>General Settings</span>}
        </Link>
        
        <Link
          to="/settings/custom-fields"
          className={cn(
            isActive('/settings/custom-fields')
              ? 'bg-yorpro-50 text-yorpro-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-yorpro-600',
            'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
            collapsed && 'justify-center'
          )}
        >
          <Settings
            className={cn(
              isActive('/settings/custom-fields') ? 'text-yorpro-600' : 'text-gray-400 group-hover:text-yorpro-600',
              'flex-shrink-0 h-5 w-5',
              collapsed ? 'mx-auto' : 'mr-3'
            )}
            aria-hidden="true"
          />
          {!collapsed && <span>Custom Fields</span>}
        </Link>
      </div>
    </div>
  );
}
