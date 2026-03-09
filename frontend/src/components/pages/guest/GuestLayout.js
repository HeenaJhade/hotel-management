import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { Button } from '../../ui/button';
import NotificationBell from '@/components/shared/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  User,
  Settings,
  LogOut,
  Home,
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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-effect border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link
              to="/user/home"
              className="font-playfair text-2xl font-bold text-primary"
            >
              HM
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">

              <Link to="/user/home" className="flex items-center space-x-2 hover:text-accent transition-colors">
                <Home size={18} />
                <span>Home</span>
              </Link>

              <Link to="/user/rooms" className="flex items-center space-x-2 hover:text-accent transition-colors">
                <Bed size={18} />
                <span>Rooms</span>
              </Link>

              <Link to="/user/my-bookings" className="flex items-center space-x-2 hover:text-accent transition-colors">
                <Calendar size={18} />
                <span>My Bookings</span>
              </Link>

              {/* Added About & Contact */}
              <Link
                to="/user/home#about"
                className="hover:text-accent transition-colors"
              >
                About
              </Link>

              <Link
                to="/user/home#contact"
                className="hover:text-accent transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">

              {/* Notifications */}
              <NotificationBell />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User size={20} />
                    <span className="hidden md:inline">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Hamburger */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden mt-4 flex flex-col space-y-4 border-t pt-4">

              <Link
                to="/user/home"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2"
              >
                <Home size={18} />
                <span>Home</span>
              </Link>

              <Link
                to="/user/rooms"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2"
              >
                <Bed size={18} />
                <span>Rooms</span>
              </Link>

              <Link
                to="/user/my-bookings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2"
              >
                <Calendar size={18} />
                <span>My Bookings</span>
              </Link>

              {/* Added About & Contact */}
              <Link
                to="/user/home#about"
                onClick={() => setMobileOpen(false)}
              >
                About
              </Link>

              <Link
                to="/user/home#contact"
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </Link>

            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="px-4 md:px-6">
        <Outlet />
      </main>

    </div>
  );
};