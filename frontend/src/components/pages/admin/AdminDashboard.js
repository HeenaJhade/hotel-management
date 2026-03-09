import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Calendar, DollarSign, Bed, 
  Search, CheckCircle2, Clock, MoreHorizontal 
} from 'lucide-react';

// ────────────────────────────────────────────────
// Mock Data (replace with real API data later)
// ────────────────────────────────────────────────
const mockStats = {
  newBookings: 840,
  newBookingsChange: 8.70,
  checkIns: 231,
  checkInsChange: 3.56,
  checkOuts: 124,
  checkOutsChange: -1.06,
  totalRevenue: 315060,
  revenueChange: 5.70,
  occupancyRate: 78,
  occupancyChange: 4.2,
  occupied: 286,
  reserved: 87,
  available: 32,
  notReady: 13,
  overallRating: 4.6,
  ratingCounts: { facilities: 4.4, cleanliness: 4.7, services: 4.6, comfort: 4.8, location: 4.5 },
};

const mockRevenueData = [
  { month: 'Dec', revenue: 200000 },
  { month: 'Jan', revenue: 250000 },
  { month: 'Feb', revenue: 300000 },
  { month: 'Mar', revenue: 280000 },
  { month: 'Apr', revenue: 320000 },
  { month: 'May', revenue: 315060 },
];

const mockBookingTrends = [
  { month: 'Dec', bookings: 620 },
  { month: 'Jan', bookings: 780 },
  { month: 'Feb', bookings: 920 },
  { month: 'Mar', bookings: 850 },
  { month: 'Apr', bookings: 980 },
  { month: 'May', bookings: 840 },
];

const mockBookingPlatforms = [
  { name: 'Direct Booking', value: 61 },
  { name: 'Booking.com', value: 12 },
  { name: 'Others', value: 27 },
];

const mockTasks = [
  { id: 1, title: 'Set Up Conference Room B for 10 AM Meeting', completed: false },
  { id: 2, title: 'Restock Housekeeping Supplies on 3rd Floor', completed: false },
  { id: 3, title: 'Inspect and Clean the Pool Area', completed: true },
];

const COLORS = ['#0ea5e9', '#f59e0b', '#64748b'];

export default function AdminDashboard() {
  const [stats] = useState(mockStats);
  const [revenueTrends] = useState(mockRevenueData);
  const [bookingTrends] = useState(mockBookingTrends);

  return (
    <>
        {/* Main Content */}
        <div className="p-1 space-y-8 bg-slate-50">
          {/* Main Layout: Left wide (charts + stats), Right narrow (rating + tasks) */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Left - Wider column (3/4 width) */}
            <div className="lg:col-span-5 space-y-8">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3 ">                  
                      <div>
                        <p className="text-sm text-slate-600">New Bookings</p>
                        <p className="text-2xl font-bold mt-1">{stats.newBookings}</p>                       
                    </div>
                    <div className={`flex items-center gap-1 mt-7 text-sm font-medium ${stats.newBookingsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.newBookingsChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {stats.newBookingsChange}%
                        <p className="text-xs text-slate-500 mt-1">from last week</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                      <div>
                        <p className="text-sm text-slate-600">Check-Ins</p>
                        <p className="text-2xl font-bold mt-1">{stats.checkIns}</p>
                      </div>
                      <div className={`flex items-center mt-7 gap-1 text-sm font-medium ${stats.checkInsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.checkInsChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {stats.checkInsChange}%
                        <p className="text-xs text-slate-500 mt-1">from last week</p>
                      </div>
                    
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                      <div>
                        <p className="text-sm text-slate-600">Check-Outs</p>
                        <p className="text-2xl font-bold mt-1">{stats.checkOuts}</p>
                      </div>
                      <div className={`flex items-center mt-7 gap-1 text-sm font-medium ${stats.checkOutsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.checkOutsChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {stats.checkOutsChange}%
                        <p className="text-xs text-slate-500 mt-1">from last week</p>
                      </div> 
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow ">
                  <CardContent className="p-3">
                      <div>
                        <p className="text-sm text-slate-600">Occupancy Rate</p>
                        <p className="text-2xl font-bold mt-1">{stats.occupancyRate}%</p>
                      </div>
                      <div className={`flex items-center mt-7 gap-1 text-sm font-medium ${stats.occupancyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.occupancyChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {stats.occupancyChange}%
                        <p className="text-xs text-slate-500 mt-1">from last week</p>
                      </div>
                    <Progress value={stats.occupancyRate} className="h-2 mt-4" />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                      <div>
                        <p className="text-sm text-slate-600">Total Revenue</p>
                        <p className="text-2xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-7 text-sm font-medium ${stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.revenueChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {stats.revenueChange}%
                        <p className="text-xs text-slate-500 mt-1">from last week</p>
                      </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Area */}
              <div className="space-y-8">
                {/* Row 1: Room Availability + Revenue Trend */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Room Availability */}
                  <Card className="lg:col-span-1 space-y-6 border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Room Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Occupied</span>
                          <span className="font-medium">{stats.occupied}</span>
                        </div>
                        <Progress value={(stats.occupied / (stats.occupied + stats.reserved + stats.available + stats.notReady)) * 100} className="h-2 bg-red-100" indicatorColor="bg-red-500" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Reserved</span>
                          <span className="font-medium">{stats.reserved}</span>
                        </div>
                        <Progress value={(stats.reserved / (stats.occupied + stats.reserved + stats.available + stats.notReady)) * 100} className="h-2 bg-yellow-100" indicatorColor="bg-yellow-500" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Available</span>
                          <span className="font-medium">{stats.available}</span>
                        </div>
                        <Progress value={(stats.available / (stats.occupied + stats.reserved + stats.available + stats.notReady)) * 100} className="h-2 bg-green-100" indicatorColor="bg-green-500" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Not Ready</span>
                          <span className="font-medium">{stats.notReady}</span>
                        </div>
                        <Progress value={(stats.notReady / (stats.occupied + stats.reserved + stats.available + stats.notReady)) * 100} className="h-2 bg-gray-200" indicatorColor="bg-gray-500" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Trend */}
                  <Card className=" lg:col-span-2 space-y-6 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Revenue Trend</CardTitle>
                      <select className="text-sm border rounded px-3 py-1 bg-white">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                      </select>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 2: Booking Platforms Pie + Booking Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Booking Trends */}
                  <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Booking Trends</CardTitle>
                      <select className="text-sm border rounded px-3 py-1 bg-white">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                      </select>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mockBookingTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  {/* Booking Platforms - Pie Chart */}
                  
                </div>
              </div>
            </div>

            {/* Right side - Narrower column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Rating */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Overall Rating</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-slate-900">{stats.overallRating}</div>
                    <div className="text-sm text-slate-500 mt-1">/5</div>
                    <div className="text-lg font-semibold mt-2">Impressive</div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(stats.ratingCounts).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={value * 20} className="w-32 h-2" />
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tasks */}
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tasks</CardTitle>
                  <Button size="sm" variant="outline" className="gap-1">
                    <span className="text-xs">+</span> Add Task
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <input type="checkbox" checked={task.completed} readOnly className="mt-1" />
                        <div className="flex-1">
                          <p className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {task.title}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </>

  );
}