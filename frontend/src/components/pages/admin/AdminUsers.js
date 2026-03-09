import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  User, Mail, Phone, Grid, List, CheckCircle, Clock, Search,
  Loader2, Ban, Trash2,
} from 'lucide-react';

import apiClient from '@/utils/api'; 

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // email → true/false

  const [viewMode, setViewMode] = useState('list');

const fetchUsers = useCallback(async () => {
  setLoading(true);
  try {
    const params = {
      page,
      limit,
      search: searchTerm.trim() || undefined,
    };

    const res = await apiClient.get('/admin/users', { params });

    // ─── Fix starts here ───────────────────────────────────────
    const apiData = res.data || {};
    const fetchedUsers = apiData.data || apiData.users || [];   // handle both "data" and "users"
    const pag = apiData.pagination || {};

    console.log('Received users count:', fetchedUsers.length);
    console.log('Total from backend:', pag.total);

    setUsers(fetchedUsers);
    setTotal(pag.total || fetchedUsers.length || 0);
    setTotalPages(pag.pages || 1);
    // ─── Fix ends here ─────────────────────────────────────────

  } catch (err) {
    console.error('Fetch users error:', err);
    setUsers([]);
  } finally {
    setLoading(false);
  }
}, [page, limit, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
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
      `${newBlocked ? 'Blocking' : 'Unblocking'} ${user.name}...`
    );

    setActionLoading((prev) => ({ ...prev, [email]: true }));

    try {
      await apiClient.put(`/admin/users/${email}/block`, { isBlocked: newBlocked });

      toast.success(`User ${newBlocked ? 'blocked' : 'unblocked'} successfully`, {
        id: loadingToast,
      });

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.email === email ? { ...u, isBlocked: newBlocked } : u
        )
      );
    } catch (err) {
      toast.error(`Failed to ${newBlocked ? 'block' : 'unblock'} user`, {
        id: loadingToast,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [email]: false }));
      toast.dismiss(loadingToast);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name} (${user.email}) permanently?`)) return;

    const email = user.email;
    const loadingToast = toast.loading(`Deleting ${user.name}...`);

    setActionLoading((prev) => ({ ...prev, [email]: true }));

    try {
      await apiClient.delete(`/admin/users/${email}`);

      toast.success('User deleted successfully', { id: loadingToast });

      setUsers((prev) => prev.filter((u) => u.email !== email));

      // If last item on page, go back
      if (users.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (err) {
      toast.error('Failed to delete user', { id: loadingToast });
    } finally {
      setActionLoading((prev) => ({ ...prev, [email]: false }));
      toast.dismiss(loadingToast);
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      admin: 'bg-red-100 text-red-800 border-red-300',
      staff: 'bg-blue-100 text-blue-800 border-blue-300',
      user: 'bg-green-100 text-green-800 border-green-300',
    };
    return map[role?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusBadge = (blocked) =>
    blocked
      ? 'bg-red-100 text-red-800 border-red-300'
      : 'bg-green-100 text-green-800 border-green-300';

  const getVerifiedBadge = (verified) =>
    verified
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : 'bg-amber-100 text-amber-800 border-amber-300';

  return (

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Users Management</h2>
            <p className="text-slate-600 mt-1">
              {loading ? 'Loading...' : `${total} users found`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex border rounded-md overflow-hidden shadow-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none px-3"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none px-3"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No users found matching your search
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.email} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold truncate">{user.name}</h3>
                      </div>

                      <div className="space-y-1.5 mb-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone || user.phone_number || '—'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadge(user.isBlocked)}`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                        <span className={`px-3 py-1 text-xs rounded-full border ${getVerifiedBadge(user.isVerified)}`}>
                          {user.isVerified ? (
                            <> <CheckCircle className="inline h-3 w-3 mr-1" /> Verified </>
                          ) : (
                            <> <Clock className="inline h-3 w-3 mr-1" /> Pending </>
                          )}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleBlockToggle(user)}
                          disabled={actionLoading[user.email] || loading}
                        >
                          {actionLoading[user.email] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(user)}
                          disabled={actionLoading[user.email] || loading}
                        >
                          {actionLoading[user.email] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List view (table)
          <Card className="border-slate-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Verified</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.email} className="border-t hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-medium">{user.name}</td>
                        <td className="px-6 py-4 text-slate-700 truncate">{user.email}</td>
                        <td className="px-6 py-4 text-slate-700">{user.phone || user.phone_number || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadge(user.isBlocked)}`}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full border ${getVerifiedBadge(user.isVerified)}`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBlockToggle(user)}
                              disabled={actionLoading[user.email]}
                            >
                              {actionLoading[user.email] && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(user)}
                              disabled={actionLoading[user.email]}
                            >
                              {actionLoading[user.email] && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                  <div className="text-sm text-slate-600">
                    Showing {(page - 1) * limit + 1} – {Math.min(page * limit, total)} of {total}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1 || loading}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages || loading}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

  );
}