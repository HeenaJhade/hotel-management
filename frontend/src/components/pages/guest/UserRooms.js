import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DoorOpen, Star, Wifi, Tv, Coffee, Wind } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "../../../utils/api";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export default function UserRooms() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [checkInFilter, setCheckInFilter] = useState("");
  const [checkOutFilter, setCheckOutFilter] = useState("");

  useEffect(() => {
    fetchRooms();
  }, [filter, checkInFilter, checkOutFilter]);

  useEffect(() => {
    applyClientFilters();
  }, [rooms, filter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filter !== 'all') params.append('roomType', filter);
      if (checkInFilter) params.append('checkIn', checkInFilter);
      if (checkOutFilter) params.append('checkOut', checkOutFilter);

      const url = `/rooms${params.toString() ? '?' + params.toString() : ''}`;
      const res = await apiClient.get(url);
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const applyClientFilters = () => {
    let result = [...rooms];
    if (filter !== 'all') {
      result = result.filter(room => room.roomType === filter);
    }
    setFilteredRooms(result);
  };

  const amenityIcons = {
    WiFi: Wifi,
    TV: Tv,
    Coffee: Coffee,
    AC: Wind,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const datesSelected = Boolean(checkInFilter || checkOutFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Our Rooms
            </h1>
            <p className="text-slate-600 mt-2">Find the perfect room for your stay</p>
            <div className="mt-4 h-1 w-16 bg-slate-900 rounded-full"></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{filteredRooms.length}</p>
              <p className="text-xs text-slate-600 uppercase tracking-wide">ROOMS FOUND</p>
            </div>
            <div className="hidden md:block h-10 w-px bg-slate-200" />
            <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium">
              Premium Collection
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Filter Rooms</h2>
            <div className="space-y-5">
              <div>
                <Label className="text-sm text-slate-600 mb-2 block">Room Type</Label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
  <Label className="text-sm text-slate-600 mb-2 block">Check-in</Label>
  <Input
    type="date"
    value={checkInFilter}
    onChange={(e) => setCheckInFilter(e.target.value)}
    min={new Date().toISOString().split("T")[0]}   // ← today
  />
</div>
              <div>
                <Label className="text-sm text-slate-600 mb-2 block">Check-out</Label>
                <Input
                  type="date"
                  value={checkOutFilter}
                  onChange={(e) => setCheckOutFilter(e.target.value)}
                  min={checkInFilter || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rooms grid */}
        <div className="lg:col-span-3">
          {filteredRooms.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center min-h-[50vh] flex flex-col items-center justify-center">
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">No rooms available</h3>
              <p className="text-slate-600 mb-6 max-w-md">
                {datesSelected
                  ? "No rooms match your selected dates and room type."
                  : filter !== 'all'
                  ? `No ${filter} rooms found.`
                  : "No rooms match your current filters."}
              </p>
              <p className="text-sm text-slate-500 mb-8">
                Try changing dates, room type, or clear filters.
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setFilter('all');
                  setCheckInFilter("");
                  setCheckOutFilter("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <Card
                  key={room._id}
                  className="group overflow-hidden border rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={room.imageUrl || "https://images.unsplash.com/photo-1758448755969-8791367cf5c5?crop=entropy&cs=srgb&fm=jpg&q=85"}
                      alt={room.roomType}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {!datesSelected && (
                      <span
                        className={`absolute top-4 right-4 px-4 py-1.5 text-sm font-medium rounded-full shadow ${
                          room.status === "available" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                        }`}
                      >
                        {room.status === "available" ? "Available" : "Currently Booked"}
                      </span>
                    )}
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{room.roomType} Room</h3>
                        <p className="text-sm text-slate-600 mt-1">Room {room.roomNumber || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">₹{room.price || 0}</p>
                        <p className="text-xs text-slate-600">per night</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-slate-600 ml-1">(4.6)</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(room.amenities || []).slice(0, 4).map((amenity, i) => {
                        const Icon = amenityIcons[amenity] || DoorOpen;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-700"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {amenity}
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      className="w-full py-6 font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
                      onClick={() => navigate(`/user/booking-flow/${room._id}`)}
                      disabled={!datesSelected && room.status !== "available"}
                    >
                      {datesSelected || room.status === "available" ? "Book Now" : "Currently Booked"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}