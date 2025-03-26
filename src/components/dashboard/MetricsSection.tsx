
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, LineChart, PieChart, ResponsiveContainer, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Clock, DollarSign, TrendingUp, FileClock, Users, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data - in a real app, this would come from an API
const hourlyData = [
  { month: 'Jan', billable: 78, non_billable: 22 },
  { month: 'Feb', billable: 85, non_billable: 18 },
  { month: 'Mar', billable: 92, non_billable: 15 },
  { month: 'Apr', billable: 88, non_billable: 20 },
  { month: 'May', billable: 95, non_billable: 12 },
  { month: 'Jun', billable: 90, non_billable: 18 },
];

const billingData = [
  { month: 'Jan', billed: 42000, collected: 38000 },
  { month: 'Feb', billed: 48000, collected: 45000 },
  { month: 'Mar', billed: 52000, collected: 49000 },
  { month: 'Apr', billed: 58000, collected: 54000 },
  { month: 'May', billed: 65000, collected: 61000 },
  { month: 'Jun', billed: 72000, collected: 68000 },
];

const practiceAreaData = [
  { name: 'Corporate', value: 35 },
  { name: 'Litigation', value: 25 },
  { name: 'Real Estate', value: 15 },
  { name: 'IP', value: 10 },
  { name: 'Family', value: 15 },
];

const clientDistribution = [
  { name: 'Long-term', value: 65 },
  { name: 'New (< 1 year)', value: 35 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const MetricsSection = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Performance Metrics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Metrics Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-yorpro-600" />
                Hourly Metrics
              </CardTitle>
            </div>
            <CardDescription>Billable vs. non-billable hours</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <div className="h-80">
              <ChartContainer
                config={{
                  billable: { color: "#0274c4" },
                  non_billable: { color: "#d3d3d3" },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="billable" name="Billable Hours" stackId="a" fill="var(--color-billable)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="non_billable" name="Non-billable Hours" stackId="a" fill="var(--color-non_billable)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FileClock className="h-4 w-4 text-yorpro-600" />
                <span>Average Utilization: <span className="font-semibold">88%</span></span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>+12% from last quarter</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Metrics Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Billing Metrics
              </CardTitle>
            </div>
            <CardDescription>Billed vs. collected amounts</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <div className="h-80">
              <ChartContainer
                config={{
                  billed: { color: "#4ade80" },
                  collected: { color: "#22c55e" },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={billingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />} />
                    <Legend />
                    <Line type="monotone" dataKey="billed" name="Billed ($)" stroke="var(--color-billed)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="collected" name="Collected ($)" stroke="var(--color-collected)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Collection Rate: <span className="font-semibold">94%</span></span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>+8% from last quarter</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Analysis Section */}
      <h2 className="text-xl font-semibold text-gray-800 mt-8">Practice Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                Practice Areas
              </CardTitle>
            </div>
            <CardDescription>Revenue distribution by practice area</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <div className="h-80 flex items-center justify-center">
              <div className="w-full md:w-3/4">
                <ChartContainer
                  config={{
                    corporate: { color: "#8884d8" },
                    litigation: { color: "#0088FE" },
                    realestate: { color: "#00C49F" },
                    ip: { color: "#FFBB28" },
                    family: { color: "#FF8042" },
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={practiceAreaData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {practiceAreaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
            <div className="flex justify-center mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span>Corporate practice area growing by 15% YoY</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600" />
                Client Analytics
              </CardTitle>
            </div>
            <CardDescription>Client retention and distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="retention">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="retention">Retention</TabsTrigger>
                <TabsTrigger value="distribution">Revenue</TabsTrigger>
              </TabsList>
              <TabsContent value="retention" className="pt-4">
                <div className="h-64 flex items-center justify-center">
                  <div className="w-full md:w-2/3">
                    <ChartContainer
                      config={{
                        longterm: { color: "#0274c4" },
                        new: { color: "#f59e0b" },
                      }}
                    >
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={clientDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#0274c4" />
                            <Cell fill="#f59e0b" />
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
                <div className="flex justify-center mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Client retention rate improved by 7% this year</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="distribution" className="pt-4">
                <div className="h-64">
                  <ChartContainer
                    config={{
                      revenue: { color: "#f59e0b" },
                    }}
                  >
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={[
                          { name: 'Top 10%', value: 45 },
                          { name: 'Next 20%', value: 25 },
                          { name: 'Next 30%', value: 20 },
                          { name: 'Remaining', value: 10 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" name="Revenue %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="flex justify-center mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                    <span>Top 10% of clients generate 45% of revenue</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsSection;
