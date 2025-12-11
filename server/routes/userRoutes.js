const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Private
router.get('/doctors', protect, async (req, res) => {
    const { department, name, date } = req.query;
    let query = {};

    if (department) {
        // Assuming department is passed as ID. If name, need to look up Dept ID first.
        // For simplicity, let's assume frontend sends Dept ID or we filter after populate if it's name.
        // Let's assume ID for now as per schema ref.
        query.specialization = department;
    }

    if (name) {
        query.name = { $regex: name, $options: 'i' };
    }

    // Date filtering would typically involve checking availability, which is complex.
    // For this scope, we might just return doctors and let frontend filter or basic check.
    // The Doctor model has `schedule` which defines general availability (e.g. Mondays).
    // Specific date availability would require checking Appointments count vs slots.

    const doctors = await Doctor.find(query).populate('specialization', 'name');
    res.json(doctors);
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            age: user.age,
            role: user.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.age = req.body.age || user.age;
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: req.headers.authorization.split(' ')[1], // Return same token
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = router;
