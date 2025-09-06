const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    dNo: {
      type: String,
      required: true,
      trim: true,
    },
    accNo: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    block: { type: String, required: true, trim: true },
    roomNo: {
      type: String,
      required: true,
      trim: true,
    },
    religion: {
      type: String,
      trim: true,
      default: "Not Specified",
    },
    parentNo: {
      type: String,
    },
    studentNo: {
      type: String,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["student"], required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
