import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';

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

const mockTasks = [
  { id: 1, title: 'Set Up Conference Room B for 10 AM Meeting', completed: false },
  { id: 2, title: 'Restock Housekeeping Supplies on 3rd Floor', completed: false },
  { id: 3, title: 'Inspect and Clean the Pool Area', completed: true },
];

export default function AdminDashboard() {
  const [stats] = useState(mockStats);
  const [revenueTrends] = useState(mockRevenueData);
  const [bookingTrends] = useState(mockBookingTrends);

  const total = stats.occupied + stats.reserved + stats.available + stats.notReady;

  return (
    <>
      <div className="p-1 space-y-8 bg-slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

          {/* Left - Wider column */}
          <div className="lg:col-span-5 space-y-8">

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

              {/* New Bookings */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3">
                  <p className="text-sm text-slate-600">New Bookings</p>
                  <p className="text-2xl font-bold mt-1">{stats.newBookings}</p>
                  <div className={`flex items-center gap-1 mt-7 text-sm font-medium ${stats.newBookingsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.newBookingsChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stats.newBookingsChange}%
                    <p className="text-xs text-slate-500 mt-1">from last week</p>
                  </div>
                </div>
              </div>

              {/* Check-Ins */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3">
                  <p className="text-sm text-slate-600">Check-Ins</p>
                  <p className="text-2xl font-bold mt-1">{stats.checkIns}</p>
                  <div className={`flex items-center mt-7 gap-1 text-sm font-medium ${stats.checkInsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.checkInsChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stats.checkInsChange}%
                    <p className="text-xs text-slate-500 mt-1">from last week</p>
                  </div>
                </div>
              </div>

              {/* Check-Outs */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3">
                  <p className="text-sm text-slate-600">Check-Outs</p>
                  <p className="text-2xl font-bold mt-1">{stats.checkOuts}</p>
                  <div className={`flex items-center mt-7 gap-1 text-sm font-medium ${stats.checkOutsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.checkOutsChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stats.checkOutsChange}%
                    <p className="text-xs text-slate-500 mt-1">from last week</p>
                  </div>
                </div>
              </div>

              {/* Occupancy Rate */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3">
                  <p className="text-sm text-slate-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold mt-1">{stats.occupancyRate}%</p>
                  <div className={`flex items-center mt-7 gap-1 text-sm font-medium ${stats.occupancyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.occupancyChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stats.occupancyChange}%
                    <p className="text-xs text-slate-500 mt-1">from last week</p>
                  </div>
                  <div className="h-2 mt-4 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.occupancyRate}%` }} />
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3">
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 mt-7 text-sm font-medium ${stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.revenueChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stats.revenueChange}%
                    <p className="text-xs text-slate-500 mt-1">from last week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Area */}
            <div className="space-y-8">

              {/* Row 1: Room Availability + Revenue Trend */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Room Availability */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm">
                  <div className="p-6 pb-2">
                    <h3 className="text-lg font-semibold">Room Availability</h3>
                  </div>
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Occupied</span>
                        <span className="font-medium">{stats.occupied}</span>
                      </div>
                      <div className="h-2 bg-red-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.occupied / total) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Reserved</span>
                        <span className="font-medium">{stats.reserved}</span>
                      </div>
                      <div className="h-2 bg-yellow-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(stats.reserved / total) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Available</span>
                        <span className="font-medium">{stats.available}</span>
                      </div>
                      <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.available / total) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Not Ready</span>
                        <span className="font-medium">{stats.notReady}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-500 rounded-full" style={{ width: `${(stats.notReady / total) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Trend */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold">Revenue Trend</h3>
                    <select className="text-sm border rounded px-3 py-1 bg-white">
                      <option>Last 6 Months</option>
                      <option>Last 12 Months</option>
                    </select>
                  </div>
                  <div className="px-6 pb-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 2: Booking Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm">
                  <div className="p-6 pb-2 flex flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold">Booking Trends</h3>
                    <select className="text-sm border rounded px-3 py-1 bg-white">
                      <option>Last 6 Months</option>
                      <option>Last 12 Months</option>
                    </select>
                  </div>
                  <div className="px-6 pb-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mockBookingTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Narrower column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overall Rating */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold">Overall Rating</h3>
              </div>
              <div className="px-6 pb-6 space-y-6">
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
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${value * 20}%` }} />
                        </div>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 pb-2 flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                  <span>+</span> Add Task
                </button>
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {mockTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <input type="checkbox" checked={task.completed} readOnly className="mt-1" />
                      <div className="flex-1">
                        <p className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.title}
                        </p>
                      </div>
                      <button className="h-8 w-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}