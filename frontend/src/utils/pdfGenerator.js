import jsPDF from 'jspdf';
import 'jspdf-autotable'; // optional – only if you use tables

// Helper: safely convert any value to string with fallback
const safeStr = (value, fallback = '—') => {
  if (value == null || value === undefined) return fallback;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// Helper: format date nicely
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const generateBillingSlip = (booking, room, user = {}) => {
  try {
    const doc = new jsPDF();

    // ─── Header ────────────────────────────────────────────────
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('HM Hotel', 105, 25, { align: 'center' });

    doc.setFontSize(14);
    doc.text('Booking Invoice', 105, 35, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // ─── Booking Info Section ──────────────────────────────────
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Details', 20, 60);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const bookingInfo = [
      ['Booking ID', safeStr(booking?.bookingId || booking?.id)],
      ['Guest Name', safeStr(user?.name || booking?.guestName || booking?.userName)],
      ['Email', safeStr(user?.email || booking?.guestEmail || booking?.userEmail)],
      ['Phone', safeStr(user?.phone)],
      ['Room Type', safeStr(room?.roomType || booking?.roomType)],
      ['Room Number', safeStr(room?.roomNumber || booking?.roomNumber)],
      ['Check-in', formatDate(booking?.checkIn || booking?.check_in)],
      ['Check-out', formatDate(booking?.checkOut || booking?.check_out)],
      ['Guests', safeStr(booking?.guests)],
      ['Nights', safeStr(booking?.nights)],
    ];

    let y = 70;
    bookingInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, y);
      y += 8;
    });

    // ─── Payment Summary ───────────────────────────────────────
    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Summary', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const pricePerNight = safeStr(room?.price || booking?.pricePerNight || 0);
    const total = safeStr(booking?.totalAmount || booking?.total_price || 0);

    doc.text(`Price per night: ₹${pricePerNight}`, 20, y);
    y += 8;
    doc.text(`Nights: ${booking?.nights || '—'}`, 20, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Total Amount:', 20, y);
    doc.text(`₹${total}`, 105, y, { align: 'right' });

    // Payment status badge
    const status = (booking?.paymentStatus || booking?.payment_status || 'pending').toUpperCase();
    const statusColor = status === 'PAID' ? [16, 185, 129] : [239, 68, 68]; // green / red
    doc.setFillColor(...statusColor);
    doc.rect(150, y - 6, 40, 12, 'F');
    doc.setTextColor(255);
    doc.setFontSize(11);
    doc.text(status, 170, y + 1, { align: 'center' });

    // ─── Footer ────────────────────────────────────────────────
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Thank you for choosing HM Hotel!', 105, 270, { align: 'center' });
    doc.text('For support: support@HM.com | +91 123-456-7890', 105, 278, { align: 'center' });

    // Save with meaningful filename
    const filename = `HM_Invoice_${booking?.bookingId || booking?.id || 'booking'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

  } catch (err) {
    console.error('PDF generation failed:', err);
    throw err; // let caller handle toast
  }
};