import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '../../../utils/api';  // ← Centralized API client
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export default function AdminStaff() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/admin/staff', {
        ...formData,
        role: 'staff',
      });

      toast.success('Staff member added successfully');

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        phone_number: '',
      });
    } catch (error) {
      console.error('Add staff error:', error);
      toast.error(error.response?.data?.detail || 'Failed to add staff member');
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

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Staff Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  data-testid="staff-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="staff-email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  data-testid="staff-phone-input"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="staff-password-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <Button
                type="submit"
                data-testid="add-staff-button"
                className="w-full bg-slate-900 hover:bg-slate-800"
                disabled={loading}
              >
                {loading ? 'Adding Staff...' : 'Add Staff Member'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}