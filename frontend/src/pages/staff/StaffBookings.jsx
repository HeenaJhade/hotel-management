import React, { useEffect, useState, useMemo } from "react";
import apiClient from "../../utils/api";
import { toast } from "sonner";
import { Calendar, Eye, X, User, Bed, CreditCard, Search } from "lucide-react";


const ITEMS_PER_PAGE = 10;

export default function Bookings () {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    hasNext: false,
    hasPrev: false,
    limit: ITEMS_PER_PAGE,
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, search]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(search.trim() && { search: search.trim() }),
      };

      const response = await apiClient.get("/bookings", { params });

      setBookings(response.data.bookings || []);
      setPagination(
        response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalBookings: 0,
          limit: ITEMS_PER_PAGE,
        }
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
      setBookings([]);
      setLoading(false);
    }
  };

  const handleViewBooking = async (bookingId) => {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}`);
      setSelectedBooking(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Could not load booking details");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Cancel booking ${bookingId}? This cannot be undone.`)) return;

    try {
      await apiClient.delete(`/bookings/${bookingId}`);
      toast.success(`Booking ${bookingId} cancelled`);

      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err) {
      console.error("Cancel failed:", err);
      const msg = err.response?.data?.detail || "Failed to cancel booking";
      toast.error(msg);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const getStatusColor = (status) => {
    const map = {
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      checked_in: "bg-green-100 text-green-800 border-green-200",
      checked_out: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPaymentStatusColor = (status) => {
    const map = {
      paid: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      refunded: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Calendar className="w-6 h-6 animate-spin text-[#C6A87C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-600">Manage and track all hotel reservations</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Booking ID or Guest Name..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#C6A87C] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Booking ID</th>
                <th className="px-6 py-4 text-left text-sm">Guest</th>
                <th className="px-6 py-4 text-left text-sm">Room</th>
                <th className="px-6 py-4 text-left text-sm">Check In</th>
                <th className="px-6 py-4 text-left text-sm">Check Out</th>
                <th className="px-6 py-4 text-left text-sm">Amount</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-t hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{booking.bookingId}</td>
                  <td className="px-6 py-4">{booking.userName}</td>
                  <td className="px-6 py-4">{booking.roomNumber}</td>
                  <td className="px-6 py-4">{formatDate(booking.checkIn)}</td>
                  <td className="px-6 py-4">{formatDate(booking.checkOut)}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(booking.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewBooking(booking.bookingId)}
                      className="text-[#C6A87C] hover:opacity-80"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t">
          <p className="text-sm text-slate-600">
            Showing {bookings.length} of {pagination.totalBookings} bookings
            {" • "} Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <button
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-slate-900">Booking Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Booking Information */}
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C6A87C]" />
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-500">Booking ID</p>
                    <p className="font-medium text-slate-900">{selectedBooking.bookingId || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Booking Date</p>
                    <p className="font-medium text-slate-900">{formatDate(selectedBooking.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Payment Status</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-2xl font-bold text-[#C6A87C]">{formatCurrency(selectedBooking.totalAmount)}</p>
                  </div>
                </div>
              </section>

              {/* Guest Details */}
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C6A87C]" />
                  Guest Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium text-slate-900">{selectedBooking.userName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{selectedBooking.userEmail || "—"}</p>
                  </div>
                </div>
              </section>

              {/* Room Details */}
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-[#C6A87C]" />
                  Room Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-500">Room Number</p>
                    <p className="text-xl font-bold text-slate-900">{selectedBooking.roomNumber || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-medium text-slate-900">{selectedBooking.roomType || "—"}</p>
                  </div>
                </div>
              </section>

              {/* Stay Details */}
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C6A87C]" />
                  Stay Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-500">Check-In</p>
                    <p className="font-medium text-slate-900">{formatDate(selectedBooking.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Check-Out</p>
                    <p className="font-medium text-slate-900">{formatDate(selectedBooking.checkOut)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Nights</p>
                    <p className="font-medium text-slate-900">{selectedBooking.nights || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Guests</p>
                    <p className="font-medium text-slate-900">{selectedBooking.guests || "—"}</p>
                  </div>
                </div>
              </section>

              {/* Payment Details */}
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C6A87C]" />
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-500">Payment ID</p>
                    <p className="font-medium text-slate-900">{selectedBooking.paymentIntentId || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-2xl font-bold text-[#C6A87C]">{formatCurrency(selectedBooking.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Payment Status</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <section className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
                <div className="flex gap-4 flex-wrap">
                  {selectedBooking.status !== "cancelled" &&
                    selectedBooking.status !== "checked_out" && (
                      <button
                        className="px-3 py-1.5 text-sm font-medium border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        onClick={() => {
                          handleCancelBooking(selectedBooking.bookingId);
                          setShowModal(false);
                        }}
                      >
                        Cancel Booking
                      </button>
                    )}
                  <button
                    className="px-3 py-1.5 text-sm font-medium border border-slate-300 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


