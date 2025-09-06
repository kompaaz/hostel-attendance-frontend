const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["director", "ad", "admin"], required: true },
  roomsIncharge: [
    {
      block: { type: String, required: true },
      hall: { type: [String], default: [] }, // optional hall list
      from: { type: Number }, // start room number
      to: { type: Number },   // end room number
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
