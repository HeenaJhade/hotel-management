import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Grid,
  List,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";

import apiClient from "../../utils/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [viewMode, setViewMode] = useState("list");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchTerm.trim() || undefined,
      };

      const res = await apiClient.get("/admin/users", { params });

      const apiData = res.data || {};
      const fetchedUsers = apiData.data || apiData.users || [];
      const pag = apiData.pagination || {};

      setUsers(fetchedUsers);
      setTotal(pag.total || fetchedUsers.length || 0);
      setTotalPages(pag.pages || 1);
    } catch (err) {
      console.error("Fetch users error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsers]);

  const handleBlockToggle = async (user) => {
    const newBlocked = !user.isBlocked;
    const email = user.email;

    const loadingToast = toast.loading(
      `${newBlocked ? "Blocking" : "Unblocking"} ${user.name}...`
    );

    setActionLoading((prev) => ({ ...prev, [email]: true }));

    try {
      await apiClient.put(`/admin/users/${email}/block`, {
        isBlocked: newBlocked,
      });

      toast.success(`User ${newBlocked ? "blocked" : "unblocked"} successfully`, {
        id: loadingToast,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.email === email ? { ...u, isBlocked: newBlocked } : u
        )
      );
    } catch (err) {
      toast.error("Failed to update user", { id: loadingToast });
    } finally {
      setActionLoading((prev) => ({ ...prev, [email]: false }));
      toast.dismiss(loadingToast);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name} permanently?`)) return;

    const email = user.email;
    const loadingToast = toast.loading(`Deleting ${user.name}...`);

    setActionLoading((prev) => ({ ...prev, [email]: true }));

    try {
      await apiClient.delete(`/admin/users/${email}`);

      toast.success("User deleted", { id: loadingToast });

      setUsers((prev) => prev.filter((u) => u.email !== email));
    } catch (err) {
      toast.error("Failed to delete user", { id: loadingToast });
    } finally {
      setActionLoading((prev) => ({ ...prev, [email]: false }));
      toast.dismiss(loadingToast);
    }
  };

  const getStatusBadge = (blocked) =>
    blocked
      ? "bg-red-100 text-red-800 border-red-300"
      : "bg-green-100 text-green-800 border-green-300";

  const getVerifiedBadge = (verified) =>
    verified
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : "bg-amber-100 text-amber-800 border-amber-300";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Staff Management
          </h2>
          <p className="text-slate-600 mt-1">
            {loading ? "Loading..." : `${total} users found`}
          </p>
        </div>

        <div className="flex border rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 ${
              viewMode === "grid"
                ? "bg-slate-900 text-white"
                : "bg-white hover:bg-slate-100"
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 ${
              viewMode === "list"
                ? "bg-slate-900 text-white"
                : "bg-white hover:bg-slate-100"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search name, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-md pl-10 pr-3 py-2 text-sm"
        />
      </div>

      {loading && users.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-slate-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No users found
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.email}
              className="bg-white border rounded-xl p-6 hover:shadow-md"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center">
                  <User className="text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>

                  <div className="text-sm text-slate-600 mt-2 space-y-1">
                    <div className="flex gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>

                    <div className="flex gap-2">
                      <Phone className="w-4 h-4" />
                      {user.phone || user.phone_number || "—"}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <span
                      className={`px-2 py-1 text-xs rounded border ${getStatusBadge(
                        user.isBlocked
                      )}`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>

                    <span
                      className={`px-2 py-1 text-xs rounded border ${getVerifiedBadge(
                        user.isVerified
                      )}`}
                    >
                      {user.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleBlockToggle(user)}
                      className="flex-1 border rounded-md px-3 py-1 text-sm hover:bg-slate-100"
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>

                    <button
                      onClick={() => handleDelete(user)}
                      className="flex-1 border border-red-300 text-red-600 rounded-md px-3 py-1 text-sm hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Name</th>
                <th className="px-6 py-4 text-left text-sm">Email</th>
                <th className="px-6 py-4 text-left text-sm">Phone</th>
                <th className="px-6 py-4 text-left text-sm">Status</th>
                <th className="px-6 py-4 text-right text-sm">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="border-t">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.phone || user.phone_number || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded border ${getStatusBadge(
                        user.isBlocked
                      )}`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button
                      onClick={() => handleBlockToggle(user)}
                      className="text-sm hover:underline"
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>

                    <button
                      onClick={() => handleDelete(user)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between px-6 py-4 border-t">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="border px-3 py-1 rounded-md"
              >
                Previous
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border px-3 py-1 rounded-md"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}