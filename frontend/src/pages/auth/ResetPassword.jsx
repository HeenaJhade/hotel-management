import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Hotel, Lock, Key } from "lucide-react";
import apiClient from "../../utils/api";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    otp: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  if (!email) {
    navigate("/forgot-password", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/auth/reset-password", {
        email,
        otp: formData.otp,
        new_password: formData.new_password,
      });

      toast.success("Password reset successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to reset password"
      );
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
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
              <Hotel className="w-6 h-6 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Reset Password
            </h1>

            <p className="text-slate-600 text-sm mt-2 text-center">
              Enter the OTP sent to <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP */}
            <div>
              <label
                htmlFor="otp"
                className="text-sm font-medium text-slate-700"
              >
                OTP
              </label>

              <div className="relative mt-2">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="new_password"
                className="text-sm font-medium text-slate-700"
              >
                New Password
              </label>

              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.new_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      new_password: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-md py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm_password"
                className="text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>

              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirm_password: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-md py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md transition"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to forgot password
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}