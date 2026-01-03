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
// @desc    Update appointment status (Doctor)
// @route   PUT /api/doctors/appointments/:id/status
// @access  Private/Doctor
router.put('/appointments/:id/status', protect, doctor, async (req, res) => {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        if (appointment.doctor.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        // Logic for Pending -> Approved (Enters Queue)
        if (status === 'Confirmed' && appointment.status !== 'Confirmed') {
            appointment.status = 'Confirmed';
            appointment.queueStatus = 'Approved';

            // Assign Token if not exists
            if (!appointment.tokenNumber) {
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
        } else if (status === 'Rejected') {
            appointment.status = 'Rejected';
            appointment.queueStatus = 'Cancelled';
        }

        const updatedAppointment = await appointment.save();

        // Emit update
        req.io.emit('queue_update', {
            doctorId: appointment.doctor,
            appointmentId: appointment._id,
            status: updatedAppointment.status,
            queueStatus: updatedAppointment.queueStatus,
            tokenNumber: updatedAppointment.tokenNumber
        });

        res.json(updatedAppointment);
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Call Next Patient
// @route   PUT /api/doctors/queue/next
// @access  Private/Doctor
router.put('/queue/next', protect, doctor, async (req, res) => {
    // 1. Find currently Active appointment -> Mark Completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const currentActive = await Appointment.findOne({
        doctor: req.user._id,
        date: { $gte: today, $lt: tomorrow },
        queueStatus: 'Active'
    });

    if (currentActive) {
        currentActive.queueStatus = 'Completed';
        currentActive.status = 'Completed';
        currentActive.endTime = new Date();
        await currentActive.save();
    }

    // 2. Find next Approved appointment -> Mark Active
    const nextPatient = await Appointment.findOne({
        doctor: req.user._id,
        date: { $gte: today, $lt: tomorrow },
        queueStatus: 'Approved'
    }).sort({ isEmergency: -1, tokenNumber: 1 });

    if (nextPatient) {
        nextPatient.queueStatus = 'Active';
        nextPatient.status = 'In_Progress'; // UI Friendly status
        nextPatient.startTime = new Date();
        await nextPatient.save();

        // Update Doctor State
        await Doctor.findByIdAndUpdate(req.user._id, {
            'queueState.currentActiveToken': nextPatient.tokenNumber
        });

        // Broadcast Global Queue Update
        req.io.emit('queue_update', {
            doctorId: req.user._id,
            activeToken: nextPatient.tokenNumber,
            status: 'Next Called'
        });

        res.json({ message: 'Next patient called', activeToken: nextPatient.tokenNumber });
    } else {
        // No more patients
        await Doctor.findByIdAndUpdate(req.user._id, {
            'queueState.currentActiveToken': 0
        });

        req.io.emit('queue_update', {
            doctorId: req.user._id,
            activeToken: 0,
            status: 'Queue Empty'
        });

        res.json({ message: 'Queue is empty' });
    }
});

// @desc    Skip Current Patient
// @route   PUT /api/doctors/queue/skip
// @access  Private/Doctor
router.put('/queue/skip', protect, doctor, async (req, res) => {
    const { reason } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const currentActive = await Appointment.findOne({
        doctor: req.user._id,
        date: { $gte: today, $lt: tomorrow },
        queueStatus: 'Active'
    });

    if (currentActive) {
        currentActive.queueStatus = 'Skipped';
        currentActive.skipReason = reason || 'No reason provided';
        await currentActive.save();

        // Automatically call next? Or let doctor click Next again?
        // Requirement says "Skip Token option". Usually implies moving on.
        // Let's reuse logic or just clear active. For safety, just clear active so doctor has to click Next.

        await Doctor.findByIdAndUpdate(req.user._id, {
            'queueState.currentActiveToken': 0
        });

        req.io.emit('queue_update', {
            doctorId: req.user._id,
            activeToken: 0,
            status: 'Patient Skipped'
        });

        res.json({ message: 'Patient skipped' });
    } else {
        res.status(400).json({ message: 'No active patient to skip' });
    }
});
// @desc    Insert Emergency Patient
// @route   POST /api/doctors/queue/emergency
// @access  Private/Doctor
router.post('/queue/emergency', protect, doctor, async (req, res) => {
    const User = require('../models/User'); // Import User model

    // 1. Find or Create Dummy Emergency User
    let emergencyUser = await User.findOne({ email: 'emergency@system.local' });
    if (!emergencyUser) {
        emergencyUser = await User.create({
            name: 'Emergency Patient',
            email: 'emergency@system.local',
            password: 'emergency_pass_secure', // Dummy password
            role: 'patient',
            age: 0,
            phone: '0000000000'
        });
    }

    // 2. Create Emergency Appointment
    const today = new Date();
    // Assign a token number (at the end of sequence, but prioritized by sorting)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const lastAppointment = await Appointment.findOne({
        doctor: req.user._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        tokenNumber: { $exists: true }
    }).sort({ tokenNumber: -1 });

    const tokenNumber = lastAppointment ? lastAppointment.tokenNumber + 1 : 1;

    const appointment = await Appointment.create({
        user: emergencyUser._id,
        doctor: req.user._id,
        date: today,
        timeSlot: 'EMERGENCY',
        status: 'Confirmed',
        queueStatus: 'Approved',
        tokenNumber: tokenNumber,
        isEmergency: true, // This flag puts it at the top of the queue
        estimatedDuration: 15
    });

    // 3. Emit Update
    req.io.emit('queue_update', {
        doctorId: req.user._id,
        status: 'Emergency Patient Added',
        queueStatus: 'Approved'
    });

    res.json({ message: 'Emergency patient added to queue', appointment });
});

module.exports = router;
