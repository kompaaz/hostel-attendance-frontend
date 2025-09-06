const mongoose = require("mongoose");

let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;

const connectDB = async () => {
  try {
    if (isConnected) {
      console.log("✅ Reusing existing database connection");
      return;
    }

    const URI = process.env.MONGO_URI;
    if (!URI) {
      console.error("❌ MONGO_URI not defined in environment variables");
      throw new Error("MONGO_URI not defined");
    }

    // Remove deprecated options - just use the URI
    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on("connected", () => {
      isConnected = true;
      connectionRetries = 0;
      console.log("✅ MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      isConnected = false;

      if (connectionRetries < MAX_RETRIES) {
        connectionRetries++;
        console.log(`🔄 Attempting reconnect (${connectionRetries}/${MAX_RETRIES})...`);
        setTimeout(connectDB, 5000);
      }
    });

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);

    if (connectionRetries < MAX_RETRIES) {
      connectionRetries++;
      console.log(`🔄 Retrying connection in 5 seconds (${connectionRetries}/${MAX_RETRIES})...`);
      setTimeout(connectDB, 5000);
    } else {
      console.error("❌ Max connection retries reached. Exiting...");
      process.exit(1);
    }
  }
};

module.exports = connectDB;