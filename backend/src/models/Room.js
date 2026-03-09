const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true,
    unique: true,
    trim: true 
  },
  roomType: { 
    type: String, 
    required: true,
    enum: ['Single', 'Double', 'Deluxe', 'Suite'], // optional: restrict values
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  amenities: [{ 
    type: String 
  }],
  description: { 
    type: String,
    trim: true 
  },
  capacity: { 
    type: Number, 
    required: true,
    min: 1 
  },
  imageUrl: { 
    type: String,
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  collection: 'rooms',
  timestamps: true // adds updatedAt automatically
});

module.exports = mongoose.model('Room', roomSchema);