
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, CheckSquare, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  linkTo 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  color: string;
  linkTo: string;
}) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-t-4 rounded-md overflow-hidden animate-fade-in">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color} shadow-md`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <CardDescription className="text-gray-600">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Link to={linkTo}>
        <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent hover:text-yorpro-600 transition-colors">
          Open {title} <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Button>
      </Link>
    </CardContent>
  </Card>
);

const Index = () => {
  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to YorPro</h1>
        <p className="text-gray-600 text-lg">
          Legal management system for efficient case handling and client management
        </p>
        <div className="h-1 w-24 bg-gradient-to-r from-yorpro-500 to-yorpro-700 rounded-full mt-3"></div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">Quick Access</span>
          <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon={Calendar}
            title="Calendar"
            description="Manage appointments, court dates, and deadlines"
            color="bg-gradient-to-r from-yorpro-600 to-yorpro-700"
            linkTo="/calendar"
          />
          
          <DashboardCard
            icon={FileText}
            title="Matters"
            description="View and manage all your legal cases"
            color="bg-gradient-to-r from-legal-purple to-purple-700"
            linkTo="/matters"
          />
          
          <DashboardCard
            icon={CheckSquare}
            title="Tasks"
            description="Track pending tasks and assignments"
            color="bg-gradient-to-r from-legal-green to-green-600"
            linkTo="/tasks"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow border border-gray-200">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-yorpro-600" />
              Recent Activities
            </CardTitle>
            <CardDescription>Your latest case activities and updates</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-start p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
                    <span className="font-medium text-sm text-gray-700">JD</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Document filed for Smith v. Jones</h4>
                    <p className="text-sm text-gray-500">Today at 10:30 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border border-gray-200">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-legal-red" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Critical dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="border-l-4 border-legal-red pl-3 py-1">
                    <h4 className="font-medium text-gray-800">Filing Deadline: Johnson Case</h4>
                    <p className="text-sm text-gray-500">Due in 2 days</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
