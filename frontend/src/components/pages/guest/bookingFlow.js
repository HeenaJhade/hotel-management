import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '../../../utils/api';
import { ArrowLeft, ArrowRight, Calendar, Users, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { toast } from 'sonner';
import { generateBillingSlip } from '../../../utils/pdfGenerator';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51T7aZMFoKSbSrKPM4XHA2GyPqFBU5uzPoyT0V6ynkcYSacnptoIzQYqva77HESgp4QXNHPTySIcVmY2aa7oP11Ez00HMWL8LnC");

  const BookingFlow = () => {
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  const [formData, setFormData] = useState({
    check_in: '',
    check_out: '',
    guests: 1,
  });

  useEffect(() => {
    fetchRoomDetail();
  }, [roomId]);

useEffect(() => {
  if (!paymentIntentId) return;

  const fetchBooking = async () => {
    try {
      console.log("runing.....");
      const res = await apiClient.get(
        `/bookings/by-payment/${paymentIntentId}`
      );
      console.log("runinned.....");
      if (res.data.booking) {
        setBooking(res.data.booking);
      }
    } catch (err) {
      console.log("Waiting for webhook to create booking...");
    }
  };

  const interval = setInterval(fetchBooking, 2000);

  return () => clearInterval(interval);
}, [paymentIntentId]);
  const fetchRoomDetail = async () => {
    try {
      const response = await apiClient.get(`/rooms/${roomId}`);
      setRoom(response.data);
      console.log("room", response);
    } catch (error) {
      console.error('Error fetching room:', error);
      toast.error('Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!formData.check_in || !formData.check_out || !room) return 0;
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? room.price * nights : 0;
  };

const handleNext = async () => {
  if (step === 1) {
    if (!formData.check_in || !formData.check_out) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);

    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (formData.guests < 1 || formData.guests > room.capacity) {
      toast.error(`Number of guests must be between 1 and ${room.capacity}`);
      return;
    }

    try {
      setCheckingAvailability(true);
      const res = await apiClient.get(`/rooms/${roomId}/check-availability`, {
        params: { checkIn: formData.check_in, checkOut: formData.check_out },
      });
      if (!res.data.available) {
        toast.error('Room is already booked for selected dates');
        return;
      }
    } catch (err) {
      console.error('Availability check failed', err);
      toast.error('Could not verify room availability. Please try again.');
      return;
    } finally {
      setCheckingAvailability(false);
    }
  }

  setStep(step + 1);
};
const handleSubmit = async () => {
  if (!user) {
    toast.error("You must be logged in to book");
    return;
  }

  if (!stripe || !elements) {
    toast.error("Stripe not loaded");
    return;
  }

  try {
    setLoading(true);

    const total = calculateTotal();

    // 1️⃣ Create PaymentIntent with metadata
    const paymentRes = await apiClient.post(
      "/payments/create-payment-intent",
      {
        amount: total,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          roomId: room._id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          checkIn: formData.check_in,
          checkOut: formData.check_out,
          guests: formData.guests,
          specialRequests: "",
        },
      }
    );

    const clientSecret = paymentRes.data.clientSecret;

    // 2️⃣ Confirm Card Payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: user.name,
          email: user.email,
        },
      },
    });

    if (result.error) {
      toast.error(result.error.message);
      setLoading(false);
      return;
    }
    if (result.paymentIntent.status === "succeeded") {
  toast.success("Payment successful!");

  setPaymentIntentId(result.paymentIntent.id);
  setStep(3);
}
  } catch (error) {
    console.error("Payment error:", error);
    toast.error("Payment failed");
  } finally {
    setLoading(false);
  }
};

async function fetchBooking(paymentIntentId) {
  let booking = null;
  const maxAttempts = 15; // max 15 seconds
  let attempts = 0;

  while (!booking && attempts < maxAttempts) {
    try {
      const res = await axios.get(`/api/bookings/by-payment/${paymentIntentId}`);
      if (res.data.success) booking = res.data.booking;
    } catch (err) {
      // ignore 404, webhook might not have run yet
    }
    if (!booking) {
      attempts++;
      await new Promise(r => setTimeout(r, 1000)); // wait 1s
    }
  }

  if (!booking) throw new Error("Booking creation timed out");
  return booking;
}
  

  const handleDownloadBillingSlip = () => {
  if (!booking || !room) {
    toast.error("Cannot generate invoice - missing booking or room details");
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

  if (loading && !room) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-stone-500">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 mb-4">Room not found</p>
        <Button onClick={() => navigate('/user/rooms')}>Back to Rooms</Button>
      </div>
    );
  }

  const total = calculateTotal();
  const nights = formData.check_in && formData.check_out 
    ? Math.ceil((new Date(formData.check_out) - new Date(formData.check_in)) / (1000 * 60 * 60 * 24))
    : 0;

  const steps = [
    { number: 1, title: 'Dates & Guests', icon: Calendar },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Confirmation', icon: CheckCircle },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, idx) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                  step >= s.number ? 'bg-primary text-white' : 'bg-stone-200 text-stone-400'
                }`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <p className={`text-sm mt-2 ${
                  step >= s.number ? 'text-stone-900 font-medium' : 'text-stone-400'
                }`}>
                  {s.title}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  step > s.number ? 'bg-primary' : 'bg-stone-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-8 border border-stone-200 shadow-sm">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-stone-900 mb-2">Select Dates & Guests</h2>
                  <p className="text-stone-500">Choose your check-in and check-out dates</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Check-in Date*</Label>
                    <Input
                      type="date"
                      data-testid="check-in-date"
                      value={formData.check_in}
                      onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <Label>Check-out Date*</Label>
                    <Input
                      type="date"
                      data-testid="check-out-date"
                      value={formData.check_out}
                      onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                      min={formData.check_in || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <Label>Number of Guests*</Label>
                    <Input
                      type="number"
                      data-testid="num-guests"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                      min="1"
                      max={room.capacity}
                      required
                    />
                    <p className="text-sm text-stone-500 mt-1">Max {room.capacity} guests</p>
                  </div>
                </div>

                <Button
  data-testid="next-to-payment"
  onClick={handleNext}
  className="w-full rounded-full bg-primary py-6 text-lg font-semibold"
  disabled={checkingAvailability}
>
  {checkingAvailability ? "Checking..." : "Continue to Payment"}
  <ArrowRight className="w-5 h-5 ml-2" />
</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-stone-900 mb-2">Payment Details</h2>
                  <p className="text-stone-500">Enter your payment information </p>
                </div>

                <div className="space-y-4">
  <Label>Card Details</Label>
  <div className="p-4 border rounded-lg bg-white">
    <CardElement
      options={{
        style: {
          base: {
            fontSize: "16px",
            color: "#000",
            "::placeholder": {
              color: "#888",
            },
          },
        },
      }}
    />
  </div>
</div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-full py-6"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    data-testid="complete-booking"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 rounded-full bg-primary py-6 text-lg font-semibold"
                  >
                    {loading ? 'Processing...' : 'Complete Booking'}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
  <div className="space-y-6 text-center">
    {!booking ? (
      // 🔄 Waiting for webhook
      <div className="py-10">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-stone-900 mb-2">
          Finalizing your booking...
        </h2>
        <p className="text-stone-500">
          Please wait while we confirm your reservation.
        </p>
      </div>
    ) : (
      // ✅ Booking confirmed
      <>
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <div>
          <h2 className="text-2xl font-heading font-bold text-stone-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-stone-500">
            Your booking has been successfully created
          </p>
        </div>

        <div className="bg-stone-50 rounded-lg p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-stone-600">Booking ID:</span>
            <span className="font-semibold text-stone-900">
              {booking.bookingId}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-600">Room:</span>
            <span className="font-semibold text-stone-900">
              {booking.roomNumber}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-600">Check-in:</span>
            <span className="font-semibold text-stone-900">
              {new Date(booking.checkIn).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-600">Check-out:</span>
            <span className="font-semibold text-stone-900">
              {new Date(booking.checkOut).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between pt-3 border-t border-stone-200">
            <span className="font-semibold text-stone-900">
              Total Amount:
            </span>
            <span className="font-bold text-primary text-xl">
              ₹{booking.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleDownloadBillingSlip}
            variant="outline"
            className="flex-1 rounded-full py-6"
          >
            Download Billing Slip
          </Button>

          <Button
            onClick={() => navigate("/user/my-bookings")}
            className="flex-1 rounded-full bg-primary py-6"
          >
            View My Bookings
          </Button>
        </div>
      </>
    )}
  </div>
)}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm sticky top-24">
            <h3 className="font-heading font-semibold text-stone-900 mb-4">Booking Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-4">
                <img
                  src={room.imageUrl || 'https://images.unsplash.com/photo-1759264244764-2cb80f1a67bd?w=400'}
                  alt={room.roomNumber}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-stone-900">Room : {room.roomNumber}</p>
                  <p className="text-sm text-stone-500">{room.roomType}</p>
                  <p className="text-sm font-medium text-primary">₹{room.price}/night</p>
                </div>
              </div>

              {step >= 1 && formData.check_in && formData.check_out && (
                <div className="pt-4 border-t border-stone-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Check-in:</span>
                    <span className="font-medium text-stone-900">
                      {new Date(formData.check_in).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Check-out:</span>
                    <span className="font-medium text-stone-900">
                      {new Date(formData.check_out).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Guests:</span>
                    <span className="font-medium text-stone-900">{formData.guests}</span>
                  </div>
                </div>
              )}

              {nights > 0 && (
                <div className="pt-4 border-t border-stone-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">₹{room.price} x {nights} nights</span>
                    <span className="font-medium text-stone-900">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-200">
                    <span className="font-semibold text-stone-900">Total</span>
                    <span className="font-bold text-primary text-xl">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {step < 3 && (
              <div className="text-xs text-stone-500 text-center">
                You won't be charged yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BookingFlowWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <BookingFlow />
    </Elements>
  );
}