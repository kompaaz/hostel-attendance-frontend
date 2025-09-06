const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now, // "YYYY-MM-DD"
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: String, // "general" or "mass"
  records: [
    {
      name: String,
      roomNo: String,
      accountNumber: String,
      status: String, // "present" or "absent"
    },
  ],
});

module.exports = mongoose.model("attendance", attendanceSchema);
