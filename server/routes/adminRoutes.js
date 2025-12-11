const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// --- Departments ---

// @desc    Create department
// @route   POST /api/admin/departments
// @access  Private/Admin
router.post('/departments', protect, admin, async (req, res) => {
    const { name } = req.body;
    const departmentExists = await Department.findOne({ name });
    if (departmentExists) {
        res.status(400);
        throw new Error('Department already exists');
    }
    const department = await Department.create({ name });
    res.status(201).json(department);
});

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private/Admin
router.get('/departments', protect, admin, async (req, res) => {
    const departments = await Department.find({});
    res.json(departments);
});

// @desc    Delete department
// @route   DELETE /api/admin/departments/:id
// @access  Private/Admin
router.delete('/departments/:id', protect, admin, async (req, res) => {
    const department = await Department.findById(req.params.id);
    if (department) {
        await department.deleteOne();
        res.json({ message: 'Department removed' });
    } else {
        res.status(404);
        throw new Error('Department not found');
    }
});

// --- Doctors ---

// @desc    Add new doctor
// @route   POST /api/admin/doctors
// @access  Private/Admin
router.post('/doctors', protect, admin, async (req, res) => {
    const { name, email, password, specialization, schedule } = req.body;

    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
        res.status(400);
        throw new Error('Doctor already exists');
    }

    const doctor = await Doctor.create({
        name,
        email,
        password,
        specialization,
        schedule,
    });

    if (doctor) {
        res.status(201).json({
            _id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
        });
    } else {
        res.status(400);
        throw new Error('Invalid doctor data');
    }
});

// @desc    Update doctor schedule (Admin)
// @route   PUT /api/admin/doctors/:id/schedule
// @access  Private/Admin
router.put('/doctors/:id/schedule', protect, admin, async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
        doctor.schedule = req.body.schedule || doctor.schedule;
        const updatedDoctor = await doctor.save();
        res.json(updatedDoctor);
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});

// @desc    Delete doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
router.delete('/doctors/:id', protect, admin, async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
        await doctor.deleteOne();
        res.json({ message: 'Doctor removed' });
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});

// --- Appointments ---

// @desc    Get all appointments (Admin)
// @route   GET /api/admin/appointments
// @access  Private/Admin
router.get('/appointments', protect, admin, async (req, res) => {
    const appointments = await Appointment.find({})
        .populate('user', 'name')
        .populate('doctor', 'name')
        .populate('department', 'name');
    res.json(appointments);
});

// @desc    Update appointment status
// @route   PUT /api/admin/appointments/:id/status
// @access  Private/Admin
// router.put('/appointments/:id/status', protect, admin, async (req, res) => {
//     // Logic moved to Doctor
//     res.status(400).json({ message: 'This action is now restricted to Doctors' });
// });

module.exports = router;
