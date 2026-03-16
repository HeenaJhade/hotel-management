import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";
import { Search } from "lucide-react";


const ITEMS_PER_PAGE = 10;

export default function Rooms () {

  const [rooms, setRooms] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: ITEMS_PER_PAGE,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [currentPage, searchTerm]);

  const fetchRooms = async () => {

    try {

      setLoading(true);

      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
      };

      const response = await apiClient.get("/rooms/all", { params });

      const { rooms: fetchedRooms, pagination: pag } = response.data;

      setRooms(fetchedRooms || []);

      setPagination({
        currentPage: pag?.currentPage || 1,
        totalPages: pag?.totalPages || 1,
        totalItems: pag?.totalItems || 0,
        limit: pag?.limit || ITEMS_PER_PAGE,
        hasNext: pag?.hasNext || false,
        hasPrev: pag?.hasPrev || false,
      });

    } catch (error) {

      console.error("Error fetching rooms:", error);
      setRooms([]);

    } finally {

      setLoading(false);

    }
  };

  const handleStatusUpdate = async (roomId, status) => {

    try {

      await apiClient.put(`/rooms/${roomId}/status`, { status });
      fetchRooms();

    } catch (error) {

      console.error("Error updating room status:", error);

    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {

    const map = {
      available: "bg-green-100 text-green-700 border-green-200",
      occupied: "bg-red-100 text-red-700 border-red-200",
      reserved: "bg-blue-100 text-blue-700 border-blue-200",
      maintenance: "bg-orange-100 text-orange-700 border-orange-200",
    };

    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";

  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-lg text-slate-500 animate-pulse">
          Loading rooms...
        </div>
      </div>
    );
  }

  return (

    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rooms</h1>
          <p className="text-slate-500 mt-1">
            Manage and monitor hotel room status
          </p>
        </div>

        <div className="relative w-full md:w-96">

          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />

          <input
            type="text"
            placeholder="Search room number, type or status..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#C6A87C] focus:outline-none transition-all"
          />

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-slate-50">

            <tr>
              <th className="p-4 text-left">Room</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Capacity</th>
              <th className="p-4 text-left">Amenities</th>
              <th className="p-4 text-left">Action</th>
            </tr>

          </thead>

          <tbody>

            {rooms.length === 0 ? (

              <tr>
                <td colSpan={7} className="text-center p-10 text-gray-500">
                  No rooms found
                </td>
              </tr>

            ) : (

              rooms.map((room) => (

                <tr
                  key={room._id}
                  className="border-t hover:bg-slate-50 transition duration-200"
                >

                  <td className="p-4 font-semibold">{room.roomNumber}</td>

                  <td className="p-4">{room.roomType}</td>

                  <td className="p-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${getStatusColor(room.status)}`}
                    >
                      {room.status}
                    </span>
                  </td>

                  <td className="p-4 font-semibold">
                    ₹{Number(room.price || 0).toFixed(2)}
                  </td>

                  <td className="p-4">{room.capacity} guests</td>

                  <td className="p-4">
                    {room.amenities?.length
                      ? room.amenities.join(", ")
                      : "None"}
                  </td>

                  <td className="p-4">

                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setNewStatus(room.status);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-1.5 bg-[#C6A87C] text-white rounded-lg hover:shadow-md transition"
                    >
                      Update
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

        {/* Pagination */}

        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t gap-4">

          <p className="text-sm text-slate-600">
            Showing {rooms.length} of {pagination.totalItems} rooms
            {" • "} Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex gap-2">

            <button
              disabled={!pagination.hasPrev || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-2 text-sm border rounded-md hover:bg-slate-100 disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={!pagination.hasNext || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-2 text-sm border rounded-md hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* Modal */}

      {isModalOpen && selectedRoom && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">

          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">

            <h2 className="text-xl font-bold mb-6 text-center">
              Update Room Status
            </h2>

            <p className="text-center mb-6">
              Room <strong>{selectedRoom.roomNumber}</strong>
            </p>

            <select
              className="w-full border px-4 py-2 rounded-lg mb-6"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <div className="flex gap-4">

              <button
                className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="flex-1 bg-[#C6A87C] text-white rounded-lg py-2 hover:shadow-md"
                onClick={async () => {
                  await handleStatusUpdate(selectedRoom._id, newStatus);
                  setIsModalOpen(false);
                }}
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
};

