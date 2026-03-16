import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

/* ===============================
   CREATE ROOM
================================ */

export const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      price,
      description,
      capacity,
      amenities,
      imageUrl,
    } = req.body;

    if (!roomNumber || !roomType || !price || !capacity) {
      return res.status(400).json({ detail: "Required fields missing" });
    }

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ detail: "Room number already exists" });
    }

    const room = await Room.create({
      roomNumber: roomNumber.trim(),
      roomType: roomType.trim(),
      price: Number(price),
      description: description?.trim() || "",
      capacity: Number(capacity),
      amenities: Array.isArray(amenities)
  ? amenities
  : amenities
    ? amenities.split(",").map((a) => a.trim()).filter(Boolean)
    : [],
      imageUrl: imageUrl || null,
      status: "available",
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create Room Error:", error);
    res.status(500).json({ detail: "Failed to create room" });
  }
};

/* ===============================
   UPDATE ROOM
================================ */

export const updateRoom = async (req, res) => {
  try {
    const allowedFields = [
      "roomNumber",
      "roomType",
      "price",
      "description",
      "capacity",
      "amenities",
      "status",
      "imageUrl",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "amenities") {
          updateData[field] = req.body[field]
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);
        } else if (field === "price" || field === "capacity") {
          updateData[field] = Number(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ detail: "No data to update" });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ detail: "Room not found" });
    }

    res.json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.error("Update Room Error:", error);
    res.status(500).json({ detail: "Failed to update room" });
  }
};

/* ===============================
   GET ALL ROOMS
================================ */

export const getAvailableRooms = async (req, res) => {
  try {
    const { roomType, checkIn, checkOut } = req.query;

    // Base query
    const query = {};
    if (roomType && roomType !== "all") {
      query.roomType = roomType;
    }

    // Fetch all rooms matching type
    let rooms = await Room.find(query).lean();

    // ──────────────── Date filtering ────────────────
    if (checkIn || checkOut) {
      const start = checkIn ? new Date(checkIn) : null;
      const end = checkOut ? new Date(checkOut) : null;

      if ((start && isNaN(start)) || (end && isNaN(end))) {
        return res.status(400).json({ detail: "Invalid date format" });
      }

      // Build booking query to find overlapping bookings
      const bookingQuery = {};
      if (start && end) {
        // Both check-in and check-out provided
        bookingQuery.checkIn = { $lt: end };   // booking starts before end
        bookingQuery.checkOut = { $gt: start }; // booking ends after start
      } else if (start) {
        // Only check-in provided → exclude rooms that are booked after this date
        bookingQuery.checkOut = { $gt: start };
      } else if (end) {
        // Only check-out provided → exclude rooms that are booked before this date
        bookingQuery.checkIn = { $lt: end };
      }

      const overlappingBookings = await Booking.find(bookingQuery)
        .select("roomId")
        .lean();

      const bookedIds = new Set(overlappingBookings.map(b => b.roomId.toString()));

      // Exclude booked rooms
      rooms = rooms.filter(room => !bookedIds.has(room._id.toString()));
    }

    res.json({ rooms });
  } catch (error) {
    console.error("Get Available Rooms Error:", error);
    res.status(500).json({ detail: "Failed to fetch rooms" });
  }
};

/* ===============================
   GET ROOM BY ID
================================ */

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ detail: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    console.error("Get Room Error:", error);
    res.status(500).json({ detail: "Failed to get room" });
  }
};

/* ===============================
   DELETE ROOM
================================ */

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.roomId);
    if (!room) {
      return res.status(404).json({ detail: "Room not found" });
    }

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete Room Error:", error);
    res.status(500).json({ detail: "Failed to delete room" });
  }
};



export const updateRoomStatus = async (req, res) => {
  const { roomId } = req.params;
  const { status } = req.body;

  // Must match schema exactly
  const allowedStatuses = ['available', 'occupied', 'reserved', 'maintenance'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid room status'
    });
  }

  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { status },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Room status updated successfully',
      data: room
    });

  } catch (error) {
    console.error('[updateRoomStatus]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update room status'
    });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    let { 
      page = 1, 
      limit = 10, 
      search = '' 
    } = req.query;

    page  = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const query = {};

    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { roomNumber: searchRegex },
        { roomType:   searchRegex },
        { status:     searchRegex },
      ];
    }

    // You can add more filters later (e.g. by status, type, min price...)

    const rooms = await Room.find(query)
      .sort({ roomNumber: 1 })          // or { createdAt: -1 } — your choice
      .skip(skip)
      .limit(limit)
      .lean();                          // faster response

    const total = await Room.countDocuments(query);

    res.status(200).json({
      success: true,
      rooms,
      pagination: {
        currentPage: page,
        totalPages:  Math.ceil(total / limit),
        totalItems:  total,
        limit,
        hasNext:     skip + rooms.length < total,
        hasPrev:     page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
};

export const isRoomAvailable = async (roomId, checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkOutDate <= checkInDate) {
    throw new Error("Check-out must be after check-in");
  }

  // Find any booking that overlaps the requested dates
  const overlappingBooking = await Booking.findOne({
    roomId,
    status: { $in: ["confirmed", "checked_in"] }, // only active bookings
    $or: [
      {
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      },
    ],
  });

  return !overlappingBooking; // true if room is available
};

export const checkAvailability = async (req, res) => {
  const { roomId } = req.params;
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ detail: "Check-in and check-out dates are required" });
  }

  try {
    const available = await isRoomAvailable(roomId, checkIn, checkOut);
    res.json({ roomId, available });
  } catch (err) {
    console.error("Room availability check error:", err);
    res.status(500).json({ detail: "Failed to check room availability" });
  }
};
