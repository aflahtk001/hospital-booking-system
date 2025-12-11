const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Department = require('./models/Department');
const Appointment = require('./models/Appointment');
const bcrypt = require('bcryptjs');

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

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await User.deleteMany();
        await Doctor.deleteMany();
        await Department.deleteMany();
        await Appointment.deleteMany();

        console.log('Data Cleared');

        // Create Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword, // Manually hashing since we might bypass pre-save hook if using insertMany, but create uses save. 
            // Actually, the model has a pre-save hook to hash. 
            // If I pass hashed password, it might double hash if I'm not careful.
            // The model checks `isModified`. `create` triggers save.
            // Let's pass plain text and let the model hash it.
            // WAIT: The model hashes it. So I should pass '123456'.
            role: 'admin',
            phone: '1234567890',
            age: 30
        });

        // We need to re-fetch or just know that the model hashed it. 
        // Actually, if I pass the plain password to `create`, the pre-save hook will hash it.
        // BUT, I just hashed it above manually. 
        // Let's correct this: Pass plain text.

        // Re-do Admin creation correctly
        await User.deleteMany();
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin', // Using 'admin' as username in the email field
            password: 'admin@123',
            role: 'admin',
            phone: '1234567890',
            age: 30
        });

        console.log('Admin Created: admin@example.com / password123');

        // Create Department
        const cardio = await Department.create({ name: 'Cardiology' });
        const neuro = await Department.create({ name: 'Neurology' });

        console.log('Departments Created');

        // Create Doctor
        const doctor = await Doctor.create({
            name: 'Dr. Smith',
            email: 'doctor@example.com',
            password: 'password123',
            specialization: cardio._id,
            schedule: [
                { day: 'Monday', slots: ['09:00', '09:30', '10:00'] },
                { day: 'Wednesday', slots: ['14:00', '14:30'] }
            ],
            role: 'doctor'
        });

        console.log('Doctor Created: doctor@example.com / password123');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
