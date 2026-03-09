import React, { useEffect,useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

const Notifications = () => {
  const { user } = useAuth();
  const { notifications,fetchNotifications, markAsRead,handleDelete } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      await fetchNotifications();
      setLoading(false);
    };
    load();
    // Optional: auto-refresh every 30s (if socket fails)
    //const interval = setInterval(fetchNotifications, 30000);
    //return () => clearInterval(interval);
  }, [user, fetchNotifications]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-slate-50 px-6 lg:px-16 py-10 space-y-10">

    {/* ================= HEADER ================= */}
   {/* ================= GLASS HEADER ================= */}
<div className="relative overflow-hidden rounded-3xl border border-white/40 
backdrop-blur-xl bg-white/60 shadow-lg px-10 py-8 flex justify-between items-center">

  {/* Soft Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 pointer-events-none" />

  <div className="relative z-10">
    <h1 className="text-4xl font-semibold tracking-tight text-text-primary">
      Notifications
    </h1>
    <p className="text-text-muted mt-2">
      Stay updated with your booking activity.
    </p>
    <div className="w-16 h-1 bg-primary mt-4 rounded-full" />
  </div>

  <div className="relative z-10 text-right">
    <p className="text-4xl font-bold text-primary">
      {notifications.length}
    </p>
    <p className="text-sm text-text-muted">Total</p>
  </div>
</div>


    {/* ================= EMPTY STATE ================= */}
    {notifications.length === 0 ? (
      <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm animate-fade-in">
        <BellOff className="w-16 h-16 text-text-muted mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          No notifications yet
        </h3>
        <p className="text-text-muted">
          We’ll notify you when something important happens.
        </p>
      </div>
    ) : (

      /* ================= NOTIFICATIONS ================= */
      <div className="space-y-5">

        {notifications.map((notification, index) => (
          <div
            key={notification._id || index}
            className={`
              group relative bg-white rounded-3xl border border-slate-200
              px-8 py-6
              transition-all duration-300 ease-out
              hover:shadow-xl hover:-translate-y-1 hover:border-slate-300
              animate-[fadeInUp_0.4s_ease-out]
              ${!notification.isRead ? 'bg-primary/5 border-primary/30' : ''}
            `}
            style={{ animationDelay: `${index * 80}ms` }}
          >

            <div className="flex items-start gap-6">

              {/* ICON */}
              <div className={`
                relative flex items-center justify-center
                w-12 h-12 rounded-full
                ${!notification.isRead ? 'bg-primary/10' : 'bg-slate-100'}
              `}>
                <Bell className="w-5 h-5 text-primary" />

                {/* Pulsing unread dot */}
                {!notification.isRead && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
                )}
              </div>

              {/* CONTENT */}
              <div className="flex-1">

                <div className="flex justify-between items-start">

                  <div>
                    <h3 className="font-semibold text-lg text-text-primary capitalize">
                      {notification.type || 'Notification'}
                    </h3>

                    <p className="text-text-muted mt-1 leading-relaxed">
                      {notification.message || 'No message'}
                    </p>

                    <p className="text-xs text-text-muted mt-3">
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : 'Unknown time'}
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification._id)}
                        disabled={!notification._id}
                        className="hover:bg-green-50"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notification._id)}
                      disabled={!notification._id}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>

                  </div>

                </div>
              </div>
            </div>

          </div>
        ))}

      </div>
    )}
  </div>
);


};

export default Notifications;