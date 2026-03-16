import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationBell from '../../components/shared/NotificationBell';
import {
  User,
  Settings,
  LogOut,
  Home,
  Hotel,
  Bed,
  Calendar,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export const GuestLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-2" data-testid="logo">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Hotel className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">HM Hotel</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">

              <Link to="/user/home" className="flex items-center space-x-2 text-gray-700 hover:text-[#C6A87C] transition-colors">
                <Home size={18} />
                <span>Home</span>
              </Link>

              <Link to="/user/rooms" className="flex items-center space-x-2 text-gray-700 hover:text-[#C6A87C] transition-colors">
                <Bed size={18} />
                <span>Rooms</span>
              </Link>

              <Link to="/user/my-bookings" className="flex items-center space-x-2 text-gray-700 hover:text-[#C6A87C] transition-colors">
                <Calendar size={18} />
                <span>My Bookings</span>
              </Link>

              <Link
                to="/user/home#about"
                className="text-gray-700 hover:text-[#C6A87C] transition-colors"
              >
                About
              </Link>

              <Link
                to="/user/home#contact"
                className="text-gray-700 hover:text-[#C6A87C] transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-5">

              {/* Notifications */}
              <NotificationBell />

              {/* Profile Dropdown (using native click + state) */}
              <div className="relative">
                <button
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <User size={20} className="text-gray-700" />
                  <span className="hidden md:inline font-medium text-gray-800">
                    {user?.name || 'Account'}
                  </span>
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden mt-5 flex flex-col space-y-5 border-t pt-5 pb-4">
              <Link
                to="/user/home"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-[#C6A87C] px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home size={20} />
                <span className="font-medium">Home</span>
              </Link>

              <Link
                to="/user/rooms"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-[#C6A87C] px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Bed size={20} />
                <span className="font-medium">Rooms</span>
              </Link>

              <Link
                to="/user/my-bookings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 text-gray-700 hover:text-[#C6A87C] px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar size={20} />
                <span className="font-medium">My Bookings</span>
              </Link>

              <Link
                to="/user/home#about"
                onClick={() => setMobileOpen(false)}
                className="text-gray-700 hover:text-[#C6A87C] px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                About
              </Link>

              <Link
                to="/user/home#contact"
                onClick={() => setMobileOpen(false)}
                className="text-gray-700 hover:text-[#C6A87C] px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main >
        <Outlet />
      </main>

    </div>
  );
};