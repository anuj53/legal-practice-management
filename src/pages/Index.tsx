
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, CheckSquare, BarChart, Clock, ChevronRight, Bell, Briefcase, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import MetricsSection from '@/components/dashboard/MetricsSection';

const DashboardCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  linkTo,
  glassEffect = false
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  color: string;
  linkTo: string;
  glassEffect?: boolean;
}) => (
  <Card className={`hover:shadow-xl transition-all duration-300 hover:scale-[1.02] 
    border-t-4 rounded-xl overflow-hidden animate-fade-in
    ${glassEffect ? 'bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg' : ''}
  `}>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <CardDescription className="text-gray-600">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Link to={linkTo}>
        <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent hover:text-yorpro-600 group transition-colors">
          Open {title} <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </Link>
    </CardContent>
  </Card>
);

const ActivityItem = ({ 
  avatar, 
  name, 
  action, 
  time, 
  matter 
}: { 
  avatar: string; 
  name: string; 
  action: string; 
  time: string; 
  matter: string;
}) => (
  <div className="flex gap-4 items-start p-4 hover:bg-gray-50 transition-colors rounded-lg border-b border-gray-100 last:border-b-0">
    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
      <span className="font-medium text-sm text-gray-700">{avatar}</span>
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-800">
        <span className="text-yorpro-700">{name}</span> {action}
      </h4>
      <p className="text-sm text-gray-500">{time} • <span className="text-yorpro-600 hover:underline cursor-pointer">{matter}</span></p>
    </div>
  </div>
);

const Statistic = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <div className={`mt-1 text-xs font-medium ${
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend.value} {trend.direction !== 'neutral' && (trend.direction === 'up' ? '↑' : '↓')}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color || 'bg-yorpro-100'}`}>
        <Icon className="h-5 w-5 text-yorpro-700" />
      </div>
    </div>
  </div>
);

const TaskCard = ({ title, dueDate, priority, progress }: { title: string; dueDate: string; priority: 'High' | 'Medium' | 'Low'; progress: number }) => (
  <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <div className="flex justify-between mb-2">
      <h4 className="font-medium">{title}</h4>
      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
        priority === 'High' ? 'bg-red-100 text-red-800' : 
        priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 
        'bg-green-100 text-green-800'
      }`}>
        {priority}
      </div>
    </div>
    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
      <span>Due: {dueDate}</span>
      <span>{progress}% complete</span>
    </div>
    <Progress value={progress} className="h-1.5" />
  </div>
);

const Index = () => {
  return (
    <div className="container py-8 mx-auto">
      <div className="mb-8 px-4 md:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Legal Practice Management</h1>
        <p className="text-gray-600 text-lg">
          Legal management system for efficient case handling and client management
        </p>
        <div className="h-1 w-24 bg-gradient-to-r from-yorpro-500 to-yorpro-700 rounded-full mt-3"></div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 px-4 md:px-0">
        <Statistic 
          title="Active Matters" 
          value="42" 
          icon={Briefcase} 
          trend={{ value: "+12% this month", direction: "up" }}
          color="bg-blue-50"
        />
        <Statistic 
          title="Billable Hours (MTD)" 
          value="128.5" 
          icon={Clock} 
          trend={{ value: "85% of goal", direction: "neutral" }}
          color="bg-green-50"
        />
        <Statistic 
          title="Pending Tasks" 
          value="18" 
          icon={CheckSquare} 
          trend={{ value: "-5% this week", direction: "down" }}
          color="bg-orange-50"
        />
        <Statistic 
          title="Active Clients" 
          value="67" 
          icon={Users2} 
          trend={{ value: "Same as last month", direction: "neutral" }}
          color="bg-purple-50"
        />
      </div>

      {/* Enhanced Metrics Section */}
      <div className="mb-8 px-4 md:px-0">
        <MetricsSection />
      </div>

      <section className="mb-8 px-4 md:px-0">
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
            glassEffect={true}
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

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-0">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow border border-gray-200 rounded-xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="flex items-center text-lg">
              <BarChart className="h-5 w-5 mr-2 text-yorpro-600" />
              Recent Activities
            </CardTitle>
            <CardDescription>Your latest case activities and updates</CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-gray-100">
              <ActivityItem 
                avatar="JD" 
                name="John Doe" 
                action="uploaded a new document" 
                time="Today at 10:30 AM" 
                matter="Smith v. Jones" 
              />
              <ActivityItem 
                avatar="SL" 
                name="Sarah Lee" 
                action="scheduled a client meeting" 
                time="Yesterday at 4:15 PM" 
                matter="Williams Estate" 
              />
              <ActivityItem 
                avatar="RB" 
                name="Robert Brown" 
                action="filed a motion" 
                time="July 15 at 9:45 AM" 
                matter="Johnson v. City" 
              />
              <ActivityItem 
                avatar="MP" 
                name="Maria Perez" 
                action="updated case notes" 
                time="July 14 at 2:30 PM" 
                matter="Taylor Bankruptcy" 
              />
              <ActivityItem 
                avatar="AL" 
                name="Adam Lee" 
                action="added billable hours" 
                time="July 14 at 11:20 AM" 
                matter="Corporate Merger" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="hover:shadow-md transition-shadow border border-gray-200 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
              <CardTitle className="flex items-center text-lg">
                <Bell className="h-5 w-5 mr-2 text-legal-red" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Critical dates to remember</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="border-l-4 border-legal-red pl-3 py-1">
                    <h4 className="font-medium text-gray-800">Filing Deadline: Johnson Case</h4>
                    <p className="text-sm text-gray-500">Due in 2 days</p>
                  </div>
                </div>
                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="border-l-4 border-orange-500 pl-3 py-1">
                    <h4 className="font-medium text-gray-800">Court Appearance: Smith v. Jones</h4>
                    <p className="text-sm text-gray-500">Due in 5 days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border border-gray-200 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <CardTitle className="flex items-center text-lg">
                <CheckSquare className="h-5 w-5 mr-2 text-yorpro-600" />
                Priority Tasks
              </CardTitle>
              <CardDescription>Tasks needing your attention</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div>
                <TaskCard 
                  title="Review Smith Contract" 
                  dueDate="Tomorrow" 
                  priority="High" 
                  progress={25} 
                />
                <TaskCard 
                  title="Prepare Johnson Discovery" 
                  dueDate="July 22" 
                  priority="Medium" 
                  progress={60} 
                />
                <TaskCard 
                  title="Update Case Timeline" 
                  dueDate="July 25" 
                  priority="Low" 
                  progress={10} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
