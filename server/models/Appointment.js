const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
    date: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true,
    },
    tokenNumber: {
        type: Number,
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rejected'],
    },
    // Advanced Queue Fields
    queueStatus: {
        type: String,
        default: 'Pending', // Pending -> Approved (in queue) -> Active (serving) -> Completed/Skipped
        enum: ['Pending', 'Approved', 'Active', 'Completed', 'Skipped', 'Cancelled'],
    },
    startTime: Date, // When status became Active
    endTime: Date,   // When status became Completed
    skipReason: String,
    isEmergency: {
        type: Boolean,
        default: false,
    },
    estimatedDuration: {
        type: Number, // In minutes, override default if needed
    },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
