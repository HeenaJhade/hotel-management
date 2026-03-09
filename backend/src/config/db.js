const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUrl = `${process.env.MONGO_URL}/${process.env.DB_NAME}`;
    await mongoose.connect(mongoUrl, {
      // useNewUrlParser: true,        // no longer needed in mongoose ≥6
      // useUnifiedTopology: true,    // no longer needed
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;