import { useEffect, useState } from "react";
import apiClient from "../../utils/api";
import { toast } from "sonner";
import { Calendar} from "lucide-react";
import { generateBillingSlip } from "../../utils/pdfGenerator";
import { useAuth } from '../../contexts/AuthContext';

export default function UserBookings() {
   const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
    const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);
const fetchRooms = async () => {
  try {
    const res = await apiClient.get('/rooms/all');
    setRooms(res.data.rooms);
  } catch (err) {
    toast.error("Failed to load rooms");
  }
};
  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/bookings/userbooking');
      setBookings(response.data.bookings || []);
      
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "checked_in":
        return "bg-green-100 text-green-700 border-green-200";
      case "checked_out":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  const handleDownloadBillingSlip = (booking,room) => {
  if (!booking) {
    toast.error("Cannot generate invoice - missing booking details");
    return;
  }

  try {
    generateBillingSlip(booking, room, user); 
    toast.success("Billing slip downloaded successfully!");
  } catch (error) {
    console.error("PDF error:", error);
    toast.error("Failed to generate billing slip. Please try again.");
  }
};
  const getPaymentColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

 return (
  <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-12" data-testid="user-bookings-page">

    {/* ================= PREMIUM HEADER ================= */}
    <div className="relative  overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 lg:p-10 shadow-lg transition-all duration-300 hover:shadow-xl">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary">
            My Bookings
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Review and manage your upcoming and past stays.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-1 w-14 bg-primary rounded-full" />
            <span className="text-xs text-text-muted uppercase tracking-wider">
              Dashboard Overview
            </span>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 px-6 py-4 rounded-2xl text-center">
          <p className="text-3xl font-bold text-primary">
            {bookings.length}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Total Reservations
          </p>
        </div>

      </div>
    </div>

    {/* ================= BOOKINGS ================= */}
    {bookings.length === 0 ? (
      <div className="bg-white border border-slate-200 rounded-3xl p-14 text-center shadow-sm hover:shadow-md transition-all">
        <Calendar className="w-16 h-16 text-text-muted mx-auto mb-5" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          No bookings yet
        </h3>
        <p className="text-text-muted text-sm">
          Start exploring rooms and enjoy a premium stay experience.
        </p>
      </div>
    ) : (
      <div className="space-y-10">
        {bookings.map((booking) => {
          const room = rooms.find(
  r => r._id?.toString() === booking.roomId?.toString()
);
          const nights = booking.nights;

          return (
            <div
              key={booking._id}
              className="group bg-white border  border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col xl:flex-row gap-10">

                {/* LEFT SIDE */}
                <div className="flex flex-col md:flex-row gap-8 flex-1">

                  {/* Image */}
                  <div className="relative w-full md:w-56 h-56 rounded-2xl overflow-hidden shadow-md">
                    <img

                        src={room?.imageUrl || "/default-room.jpg"}
                        
                      
                      alt="Room"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h2 className="text-2xl font-bold text-text-primary">
                        {booking.roomType} Room
                      </h2>

                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>

                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border ${getPaymentColor(
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-text-muted space-y-1">
                      <p>Booking ID: <span className="font-medium text-text-primary">{booking.bookingId}</span></p>
                      <p>Room Number: <span className="font-medium text-text-primary">{booking.roomNumber}</span></p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 my-6" />

                    {/* Stay Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">

                      <div>
                        <p className="text-text-muted">Check-in</p>
                        <p className="font-medium text-text-primary">
                          {new Date(booking.checkIn).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-text-muted">Check-out</p>
                        <p className="font-medium text-text-primary">
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-text-muted">Guests</p>
                        <p className="font-medium text-text-primary">
                          {booking.guests} Guest
                        </p>
                      </div>
<button
  onClick={() => handleDownloadBillingSlip(booking,room)}
  className="flex-1 border border-stone-300 hover:bg-stone-50 text-stone-700 py-5 px-6 rounded-full font-medium transition-colors"
>
  Download Billing Slip
</button>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm">
                        <p className="text-xs text-text-muted mb-1">
                          Special Requests
                        </p>
                        <p className="text-text-primary">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}

                  </div>
                </div>

                {/* RIGHT SIDE SUMMARY */}
                <div className="w-full xl:w-80 bg-linear-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner">

                  <h3 className="text-lg font-semibold mb-6 text-text-primary">
                    Booking Summary
                  </h3>

                  <div className="space-y-4 text-sm">

                    <div className="flex justify-between">
                      <span className="text-text-muted">Nights</span>
                      <span className="font-medium">{nights}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-text-muted">Room Type</span>
                      <span className="font-medium">{booking.roomType}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-text-muted">Payment Status</span>
                      <span className="font-medium capitalize">
                        {booking.paymentStatus}
                      </span>
                    </div>

                  </div>

                  <div className="border-t border-slate-200 mt-6 pt-6 flex justify-between items-center">
                    <span className="font-semibold text-text-primary">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{booking.totalAmount}
                    </span>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);


}
