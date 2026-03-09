import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Bed,
  Search,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  IndianRupee,
  Calendar,
  CheckCircle,
  XCircle,
  Hotel,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../../utils/api';
import '@/App.css';
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

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats);
  const [todayCheckIns, setTodayCheckIns] = useState([]);
  const [todayCheckOuts, setTodayCheckOuts] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [checkInSearch, setCheckInSearch] = useState('');
  const [checkOutSearch, setCheckOutSearch] = useState('');
  const [revenueTrends] = useState(mockRevenueData);
  const [bookingTrends] = useState(mockBookingTrends);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredCheckIns = todayCheckIns.filter(
    (booking) =>
      booking.roomNumber?.toLowerCase().includes(checkInSearch.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(checkInSearch.toLowerCase())
  );

  const filteredCheckOuts = todayCheckOuts.filter(
    (booking) =>
      booking.roomNumber?.toLowerCase().includes(checkOutSearch.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(checkOutSearch.toLowerCase())
  );


useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/bookings/stats');
      console.log('Dashboard API response:', response.data); // ← for debugging


      setTodayCheckIns(response.data.todayCheckIns || []);
      setTodayCheckOuts(response.data.todayCheckOuts || []);
      setRecentBookings(response.data.recentBookings || []);

      setLoading(false);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard');
      setLoading(false);
    }
  };
  const handleCheckIn = async (bookingId, roomId) => {
    if (!window.confirm('Mark this guest as checked-in?')) return;

    try {
      await apiClient.patch(`/bookings/${bookingId}/check-in`);
      setTodayCheckIns((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: 'checked_in' } : b
        )
      );
      toast.success('Guest checked in successfully');
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in guest');
    }
  };

  const handleCheckOut = async (bookingId, roomId) => {
    if (!window.confirm('Mark this guest as checked-out?')) return;

    try {
      await apiClient.patch(`/bookings/${bookingId}/check-out`);
      setTodayCheckOuts((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: 'checked_out' } : b
        )
      );
      toast.success('Guest checked out successfully');
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out guest');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '—';

  const getStatusColor = (status) => {
    const map = {
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      checked_in: 'bg-green-100 text-green-800 border-green-200',
      checked_out: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status) => {
    const map = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      refunded: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (

        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#C6A87C]" />
            <p className="text-lg text-slate-600 font-medium">Loading dashboard...</p>
          </div>
        </div>

    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg text-center">
            <p className="text-xl font-semibold text-red-700 mb-3">Something went wrong</p>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
    );
  }

  return (
    <>
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
                      {/* Overall Rating */}
<Card className="border-none shadow-sm">
  <CardHeader>
    <CardTitle>Overall Rating</CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="text-center">
      <div className="text-5xl font-bold text-slate-900">
        {stats?.overallRating ?? '—'}
      </div>
      <div className="text-sm text-slate-500 mt-1">/5</div>
      <div className="text-lg font-semibold mt-2">
        {stats?.overallRating >= 4 ? 'Impressive' : 'Good'}
      </div>
    </div>

    {stats?.ratingCounts && Object.keys(stats.ratingCounts).length > 0 ? (
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
    ) : (
      <div className="text-center py-6 text-slate-500 text-sm">
        No rating data available yet
      </div>
    )}
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

        {/* Today's Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-Ins */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Today's Check-Ins ({filteredCheckIns.length})
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  Arrivals
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by room or booking ID..."
                  value={checkInSearch}
                  onChange={(e) => setCheckInSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {filteredCheckIns.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl">
                    No check-ins scheduled today
                  </div>
                ) : (
                  filteredCheckIns.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-sm hover:shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-slate-900">{booking.userName || 'Guest'}</p>
                          <span className="text-xs text-slate-500 font-mono">#{booking.bookingId}</span>
                        </div>
                        <p className="text-sm text-slate-600">Room {booking.roomNumber || '—'}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                          {booking.status || 'Confirmed'}
                        </span>

                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm"
                            onClick={() => handleCheckIn(booking.bookingId, booking.roomId)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Check-In
                          </Button>
                        )}

                        {booking.status === 'checked_in' && (
                          <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Checked In
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Check-Outs */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Today's Check-Outs ({filteredCheckOuts.length})
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                  Departures
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by room or booking ID..."
                  value={checkOutSearch}
                  onChange={(e) => setCheckOutSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {filteredCheckOuts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl">
                    No check-outs scheduled today
                  </div>
                ) : (
                  filteredCheckOuts.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-sm hover:shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-slate-900">{booking.userName || 'Guest'}</p>
                          <span className="text-xs text-slate-500 font-mono">#{booking.bookingId}</span>
                        </div>
                        <p className="text-sm text-slate-600">Room {booking.roomNumber || '—'}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                          {booking.status || 'Checked-In'}
                        </span>

                        {booking.status === 'checked_in' && (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-sm"
                            onClick={() => handleCheckOut(booking.bookingId, booking.roomId)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Check-Out
                          </Button>
                        )}

                        {booking.status === 'checked_out' && (
                          <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Checked Out
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#C6A87C]" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Booking ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Guest</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Room</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check In</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                        No recent bookings found
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">#{booking.bookingId || '—'}</td>
                        <td className="px-6 py-4 text-slate-700">{booking.userName || '—'}</td>
                        <td className="px-6 py-4 text-slate-700">{booking.roomNumber || '—'}</td>
                        <td className="px-6 py-4 text-slate-600">{formatDate(booking.checkIn)}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(booking.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}
                          >
                            {booking.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      
</>
  );
}