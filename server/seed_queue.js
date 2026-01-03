const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Department = require('./models/Department');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_booking');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedQueueData = async () => {
    await connectDB();

    try {
        // 1. Clear Appointments but keep Users/Doctors if possible, OR clear all for clean slate.
        // Let's clear Appointments only for this doctor to be safe, or just clear all appointments.
        await Appointment.deleteMany({});
        console.log('Cleared all appointments');

        // 2. Get the specific doctor (Dr. Smith from seed) or just the first doctor
        const doctor = await Doctor.findOne({});
        if (!doctor) {
            console.error('No doctors found. Please run seed.js first.');
            process.exit(1);
        }
        console.log(`Seeding queue for Doctor: ${doctor.name}`);

        // 3. Create Users if needed (or reuse)
        // Let's create a few dummy users
        const users = [];
        for (let i = 1; i <= 5; i++) {
            let user = await User.findOne({ email: `patient${i}@test.com` });
            if (!user) {
                user = await User.create({
                    name: `Patient ${i}`,
                    email: `patient${i}@test.com`,
                    password: 'password',
                    role: 'user',
                    age: 20 + i,
                    phone: '1234567890'
                });
            }
            users.push(user);
        }

        // 4. Create Appointments in various states
        const today = new Date();
        today.setHours(9, 0, 0, 0); // Start at 9 AM today

        // Active Patient (Token 1)
        await Appointment.create({
            user: users[0]._id,
            doctor: doctor._id,
            date: today,
            timeSlot: '09:00',
            status: 'Confirmed',
            queueStatus: 'Active',
            tokenNumber: 1,
            startTime: new Date()
        });

        // Approved Patients (In Queue - Token 2, 3)
        await Appointment.create({
            user: users[1]._id,
            doctor: doctor._id,
            date: today,
            timeSlot: '09:30',
            status: 'Confirmed',
            queueStatus: 'Approved',
            tokenNumber: 2
        });

        await Appointment.create({
            user: users[2]._id,
            doctor: doctor._id,
            date: today,
            timeSlot: '10:00',
            status: 'Confirmed',
            queueStatus: 'Approved',
            tokenNumber: 3
        });

        // Pending Patients (For "Pending Approvals" list)
        await Appointment.create({
            user: users[3]._id,
            doctor: doctor._id,
            date: today,
            timeSlot: '10:30',
            status: 'Pending',
            queueStatus: 'Pending'
        });

        // Update Doctor Queue State
        doctor.queueState = {
            isPaused: false,
            currentActiveToken: 1,
            averageConsultationTime: 15
        };
        await doctor.save();

        console.log('Queue Seeded Successfully!');
        console.log('- Active: Token 1');
        console.log('- In Queue: Token 2, 3');
        console.log('- Pending Approval: 1 Patient');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedQueueData();
