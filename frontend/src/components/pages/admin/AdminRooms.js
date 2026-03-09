import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Edit,
  Trash2,
  Plus,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import apiClient from '../../../utils/api';

const ITEMS_PER_PAGE = 12;

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: ITEMS_PER_PAGE,
    hasNext: false,
    hasPrev: false,
  });

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // File handling states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Single',
    price: '',
    description: '',
    max_occupancy: '',
    amenities: '',
  });

  // Fetch rooms when page or search changes
  useEffect(() => {
    fetchRooms();
  }, [pagination.currentPage, search]);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.currentPage,
        limit: ITEMS_PER_PAGE,
        ...(search.trim() && { search: search.trim() }),
      };

      const res = await apiClient.get('/rooms/all', { params });

      setRooms(res.data.rooms || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: res.data.pagination?.totalPages || 1,
        totalItems: res.data.pagination?.totalItems || 0,
        hasNext: res.data.pagination?.hasNext || false,
        hasPrev: res.data.pagination?.hasPrev || false,
      }));
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.room_number.trim() ||
      !formData.room_type ||
      !formData.price ||
      !formData.max_occupancy
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = editingRoom?.imageUrl || null;

      if (selectedFile) {
        const reader = new FileReader();

        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        const uploadRes = await apiClient.post('/upload', {
          file: base64,
          fileName: selectedFile.name,
        });

        if (!uploadRes.data.success) {
          throw new Error('Image upload failed');
        }

        imageUrl = uploadRes.data.url;
      }

      const payload = {
        roomNumber: formData.room_number.trim(),
        roomType: formData.room_type,
        price: Number(formData.price),
        description: formData.description.trim(),
        capacity: Number(formData.max_occupancy),
        amenities: formData.amenities,
        imageUrl,
      };

      if (editingRoom) {
        await apiClient.put(`/rooms/${editingRoom._id}`, payload);
        toast.success('Room updated successfully');
      } else {
        await apiClient.post('/rooms', payload);
        toast.success('Room created successfully');
      }

      setModalOpen(false);
      resetForm();
      fetchRooms();
    } catch (err) {
      console.error('Room save error:', err);
      toast.error(
        err.response?.data?.detail || err.message || 'Failed to save room'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.roomNumber || '',
      room_type: room.roomType || 'Single',
      price: room.price?.toString() || '',
      description: room.description || '',
      max_occupancy: room.capacity?.toString() || '',
      amenities: (room.amenities || []).join(', '),
    });
    setSelectedFile(null);
    setPreviewUrl(room.imageUrl || '');
    setModalOpen(true);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This cannot be undone.')) return;

    try {
      await apiClient.delete(`/rooms/${roomId}`);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.detail || 'Failed to delete room');
    }
  };

  const resetForm = () => {
    setFormData({
      room_number: '',
      room_type: 'Single',
      price: '',
      description: '',
      max_occupancy: '',
      amenities: '',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingRoom(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600 animate-pulse">Loading rooms...</p>
        </div>
    );
  }

  return (

      <div className="space-y-6" data-testid="admin-rooms-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">Rooms Management</h2>
            <p className="text-slate-600">
              Showing {rooms.length} of {pagination.totalItems} rooms
              {pagination.totalPages > 1 && ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex border rounded-md overflow-hidden">
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

            <Button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 gap-2"
            >
              <Plus className="h-4 w-4" /> Add Room
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <Input
            placeholder="Search by room number, type or status..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Rooms Content */}
        {rooms.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              No rooms found {search.trim() ? 'matching your search' : ''}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={
                      room.imageUrl
                        ? `${room.imageUrl}?tr=w-800,h-600,c-maintain_ratio,q-80`
                        : 'https://via.placeholder.com/400x200?text=No+Image'
                    }
                    alt={`${room.roomType} - Room ${room.roomNumber}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error';
                    }}
                  />
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold">{room.roomType}</h3>
                      <p className="text-sm text-gray-600">Room {room.roomNumber}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(room.status)}`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <p className="text-2xl font-bold mb-3">₹{room.price}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {room.description || 'No description provided'}
                  </p>

                  {room.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-5">
                      {room.amenities.slice(0, 4).map((amenity, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="text-xs text-gray-500 self-center">
                          +{room.amenities.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(room)}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(room._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Room No</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Amenities</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room._id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">Room {room.roomNumber}</td>
                        <td className="px-6 py-4">{room.roomType}</td>
                        <td className="px-6 py-4 font-bold">₹{room.price}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(room.status)}`}
                          >
                            {room.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {room.amenities?.slice(0, 3).join(', ') || 'None'}
                          {room.amenities?.length > 3 && ' +more'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(room)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(room._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
            <p className="text-sm text-slate-600">
              Showing {rooms.length} of {pagination.totalItems} rooms • Page{' '}
              {pagination.currentPage} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev || loading}
                onClick={() =>
                  setPagination((p) => ({ ...p, currentPage: p.currentPage - 1 }))
                }
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext || loading}
                onClick={() =>
                  setPagination((p) => ({ ...p, currentPage: p.currentPage + 1 }))
                }
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Modal - Add/Edit Room */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Room Number *</Label>
                  <Input
                    value={formData.room_number}
                    onChange={(e) =>
                      setFormData({ ...formData, room_number: e.target.value })
                    }
                    required
                    placeholder="e.g. 101"
                  />
                </div>
                <div>
                  <Label>Room Type *</Label>
                  <Select
                    value={formData.room_type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, room_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Max Occupancy *</Label>
                  <Input
                    type="number"
                    value={formData.max_occupancy}
                    onChange={(e) =>
                      setFormData({ ...formData, max_occupancy: e.target.value })
                    }
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe the room features, view, size, etc."
                />
              </div>

              <div>
                <Label>Amenities (comma-separated)</Label>
                <Input
                  value={formData.amenities}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                  placeholder="WiFi, TV, Air Conditioning, Mini Bar, Balcony"
                />
              </div>

              <div>
                <Label>Room Image {editingRoom ? '(leave empty to keep current)' : ''}</Label>

                {previewUrl && (
                  <div className="mt-2 border rounded overflow-hidden shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {!previewUrl && editingRoom?.imageUrl && (
                  <div className="mt-2 border rounded overflow-hidden shadow-sm">
                    <img
                      src={`${editingRoom.imageUrl}?tr=w-600,h-400,c-maintain_ratio,q-85`}
                      alt="Current room"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400?text=Image+Failed';
                      }}
                    />
                  </div>
                )}

                <div className="mt-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: JPG / PNG / WebP • Max 10MB • Will be optimized on server
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting
                    ? 'Saving...'
                    : editingRoom
                    ? 'Update Room'
                    : 'Add Room'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
   
  );
}