// connection to database

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI?.trim();

    if (!mongoUri) {
      const memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      console.log("Using in-memory MongoDB for development");
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const errorMessage = error?.message || String(error);

    if (process.env.NODE_ENV !== "production") {
      try {
        const memoryServer = await MongoMemoryServer.create();
        const conn = await mongoose.connect(memoryServer.getUri());
        console.warn("MongoDB authentication failed. Falling back to in-memory MongoDB for development.");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (memoryError) {
        console.error(`Fallback DB connection failed: ${memoryError.message}`);
        process.exit(1);
      }
    }

    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
};

module.exports = connectDB;
