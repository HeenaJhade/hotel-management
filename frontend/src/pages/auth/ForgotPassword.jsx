import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import apiClient from "../../utils/api";
import { Hotel, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", { email: trimmedEmail });
      toast.success("OTP sent to your email!");
      navigate("/reset-password", { state: { email: trimmedEmail } });
      setOtpSent(true);
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
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
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
              <Hotel className="w-6 h-6 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Forgot Password
            </h1>

            <p className="text-slate-600 text-sm mt-2 text-center">
              Enter your email to receive an OTP
            </p>
          </div>

          {otpSent ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  OTP has been sent to your email. Please check your inbox and
                  use the OTP to reset your password.
                </p>
              </div>

              <Link to="/reset-password">
                <button
                  data-testid="proceed-reset-button"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md transition"
                >
                  Proceed to Reset Password
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    id="email"
                    data-testid="forgot-email-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                data-testid="send-otp-button"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md transition"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              data-testid="back-login-link"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}