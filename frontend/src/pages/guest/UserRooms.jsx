import { useEffect, useState } from "react";
import { DoorOpen, Star, Wifi, Tv, Coffee, Wind } from "lucide-react";
import apiClient from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function UserRooms() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [filter, setFilter] = useState("all");
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

      if (filter !== "all") params.append("roomType", filter);
      if (checkInFilter) params.append("checkIn", checkInFilter);
      if (checkOutFilter) params.append("checkOut", checkOutFilter);

      const url = `/rooms${params.toString() ? "?" + params.toString() : ""}`;

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

    if (filter !== "all") {
      result = result.filter((room) => room.roomType === filter);
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
            <p className="text-slate-600 mt-2">
              Find the perfect room for your stay
            </p>
            <div className="mt-4 h-1 w-16 bg-slate-900 rounded-full"></div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {filteredRooms.length}
              </p>
              <p className="text-xs text-slate-600 uppercase tracking-wide">
                ROOMS FOUND
              </p>
            </div>

            <div className="hidden md:block h-10 w-px bg-slate-200" />

            <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium">
              Premium Collection
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Filter Rooms
            </h2>

            <div className="space-y-5">
              {/* Room Type */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">
                  Room Type
                </label>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2"
                >
                  <option value="all">All Rooms</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              {/* Check-in */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">
                  Check-in
                </label>

                <input
                  type="date"
                  value={checkInFilter}
                  onChange={(e) => setCheckInFilter(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-slate-300 rounded-md p-2"
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">
                  Check-out
                </label>

                <input
                  type="date"
                  value={checkOutFilter}
                  onChange={(e) => setCheckOutFilter(e.target.value)}
                  min={
                    checkInFilter || new Date().toISOString().split("T")[0]
                  }
                  className="w-full border border-slate-300 rounded-md p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="lg:col-span-3">
          {filteredRooms.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center min-h-[50vh] flex flex-col items-center justify-center">
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                No rooms available
              </h3>

              <p className="text-slate-600 mb-6 max-w-md">
                {datesSelected
                  ? "No rooms match your selected dates and room type."
                  : filter !== "all"
                  ? `No ${filter} rooms found.`
                  : "No rooms match your current filters."}
              </p>

              <button
                className="border px-6 py-2 rounded-lg"
                onClick={() => {
                  setFilter("all");
                  setCheckInFilter("");
                  setCheckOutFilter("");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room._id}
                  className="group overflow-hidden border rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={
                        room.imageUrl ||
                        "https://images.unsplash.com/photo-1758448755969-8791367cf5c5"
                      }
                      alt={room.roomType}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {!datesSelected && (
                      <span
                        className={`absolute top-4 right-4 px-4 py-1.5 text-sm font-medium rounded-full shadow ${
                          room.status === "available"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {room.status === "available"
                          ? "Available"
                          : "Currently Booked"}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-xl font-bold">
                          {room.roomType} Room
                        </h3>
                        <p className="text-sm text-slate-600">
                          Room {room.roomNumber || "—"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ₹{room.price || 0}
                        </p>
                        <p className="text-xs text-slate-600">
                          per night
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-sm text-slate-600 ml-1">
                        (4.6)
                      </span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2">
                      {(room.amenities || []).slice(0, 4).map((amenity, i) => {
                        const Icon = amenityIcons[amenity] || DoorOpen;

                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {amenity}
                          </div>
                        );
                      })}
                    </div>

                    {/* Book Button */}
                    <button
                      className="w-full py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                      onClick={() =>
                        navigate(`/user/booking-flow/${room._id}`)
                      }
                      disabled={
                        !datesSelected && room.status !== "available"
                      }
                    >
                      {datesSelected || room.status === "available"
                        ? "Book Now"
                        : "Currently Booked"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}