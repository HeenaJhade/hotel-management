import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SocketProvider } from "./contexts/SocketContext";
import { Toaster } from "./components/ui/sonner";
import DashboardLayout from './components/shared/DashboardLayout';

import { Login } from "./components/pages/auth/Login";
import { Signup } from "./components/pages/auth/Signup";
import { OTPVerification } from "./components/pages/auth/OTPVerification";
import ForgotPassword from "./components/pages/auth/ForgotPassword";
import ResetPassword from "./components/pages/auth/ResetPassword";

import LandingPage from "./components/pages/guest/LandingPage";
import { GuestLayout } from "./components/pages/guest/GuestLayout";
import { Home } from "./components/pages/guest/Home";
import UserRooms from "./components/pages/guest/UserRooms";
import UserBookings from "./components/pages/guest/UserBookings";
import Notifications from "./components/shared/Notifications";
import BookingFlowWrapper from "./components/pages/guest/bookingFlow";

import AdminDashboard from "./components/pages/admin/AdminDashboard";
import AdminRooms from "./components/pages/admin/AdminRooms";
import AdminBookings from "./components/pages/admin/AdminBookings";
import AdminUsers from "./components/pages/admin/AdminUsers";
import AdminStaff from "./components/pages/admin/AdminStaff";

import StaffDashboard from "./components/pages/staff/StaffDashboard";
import StaffRoomStatus from "./components/pages/staff/StaffRoomStatus";
import StaffBookings from "./components/pages/staff/StaffBookings";
import StaffGuestManagement from "./components/pages/staff/StaffGuestManagement";


import "./index.css";


// ────────────────────────────────────────────────
// Protected Route
// ────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  console.log("ProtectedRoute check →", {
  currentRole: user?.role,
  allowedRoles,
});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "staff") return <Navigate to="/staff/dashboard" replace />;
  if (user.role === "user") return <Navigate to="/user/home" replace />;
  return <Navigate to="/" replace />;
}

  return children;
};

// ────────────────────────────────────────────────
// Public Route
// ────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

   if (loading) return null;

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "staff") return <Navigate to="/staff/dashboard" replace />;
    if (user.role === "user") return <Navigate to="/user/home" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/verify-otp" element={<PublicRoute><OTPVerification /></PublicRoute>} />


      {/* User Routes */}
      <Route
  path="/user"
  element={
    <ProtectedRoute allowedRoles={["user"]}>
      <GuestLayout />
    </ProtectedRoute>
  }
>
  <Route path="home" element={<Home />} />
  <Route path="rooms" element={<UserRooms />} />
  <Route path="booking-flow/:roomId" element={<BookingFlowWrapper />} />
  <Route path="my-bookings" element={<UserBookings />} />
  <Route path="notifications" element={<Notifications />} />
</Route>

      {/* Admin Routes */}
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout role="admin" />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="rooms" element={<AdminRooms />} />
  <Route path="bookings" element={<AdminBookings />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="staff" element={<AdminStaff />} />
  <Route path="notifications" element={<Notifications />} />
</Route>


<Route
  path="/staff"
  element={
    <ProtectedRoute allowedRoles={["staff"]}>
      <DashboardLayout role="staff" />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<StaffDashboard />} />
  <Route path="rooms" element={<StaffRoomStatus />} />
  <Route path="bookings" element={<StaffBookings />} />
  <Route path="guest-management" element={<StaffGuestManagement />} />
  <Route path="notifications" element={<Notifications />} />
</Route>



      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;