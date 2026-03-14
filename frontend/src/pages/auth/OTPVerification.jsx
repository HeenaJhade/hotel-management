import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../utils/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Hotel } from "lucide-react";

export const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("No email provided. Please try again.");
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft((p) => p - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [secondsLeft]);

  const startResendTimer = () => {
    setCanResend(false);
    setSecondsLeft(60);
  };

  const handleOTPChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/verify-otp", {
        email,
        otp: code,
      });

      login(response.data.access_token, response.data.user);
      toast.success("Email verified successfully!");

      const role = response.data.user.role;

      if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (role === "staff") navigate("/staff/dashboard", { replace: true });
      else navigate("/home", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResending(true);
    try {
      await apiClient.post("/auth/resend-otp", { email });
      toast.success("New OTP sent to your email");
      startResendTimer();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
              <Hotel className="w-6 h-6 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Verify Email</h1>

            <p className="text-slate-600 text-sm mt-2 text-center">
              Enter the 6-digit code sent to
              <br />
              <span className="font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(e.target.value, i)}
                  className="w-12 h-12 text-center text-xl border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md transition"
              disabled={loading || otp.join("").length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-600">
              {canResend ? (
                "Didn't receive the code?"
              ) : (
                <>
                  Resend available in{" "}
                  <span className="font-medium text-slate-900">
                    {formatTime(secondsLeft)}
                  </span>
                </>
              )}
            </p>

            <button
              onClick={handleResend}
              disabled={resending || !canResend || loading}
              className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              {resending
                ? "Sending..."
                : canResend
                ? "Resend OTP"
                : `Resend in ${formatTime(secondsLeft)}`}
            </button>

            <div className="pt-2">
              <Link
                to="/login"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                ← Back to login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};