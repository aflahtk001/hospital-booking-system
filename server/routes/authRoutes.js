const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get all departments (Public)
// @route   GET /api/auth/departments
router.get('/departments', asyncHandler(async (req, res) => {
    const departments = await Department.find({});
    res.json(departments);
}));

// @desc    Register a new user/doctor
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password, phone, age, role, specialization } = req.body;

    if (role === 'doctor') {
        const doctorExists = await Doctor.findOne({ email });
        if (doctorExists) {
            res.status(400);
            throw new Error('Doctor already exists');
        }

        const doctor = await Doctor.create({
            name,
            email,
            password,
            specialization, // Expecting ID
            schedule: [], // Empty initially
            role: 'doctor'
        });

        if (doctor) {
            res.status(201).json({
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                role: doctor.role,
                token: generateToken(doctor._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid doctor data');
        }

    } else {
        // User or Admin
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            age,
            role: role === 'admin' ? 'admin' : 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
}));

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password, role } = req.body; // role is optional, defaults to user check first

    // Check in User collection first
    let user = await User.findOne({ email });
    let isDoctor = false;

    if (!user) {
        // Check in Doctor collection
        user = await Doctor.findOne({ email });
        isDoctor = true;
    }

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
}));

module.exports = router;
