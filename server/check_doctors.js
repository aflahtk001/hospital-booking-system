const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const dotenv = require('dotenv');

dotenv.config();

const checkDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const doctors = await Doctor.find({});
        console.log('Doctors found:', doctors.length);
        doctors.forEach(d => console.log(`- ${d.email} (${d.name})`));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDoctors();
