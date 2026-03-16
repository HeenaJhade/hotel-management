import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Custom error for email failures
export class EmailDeliveryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EmailDeliveryError';
  }
}

// Generate 6-digit OTP
export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// OTP expiry: 10 minutes from now
export const getOtpExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry;
};

// email sender with better error handling
export  const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER_EMAIL) {
    console.error('SendGrid configuration missing');
    throw new EmailDeliveryError('Email service not configured');
  }

  const msg = {
    to,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject,
    text: textContent || 'Please view this email in HTML mode',
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Email sending error:', error.response?.body || error.message);
    throw new EmailDeliveryError(`Failed to send email: ${error.message}`);
  }
};

// ────────────────────────────────────────────────
// OTP Verification Email (Signup / Forgot Password)
// ────────────────────────────────────────────────
export const sendOtpEmail = async (recipientEmail, otp, name, purpose = 'verification') => {
  const subject = purpose === 'password reset'
    ? 'Reset Your Password - HM'
    : 'Verify Your Email - HM';

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <h2 style="color: #0F172A; margin-bottom: 20px; text-align: center;">
            ${purpose === 'password reset' ? 'Reset Your Password' : 'Welcome to HM'}
          </h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hello <strong>${name}</strong>,
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            ${purpose === 'password reset' 
              ? 'Use the OTP below to reset your password:' 
              : 'Thank you for signing up! Use this OTP to verify your email:'}
          </p>
          <div style="background-color: #0F172A; color: #D4AF37; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; margin: 30px 0; border-radius: 10px; letter-spacing: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            ${otp}
          </div>
          <p style="color: #475569; font-size: 14px; text-align: center;">
            This OTP expires in <strong>10 minutes</strong>.
          </p>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
    Hello ${name},

    ${purpose === 'password reset' ? 'Reset OTP' : 'Verification OTP'}: ${otp}

    This code expires in 10 minutes.

    If you didn't request this, ignore this email.
  `;

  return sendEmail(recipientEmail, subject, htmlContent, textContent);
};

// ────────────────────────────────────────────────
// Booking Confirmation Email
// ────────────────────────────────────────────────
export const sendBookingConfirmationEmail = async (recipientEmail, bookingDetails) => {
  const subject = 'Booking Confirmed - HM';

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <h2 style="color: #0F172A; text-align: center; margin-bottom: 20px;">
            Booking Confirmed!
          </h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Dear <strong>${bookingDetails.guestName}</strong>,
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your booking has been successfully confirmed. Here are the details:
          </p>
          <div style="background-color: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 10px; border: 1px solid #e2e8f0;">
            <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
            <p><strong>Room Type:</strong> ${bookingDetails.roomType}</p>
            <p><strong>Room Number:</strong> ${bookingDetails.roomNumber || 'N/A'}</p>
            <p><strong>Check-in:</strong> ${new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${bookingDetails.guests}</p>
            <p><strong>Total Amount:</strong> <strong style="color: #0F172A;">$${bookingDetails.totalAmount}</strong></p>
          </div>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-top: 20px;">
            We look forward to welcoming you!
          </p>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
            Questions? Contact us at support@luxestay.com
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
    Booking Confirmed!

    Dear ${bookingDetails.guestName},

    Booking ID: ${bookingDetails.bookingId}
    Room Type: ${bookingDetails.roomType}
    Room Number: ${bookingDetails.roomNumber || 'N/A'}
    Check-in: ${new Date(bookingDetails.checkIn).toLocaleDateString()}
    Check-out: ${new Date(bookingDetails.checkOut).toLocaleDateString()}
    Guests: ${bookingDetails.guests}
    Total Amount: $${bookingDetails.totalAmount}

    We look forward to hosting you!

    HM Team
  `;

  return sendEmail(recipientEmail, subject, htmlContent, textContent);
};

// ────────────────────────────────────────────────
// Password Reset Email (ready to use)
// ────────────────────────────────────────────────
export const sendPasswordResetEmail = async (recipientEmail, otp, name) => {
  return sendOtpEmail(recipientEmail, otp, name, 'password reset');
};

// ────────────────────────────────────────────────
// Booking Cancellation Email
// ────────────────────────────────────────────────
export const sendBookingCancellationEmail = async (recipientEmail, bookingDetails) => {
  const subject = 'Booking Cancelled - HM (TEST)';

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>TEST: Booking Cancelled</h2>
        <p>Dear ${bookingDetails.guestName || 'Guest'},</p>
        <p>Your booking ${bookingDetails.bookingId || 'N/A'} has been cancelled.</p>
        <p>This is a simplified test email.</p>
      </body>
    </html>
  `;

  const textContent = `TEST: Booking ${bookingDetails.bookingId || 'N/A'} cancelled.`;

  return sendEmail(recipientEmail, subject, htmlContent, textContent);
};
