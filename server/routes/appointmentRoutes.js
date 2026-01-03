const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const nodemailer = require('nodemailer');

// Mock Email Sender
const sendConfirmationEmail = async (email, appointment) => {
    console.log(`Sending email to ${email} for appointment ${appointment._id}`);
    // In a real app, configure transporter
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ ... });
};

// @desc    Book an appointment
// @route   POST /api/appointments/book
// @access  Private
router.post('/book', protect, async (req, res) => {
    const { doctorId, date, timeSlot, departmentId } = req.body;

    // Check if slot is available (basic check)
    // Ideally check if another appointment exists for same doctor, date, timeSlot
    // For now, let's assume multiple people can't book exact same slot if we enforce it, 
    // or maybe slots are generic. Let's enforce uniqueness for simplicity if needed, 
    // or just allow it and let admin manage.
    // Requirement: "Select a doctor, date, and available time slot".

    const appointment = await Appointment.create({
        user: req.user._id,
        doctor: doctorId,
        department: departmentId,
        date,
        timeSlot,
        status: 'Pending' // Default is pending
    });

    if (appointment) {
        // Notify (Mock)
        // sendConfirmationEmail(req.user.email, appointment); 

        res.status(201).json(appointment);
    } else {
        res.status(400);
        throw new Error('Invalid appointment data');
    }
});

// @desc    Get my appointments
// @route   GET /api/appointments/my
// @access  Private
router.get('/my', protect, async (req, res) => {
    const appointments = await Appointment.find({ user: req.user._id })
        .populate('doctor', 'name queueState') // Get doctor's queue state
        .populate('department', 'name')
        .sort({ date: -1 });

    // Calculate dynamic queue info for each appointment
    const appointmentsWithQueue = await Promise.all(appointments.map(async (apt) => {
        const aptObj = apt.toObject();

        if (apt.queueStatus === 'Approved' || apt.status === 'Pending') {
            const startOfDay = new Date(apt.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(apt.date);
            endOfDay.setHours(23, 59, 59, 999);

            // Count approved people ahead
            const peopleAhead = await Appointment.countDocuments({
                doctor: apt.doctor._id,
                date: { $gte: startOfDay, $lte: endOfDay },
                queueStatus: { $in: ['Approved', 'Active'] },
                tokenNumber: { $lt: apt.tokenNumber || 999999 }
            });

            // Avg time from doctor status or default 15
            const avgTime = apt.doctor.queueState?.averageConsultationTime || 15;

            aptObj.peopleAhead = peopleAhead;
            aptObj.estimatedWaitTime = peopleAhead * avgTime;
        }

        return aptObj;
    }));

    res.json(appointmentsWithQueue);
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        if (appointment.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        appointment.status = 'Cancelled';
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
router.put('/:id/reschedule', protect, async (req, res) => {
    const { date, timeSlot } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        if (appointment.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        appointment.date = date;
        appointment.timeSlot = timeSlot;
        appointment.status = 'Pending'; // Reset to pending on reschedule? Usually yes.

        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

module.exports = router;
