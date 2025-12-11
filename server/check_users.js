const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_booking');
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log('Users found:', users.length);
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));

        const patient = await User.findOne({ email: 'patient@test.com' });
        if (!patient) {
            console.log('Creating test patient...');
            const newUser = await User.create({
                name: 'Test Patient',
                email: 'patient@test.com',
                password: 'password123', // Model will hash this
                phone: '5555555555',
                age: 30,
                role: 'user'
            });
            console.log('Created user:', newUser.email);
        } else {
            console.log('Test patient already exists');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
