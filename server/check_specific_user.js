const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_booking');
        console.log('MongoDB Connected');

        const user = await User.findOne({ email: 'p1@gmail.com' });
        if (user) {
            console.log(`User found: ${user.email}`);
        } else {
            console.log('User p1@gmail.com NOT found');
        }

        // List all users to be sure
        const allUsers = await User.find({});
        console.log('All users:', allUsers.map(u => u.email));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
