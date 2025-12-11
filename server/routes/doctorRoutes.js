const express = require('express');
const router = express.Router();
const { protect, doctor } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private/Doctor
router.get('/profile', protect, doctor, async (req, res) => {
    const doctorProfile = await Doctor.findById(req.user._id).populate('specialization', 'name');
    if (doctorProfile) {
        res.json(doctorProfile);
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});

// @desc    Get doctor's appointments
// @route   GET /api/doctors/appointments/upcoming
// @access  Private/Doctor
router.get('/appointments/upcoming', protect, doctor, async (req, res) => {
    const appointments = await Appointment.find({ doctor: req.user._id })
        .populate('user', 'name email phone age')
        .sort({ date: 1, tokenNumber: 1 });
    res.json(appointments);
});

// @desc    Update doctor schedule
// @route   PUT /api/doctors/schedule
// @access  Private/Doctor
router.put('/schedule', protect, doctor, async (req, res) => {
    const doctor = await Doctor.findById(req.user._id);

    if (doctor) {
        doctor.schedule = req.body.schedule || doctor.schedule;
        const updatedDoctor = await doctor.save();
        res.json(updatedDoctor);
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});

// @desc    Update appointment status (Doctor)
// @route   PUT /api/doctors/appointments/:id/status
// @access  Private/Doctor
router.put('/appointments/:id/status', protect, doctor, async (req, res) => {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        // Ensure the appointment belongs to this doctor
        if (appointment.doctor.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this appointment');
        }

        appointment.status = status;

        if (status === 'Confirmed' && !appointment.tokenNumber) {
            // Find max token for this doctor on this date
            const startOfDay = new Date(appointment.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(appointment.date);
            endOfDay.setHours(23, 59, 59, 999);

            const lastAppointment = await Appointment.findOne({
                doctor: appointment.doctor,
                date: { $gte: startOfDay, $lte: endOfDay },
                tokenNumber: { $exists: true }
            }).sort({ tokenNumber: -1 });

            appointment.tokenNumber = lastAppointment ? lastAppointment.tokenNumber + 1 : 1;
        }

        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

module.exports = router;
