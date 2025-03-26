
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, LineChart, PieChart, ResponsiveContainer, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';
import { Clock, DollarSign, TrendingUp, FileClock, Users, Briefcase, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Sample data - in a real app, this would come from an API
const hourlyData = [
  { month: 'Jan', billable: 78, non_billable: 22, total: 100 },
  { month: 'Feb', billable: 85, non_billable: 18, total: 103 },
  { month: 'Mar', billable: 92, non_billable: 15, total: 107 },
  { month: 'Apr', billable: 88, non_billable: 20, total: 108 },
  { month: 'May', billable: 95, non_billable: 12, total: 107 },
  { month: 'Jun', billable: 90, non_billable: 18, total: 108 },
];

const billingData = [
  { month: 'Jan', billed: 42000, collected: 38000, outstanding: 4000 },
  { month: 'Feb', billed: 48000, collected: 45000, outstanding: 3000 },
  { month: 'Mar', billed: 52000, collected: 49000, outstanding: 3000 },
  { month: 'Apr', billed: 58000, collected: 54000, outstanding: 4000 },
  { month: 'May', billed: 65000, collected: 61000, outstanding: 4000 },
  { month: 'Jun', billed: 72000, collected: 68000, outstanding: 4000 },
];

const practiceAreaData = [
  { name: 'Corporate', value: 35, fill: '#8884d8' },
  { name: 'Litigation', value: 25, fill: '#0088FE' },
  { name: 'Real Estate', value: 15, fill: '#00C49F' },
  { name: 'IP', value: 10, fill: '#FFBB28' },
  { name: 'Family', value: 15, fill: '#FF8042' },
];

const clientDistribution = [
  { name: 'Long-term', value: 65, fill: '#0274c4' },
  { name: 'New (< 1 year)', value: 35, fill: '#f59e0b' },
];

const timeTrendData = [
  { name: 'Week 1', hours: 38, expected: 40 },
  { name: 'Week 2', hours: 42, expected: 40 },
  { name: 'Week 3', hours: 45, expected: 40 },
  { name: 'Week 4', hours: 39, expected: 40 },
  { name: 'Week 5', hours: 44, expected: 40 },
];

const revenueBreakdown = [
  { name: 'Consultation', value: 25, fill: '#8884d8' },
  { name: 'Document Prep', value: 30, fill: '#83a6ed' },
  { name: 'Representation', value: 35, fill: '#8dd1e1' },
  { name: 'Other', value: 10, fill: '#82ca9d' },
];

const yearlyProgress = [
  { name: 'Target Completion', value: 84 }
];

const ChartTypeSelector = ({ 
  activeChart, 
  setActiveChart, 
  chartTypes 
}: { 
  activeChart: string; 
  setActiveChart: (chart: string) => void; 
  chartTypes: Array<{id: string; icon: React.ElementType; label: string}>
}) => (
  <div className="flex items-center justify-center mb-4 space-x-2">
    {chartTypes.map((type) => {
      const Icon = type.icon;
      return (
        <Button
          key={type.id}
          variant={activeChart === type.id ? "default" : "outline"}
          size="sm"
          className="gap-1"
          onClick={() => setActiveChart(type.id)}
        >
          <Icon className="h-4 w-4" />
          <span>{type.label}</span>
        </Button>
      );
    })}
  </div>
);

const MetricsSection = () => {
  const [hourlyChartType, setHourlyChartType] = useState<string>('bar');
  const [billingChartType, setBillingChartType] = useState<string>('area');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Performance Metrics</h2>
        <div className="text-sm text-gray-500">Showing data for last 6 months</div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Metrics Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-yorpro-600" />
                Hourly Metrics
              </CardTitle>
            </div>
            <CardDescription>Track your billable vs. non-billable hours</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <ChartTypeSelector 
              activeChart={hourlyChartType} 
              setActiveChart={setHourlyChartType} 
              chartTypes={[
                {id: 'bar', icon: BarChart2, label: 'Bar'},
                {id: 'line', icon: LineChartIcon, label: 'Line'},
                {id: 'area', icon: AreaChart, label: 'Area'}
              ]}
            />
            <div className="h-80">
              <ChartContainer
                config={{
                  billable: { color: "#0274c4", label: "Billable Hours" },
                  non_billable: { color: "#d3d3d3", label: "Non-billable Hours" },
                  total: { color: "#82ca9d", label: "Total Hours" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  {hourlyChartType === 'bar' ? (
                    <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <defs>
                        <linearGradient id="billableGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0274c4" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0274c4" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="nonBillableGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d3d3d3" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#d3d3d3" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="billable" name="Billable Hours" stackId="a" fill="url(#billableGradient)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                      <Bar dataKey="non_billable" name="Non-billable Hours" stackId="a" fill="url(#nonBillableGradient)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  ) : hourlyChartType === 'line' ? (
                    <LineChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="billable" name="Billable Hours" stroke="#0274c4" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} animationDuration={1500} />
                      <Line type="monotone" dataKey="non_billable" name="Non-billable Hours" stroke="#d3d3d3" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} animationDuration={1500} />
                      <Line type="monotone" dataKey="total" name="Total Hours" stroke="#82ca9d" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} animationDuration={1500} />
                    </LineChart>
                  ) : (
                    <AreaChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <defs>
                        <linearGradient id="billableGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0274c4" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0274c4" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="nonBillableGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d3d3d3" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#d3d3d3" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Area type="monotone" dataKey="billable" name="Billable Hours" stackId="1" stroke="#0274c4" fill="url(#billableGradient)" animationDuration={1500} />
                      <Area type="monotone" dataKey="non_billable" name="Non-billable Hours" stackId="1" stroke="#d3d3d3" fill="url(#nonBillableGradient)" animationDuration={1500} />
                    </AreaChart>
                  )}
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
        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Billing & Collections
              </CardTitle>
            </div>
            <CardDescription>Track your revenue stream and collections</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <ChartTypeSelector 
              activeChart={billingChartType} 
              setActiveChart={setBillingChartType} 
              chartTypes={[
                {id: 'area', icon: AreaChart, label: 'Area'},
                {id: 'line', icon: LineChartIcon, label: 'Line'},
                {id: 'bar', icon: BarChart2, label: 'Bar'}
              ]}
            />
            <div className="h-80">
              <ChartContainer
                config={{
                  billed: { color: "#22c55e", label: "Billed Amount" },
                  collected: { color: "#15803d", label: "Collected Amount" },
                  outstanding: { color: "#f59e0b", label: "Outstanding Amount" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  {billingChartType === 'area' ? (
                    <AreaChart data={billingData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <defs>
                        <linearGradient id="billedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#15803d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#15803d" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="outstandingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />} />
                      <Legend />
                      <Area type="monotone" dataKey="billed" name="Billed ($)" stroke="#22c55e" fill="url(#billedGradient)" animationDuration={1500} />
                      <Area type="monotone" dataKey="collected" name="Collected ($)" stroke="#15803d" fill="url(#collectedGradient)" animationDuration={1500} />
                      <Area type="monotone" dataKey="outstanding" name="Outstanding ($)" stroke="#f59e0b" fill="url(#outstandingGradient)" animationDuration={1500} />
                    </AreaChart>
                  ) : billingChartType === 'line' ? (
                    <LineChart data={billingData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />} />
                      <Legend />
                      <Line type="monotone" dataKey="billed" name="Billed ($)" stroke="#22c55e" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} animationDuration={1500} />
                      <Line type="monotone" dataKey="collected" name="Collected ($)" stroke="#15803d" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} animationDuration={1500} />
                      <Line type="monotone" dataKey="outstanding" name="Outstanding ($)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} animationDuration={1500} />
                    </LineChart>
                  ) : (
                    <BarChart data={billingData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <defs>
                        <linearGradient id="billedBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="collectedBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#15803d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#15803d" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="outstandingBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />} />
                      <Legend />
                      <Bar dataKey="billed" name="Billed ($)" fill="url(#billedBarGradient)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                      <Bar dataKey="collected" name="Collected ($)" fill="url(#collectedBarGradient)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                      <Bar dataKey="outstanding" name="Outstanding ($)" fill="url(#outstandingBarGradient)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  )}
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Practice Analysis</h2>
        <div className="text-sm text-gray-500">Updated today</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200 overflow-hidden lg:col-span-1">
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
            <div className="h-72 flex items-center justify-center">
              <div className="w-full">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={250}>
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
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {practiceAreaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
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

        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200 overflow-hidden lg:col-span-1">
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
            <Tabs defaultValue="retention" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="retention">Retention</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>
              <TabsContent value="retention" className="pt-4">
                <div className="h-60 flex items-center justify-center">
                  <div className="w-full">
                    <ChartContainer config={{}}>
                      <ResponsiveContainer width="100%" height={220}>
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
                            animationBegin={0}
                            animationDuration={1500}
                          >
                            {clientDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
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
              <TabsContent value="revenue" className="pt-4">
                <div className="h-60">
                  <ChartContainer config={{}}>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={[
                          { name: 'Top 10%', value: 45, fill: '#f59e0b' },
                          { name: 'Next 20%', value: 25, fill: '#0284c7' },
                          { name: 'Next 30%', value: 20, fill: '#6366f1' },
                          { name: 'Remaining', value: 10, fill: '#a855f7' },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar 
                          dataKey="value" 
                          name="Revenue %" 
                          radius={[4, 4, 0, 0]} 
                          animationDuration={1500}
                        >
                          {[
                            { name: 'Top 10%', value: 45, fill: '#f59e0b' },
                            { name: 'Next 20%', value: 25, fill: '#0284c7' },
                            { name: 'Next 30%', value: 20, fill: '#6366f1' },
                            { name: 'Remaining', value: 10, fill: '#a855f7' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
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

        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200 overflow-hidden lg:col-span-1">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Financial Performance
              </CardTitle>
            </div>
            <CardDescription>Financial metrics and goals</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weekly">Weekly Hours</TabsTrigger>
                <TabsTrigger value="revenue">Revenue Types</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly" className="pt-4">
                <div className="h-60">
                  <ChartContainer
                    config={{
                      hours: { color: "#0ea5e9" },
                      expected: { color: "#94a3b8" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={timeTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="hours" 
                          name="Actual Hours" 
                          stroke="#0ea5e9" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                          animationDuration={1500}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expected" 
                          name="Expected Hours" 
                          stroke="#94a3b8" 
                          strokeDasharray="5 5"
                          strokeWidth={2} 
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="flex justify-center mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>Consistently exceeding weekly targets by 8%</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="revenue" className="pt-4">
                <div className="h-60 flex items-center justify-center">
                  <div className="w-full md:w-3/4">
                    <ChartContainer config={{}}>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={revenueBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1500}
                          >
                            {revenueBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
                <div className="flex justify-center mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span>Representation services provide highest margins</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Goals Progress */}
      <div className="mt-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Annual Performance
              </CardTitle>
            </div>
            <CardDescription>Progress toward yearly revenue goals</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-medium text-gray-700 mb-2">Revenue Goal Progress (2023)</h4>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full" 
                      style={{ width: "76%" }}
                    ></div>
                  </div>
                  <span className="ml-4 font-semibold text-gray-800">76%</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Current: $912,000</span>
                  <span>Goal: $1,200,000</span>
                </div>
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Client Acquisition</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-amber-400 h-4 rounded-full" 
                        style={{ width: "84%" }}
                      ></div>
                    </div>
                    <span className="ml-4 font-semibold text-gray-800">84%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Current: 42 new clients</span>
                    <span>Goal: 50 new clients</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width={180} height={180}>
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="100%" 
                      barSize={10} 
                      data={yearlyProgress}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        minAngle={15}
                        background
                        clockWise
                        dataKey="value"
                        cornerRadius={10}
                        fill="#6366f1"
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-2xl font-bold"
                        fill="#6366f1"
                      >
                        84%
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              <div className="bg-indigo-50 rounded-lg px-4 py-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Billable Hours YTD</div>
                  <div className="text-lg font-semibold text-indigo-700">1,842 hrs</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Avg. Hourly Rate</div>
                  <div className="text-lg font-semibold text-green-700">$275</div>
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg px-4 py-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Client Retention</div>
                  <div className="text-lg font-semibold text-amber-700">92%</div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg px-4 py-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Matters Closed</div>
                  <div className="text-lg font-semibold text-purple-700">38</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsSection;
