import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

export default function NotificationBell(){

  const { user } = useAuth();
  const { unreadCount, fetchNotifications, notifications } = useNotifications();
  const socket = useSocket();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  console.log("user", user.role);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time new notification
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      toast.info(newNotif.message || 'New notification', { duration: 5000 });
      fetchNotifications();
    };

    socket.on('newNotification', handleNewNotification);

    return () => socket.off('newNotification', handleNewNotification);
  }, [socket, fetchNotifications]);

  // Get latest unread notifications for preview (max 5)
  const previewNotifications = notifications
    .filter(n => !n.isRead)
    .slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell Button */}
      <button
        className="relative p-2 rounded-full hover:bg-primary/10 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-text-primary" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center
          rounded-full bg-primary text-[10px] font-semibold text-white shadow-md">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Animated Glass Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96
        rounded-2xl border border-white/40
        bg-white/70 backdrop-blur-xl
        shadow-2xl z-50 overflow-hidden
        animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="px-5 py-4 border-b border-white/40
          flex justify-between items-center
          bg-linear-to-r from-primary/10 via-transparent to-primary/5">

            <div>
              <h4 className="font-semibold text-text-primary text-sm">
                Notifications
              </h4>
              <p className="text-xs text-text-muted">
                {unreadCount} unread
              </p>
            </div>

            <button
              className="text-xs text-primary hover:bg-primary/10 rounded-full px-3 py-1.5 transition-colors"
              onClick={() => {
                setIsOpen(false);
                navigate(`/${user.role}/notifications`);
              }}
            >
              View All
            </button>
          </div>

          {/* Scroll Area */}
          <div className="max-h-96 overflow-y-auto">

            {previewNotifications.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                You're all caught up 🎉
              </div>
            ) : (
              <div className="divide-y divide-white/40">
                {previewNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="group px-5 py-4 hover:bg-primary/5
                    transition-all duration-200 cursor-pointer relative"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/${user.role}/notifications`);
                    }}
                  >
                    {/* Unread indicator dot */}
                    <span className="absolute left-2 top-6 h-2 w-2 rounded-full bg-primary"></span>

                    <div className="ml-3">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {notif.type}
                      </p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-text-muted mt-2">
                        {new Date(notif.createdAt).toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {previewNotifications.length > 0 && (
            <div className="px-5 py-3 border-t border-white/40 bg-white/50 text-center">
              <button
                className="text-xs text-primary hover:bg-primary/10 rounded-full px-3 py-1.5 transition-colors"
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/${user.role}/notifications`);
                }}
              >
                Go to Notifications Page →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

