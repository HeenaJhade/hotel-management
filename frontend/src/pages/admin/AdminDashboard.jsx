import React, { useState, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import apiClient from '../../utils/api';



export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
const [todayCheckIns, setTodayCheckIns] = useState([]);
const [todayCheckOuts, setTodayCheckOuts] = useState([]);
const [recentBookings, setRecentBookings] = useState([]);
const [loading, setLoading] = useState(true);
  const [revenueTrends, setRevenueTrends] = useState([]);

  useEffect(() => {
  fetchDashboard();
}, []);

const fetchDashboard = async () => {
  try {
    const res = await apiClient.get("/reports/dashboard");
    const data = res.data;
    console.log("data",data);
    setRevenueTrends(data.revenueTrends);
    setStats(data.stats);
    setTodayCheckIns(data.todayCheckIns);
    setTodayCheckOuts(data.todayCheckOuts);
    setRecentBookings(data.recentBookings);

    setLoading(false);
  } catch (error) {
    console.error("Dashboard error:", error);
  }
};
if (loading || !stats) {
  return <div className="p-10 text-center">Loading Dashboard...</div>;
}

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
                  <p className="text-2xl font-bold mt-1">{stats.totalBookings}</p>
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


          </div>
        </div>
      </div>
    </>
  );
}