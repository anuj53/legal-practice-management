
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MainLayout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isMobile ? (
        <>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Header>
            <main className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-grid-gray-100/25 [mask-image:radial-gradient(white,transparent_85%)]" />
                
                <div className="absolute top-0 right-0 -mt-16 opacity-30 select-none pointer-events-none">
                  <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
                    <g opacity="0.2">
                      <circle cx="200" cy="200" r="150" stroke="url(#paint0_linear)" strokeWidth="2" />
                      <circle cx="200" cy="200" r="125" stroke="url(#paint0_linear)" strokeWidth="2" />
                      <circle cx="200" cy="200" r="100" stroke="url(#paint0_linear)" strokeWidth="2" />
                    </g>
                    <defs>
                      <linearGradient id="paint0_linear" x1="100" y1="100" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0274c4" />
                        <stop offset="1" stopColor="#38acf5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                <div className="absolute bottom-0 left-0 opacity-30 select-none pointer-events-none">
                  <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
                    <path d="M0 0L300 300" stroke="url(#paint1_linear)" strokeWidth="2" />
                    <path d="M50 0L300 250" stroke="url(#paint1_linear)" strokeWidth="2" />
                    <path d="M100 0L300 200" stroke="url(#paint1_linear)" strokeWidth="2" />
                    <defs>
                      <linearGradient id="paint1_linear" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0274c4" />
                        <stop offset="1" stopColor="#38acf5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                <div className="relative z-10 h-full">
                  <ScrollArea className="h-full w-full">
                    <div className="p-4 md:p-6">
                      <Outlet />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </main>
          </div>
        </>
      ) : (
        <>
          <div className={`${sidebarCollapsed ? 'w-24' : 'w-72'} transition-all duration-300 ease-in-out relative h-screen`}>
            <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-grid-gray-100/25 [mask-image:radial-gradient(white,transparent_85%)]" />
                
                <div className="absolute top-0 right-0 -mt-16 opacity-30 select-none pointer-events-none">
                  <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
                    <g opacity="0.2">
                      <circle cx="200" cy="200" r="150" stroke="url(#paint0_linear)" strokeWidth="2" />
                      <circle cx="200" cy="200" r="125" stroke="url(#paint0_linear)" strokeWidth="2" />
                      <circle cx="200" cy="200" r="100" stroke="url(#paint0_linear)" strokeWidth="2" />
                    </g>
                    <defs>
                      <linearGradient id="paint0_linear" x1="100" y1="100" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0274c4" />
                        <stop offset="1" stopColor="#38acf5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                <div className="absolute bottom-0 left-0 opacity-30 select-none pointer-events-none">
                  <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
                    <path d="M0 0L300 300" stroke="url(#paint1_linear)" strokeWidth="2" />
                    <path d="M50 0L300 250" stroke="url(#paint1_linear)" strokeWidth="2" />
                    <path d="M100 0L300 200" stroke="url(#paint1_linear)" strokeWidth="2" />
                    <defs>
                      <linearGradient id="paint1_linear" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0274c4" />
                        <stop offset="1" stopColor="#38acf5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                <div className="relative z-10 h-full w-full">
                  <ScrollArea className="h-full w-full">
                    <div className="p-4 md:p-6">
                      <Outlet />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
