import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, Grid, List, X, Calendar, User, Bed, CreditCard, Loader2 } from 'lucide-react';
import apiClient from '../../utils/api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/bookings', {
        params: { page, limit },
      });

      const data = response.data;

      setBookings(data.bookings || []);
      setFilteredBookings(data.bookings || []);
      setTotal(data.pagination?.totalBookings || data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);

      if (data.pagination?.totalPages && page > data.pagination.totalPages) {
        setPage(data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      const msg = err.response?.data?.detail || 'Could not load bookings';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleViewBooking = async (bookingId) => {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}`);
      setSelectedBooking(response.data || null);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredBookings(bookings);
      return;
    }
    const filtered = bookings.filter(
      (booking) =>
        booking.bookingId?.toLowerCase().includes(term) ||
        booking.userName?.toLowerCase().includes(term) ||
        booking.userEmail?.toLowerCase().includes(term)
    );
    setFilteredBookings(filtered);
  }, [searchTerm, bookings]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked_in': return 'bg-green-100 text-green-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Cancel booking ${bookingId}? This cannot be undone.`)) return;

    try {
      await apiClient.delete(`/bookings/${bookingId}`);
      toast.success(`Booking ${bookingId} cancelled`);

      setBookings((prev) =>
        prev.map((b) => b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b)
      );
      setFilteredBookings((prev) =>
        prev.map((b) => b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b)
      );
    } catch (err) {
      console.error('Cancel failed:', err);
      const msg = err.response?.data?.detail || 'Failed to cancel booking';
      toast.error(msg);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '—';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div data-testid="admin-bookings-page" className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">Bookings Management</h2>
          <p className="text-slate-600">
            View and manage all hotel bookings • {total} total
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex border border-slate-300 rounded-md overflow-hidden shadow-sm">
            <button
              className={`px-3 py-1.5 transition-colors ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              className={`px-3 py-1.5 transition-colors ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search by guest name, email, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Bookings Content */}
      {error ? (
        <div className="text-center py-12 text-red-600">
          <p className="text-lg font-medium">{error}</p>
          <button
            className="mt-4 px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => fetchBookings()}
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {searchTerm ? 'No bookings match your search on this page.' : 'No bookings found.'}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.bookingId}
              className="group bg-white border border-slate-200 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
            >
              <div className="p-6 space-y-5">
                {/* Top Section */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500">Booking ID</p>
                    <h3 className="text-xl font-bold text-slate-900">#{booking.bookingId}</h3>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Guest Info */}
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">{booking.userName}</p>
                  <p className="text-sm text-slate-500">{booking.userEmail}</p>
                </div>

                {/* Stay Info */}
                <div className="flex justify-between text-sm text-slate-600">
                  <div>
                    <p className="text-xs text-slate-400">Check-In</p>
                    <p>{formatDate(booking.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Check-Out</p>
                    <p>{formatDate(booking.checkOut)}</p>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="text-lg font-bold text-[#C6A87C]">{formatCurrency(booking.totalAmount)}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-full border ${getPaymentStatusColor(booking.paymentIntentId)}`}>
                    {booking.paymentIntentId}
                  </span>
                  <div>
                    <p className="text-xs text-slate-500">Payment ID</p>
                    <h3 className="text-xl font-bold text-slate-900">#{booking.paymentIntentId}</h3>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <button
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                    onClick={() => handleViewBooking(booking.bookingId)}
                  >
                    View
                  </button>
                  {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
                    <button
                      className="flex-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      onClick={() => handleCancelBooking(booking.bookingId)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Booking ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Guest</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Dates</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Payment</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.bookingId} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">#{booking.bookingId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{booking.userName}</p>
                        <p className="text-xs text-slate-500">{booking.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      In: {formatDate(booking.checkIn)}<br />
                      Out: {formatDate(booking.checkOut)}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      ₹{booking.totalAmount?.toLocaleString('en-IN') || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-700">{booking.paymentStatus}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 transition-colors"
                          onClick={() => handleViewBooking(booking.bookingId)}
                        >
                          View
                        </button>
                        {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
                          <button
                            className="px-3 py-1.5 text-sm text-red-600 rounded-md hover:bg-slate-100 transition-colors"
                            onClick={() => handleCancelBooking(booking.bookingId)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
          <p className="text-sm text-slate-600">
            Showing {filteredBookings.length} – {Math.min(page * limit, total)} of {total} bookings
            {searchTerm && ' (filtered)'}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-4">
              <button
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>

              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                disabled={page === totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
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
                    <p className="font-medium text-slate-900">{selectedBooking.bookingId || '—'}</p>
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
                    <p className="font-medium text-slate-900">{selectedBooking.userName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{selectedBooking.userEmail || '—'}</p>
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
                    <p className="text-xl font-bold text-slate-900">{selectedBooking.roomNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-medium text-slate-900">{selectedBooking.roomType || '—'}</p>
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
                    <p className="font-medium text-slate-900">{selectedBooking.nights || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Guests</p>
                    <p className="font-medium text-slate-900">{selectedBooking.guests || '—'}</p>
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
                    <p className="font-medium text-slate-900">{selectedBooking.paymentIntentId || '—'}</p>
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
                  {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'checked_out' && (
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
}