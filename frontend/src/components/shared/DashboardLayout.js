import { Link, useLocation, useNavigate ,Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Hotel, Home, Bed, Calendar, User, Bell, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import NotificationBell from '@/components/shared/NotificationBell';

export default function DashboardLayout({ children, role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
        { path: '/admin/rooms', label: 'Rooms', icon: Bed },
        { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
        { path: '/admin/users', label: 'Staff Management', icon: User },
        { path: '/admin/staff', label: 'Add Staff', icon: User },
      ];
    } else if (role === 'staff') {
      return [
        { path: '/staff/dashboard', label: 'Dashboard', icon: Home },
        { path: '/staff/bookings', label: 'Bookings', icon: Calendar },
        { path: '/staff/rooms', label: 'Room Status', icon: Bed },
      ];
    } 
  };

  const navItems = getNavItems();

  return (
     (role === 'staff' || role === 'admin') && (
    <div className="flex h-screen bg-slate-50 overflow-hidden" data-testid="dashboard-layout">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#C6A87C] rounded-lg flex items-center justify-center">
              <Hotel className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">HM Hotel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <div
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#C6A87C] text-white hover:bg-[#B09265]'
                      : 'hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Logged in as</div>
          <div className="text-sm font-medium text-white truncate">{user?.email}</div>
          <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
              <p className="text-sm text-slate-600 capitalize">{user?.role} Dashboard</p>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell/>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button data-testid="profile-dropdown" variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem data-testid="settings-menu-item">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="logout-menu-item" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
     )
  );
}
