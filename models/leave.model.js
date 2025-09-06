const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // student who applied
        required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },

    status: {
        type: String,
        enum: ["pending", "approved_by_director", "rejected"],
        default: "pending",
    },

    rejectionReason: { type: String }, // only if rejected

    director: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // who approved/rejected
    },

    assignedAD: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // AD for the student
    },

    appliedAt: { type: Date, default: Date.now },
    approvedByDirector: { type: Boolean, default: false },
    checkedByAD: { type: Boolean, default: false },
});

module.exports = mongoose.model("Leave", leaveSchema);
