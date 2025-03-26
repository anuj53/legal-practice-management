
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
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Link to={linkTo}>
        <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent hover:underline">
          Open {title} →
        </Button>
      </Link>
    </CardContent>
  </Card>
);

const Index = () => {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to YorPro</h1>
        <p className="text-gray-600 mt-2">
          Legal management system for efficient case handling and client management
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon={Calendar}
            title="Calendar"
            description="Manage appointments, court dates, and deadlines"
            color="bg-yorpro-600"
            linkTo="/calendar"
          />
          
          <DashboardCard
            icon={FileText}
            title="Matters"
            description="View and manage all your legal cases"
            color="bg-legal-purple"
            linkTo="/matters"
          />
          
          <DashboardCard
            icon={CheckSquare}
            title="Tasks"
            description="Track pending tasks and assignments"
            color="bg-legal-green"
            linkTo="/tasks"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest case activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-sm">JD</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Document filed for Smith v. Jones</h4>
                    <p className="text-sm text-gray-500">Today at 10:30 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Critical dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border-l-4 border-legal-red pl-3 py-1">
                  <h4 className="font-medium">Filing Deadline: Johnson Case</h4>
                  <p className="text-sm text-gray-500">Due in 2 days</p>
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
