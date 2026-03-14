import { useState } from "react";
import apiClient from "../../utils/api";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export default function AdminStaff() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post("/admin/staff", {
        ...formData,
        role: "staff",
      });

      toast.success("Staff member added successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        phone_number: "",
      });
    } catch (error) {
      console.error("Add staff error:", error);
      toast.error(error.response?.data?.detail || "Failed to add staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-staff-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Add Staff</h2>
        <p className="text-slate-600">Register new staff members</p>
      </div>

      {/* Card */}
      <div className="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Card Header */}
        <div className="border-b px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <UserPlus className="w-5 h-5" />
            Staff Registration
          </h3>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                data-testid="staff-name-input"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                data-testid="staff-email-input"
                type="email"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone_number"
                data-testid="staff-phone-input"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone_number: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                data-testid="staff-password-input"
                type="password"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              data-testid="add-staff-button"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md text-sm font-medium transition"
            >
              {loading ? "Adding Staff..." : "Add Staff Member"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}