import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-white to-gmailGray-50 p-4">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-white font-bold text-4xl">H</span>
            </div>
            <h1 className="text-5xl font-bold text-gmailGray-900 mb-4 text-center">Hospital Booking System</h1>
            <p className="text-xl text-gmailGray-600 mb-12 text-center max-w-2xl">Book your appointments hassle-free with our streamlined system.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {/* Patient Card */}
                <div className="gmail-card hover:shadow-md transition">
                    <h2 className="text-2xl font-semibold text-secondary mb-4 text-center">Patient</h2>
                    <p className="text-gmailGray-600 mb-6 text-center">Book appointments and view history.</p>
                    <div className="flex flex-col gap-3">
                        <Link to="/login/user" className="gmail-btn-secondary w-full text-center">Sign in</Link>
                        <Link to="/register/user" className="w-full border-2 border-secondary text-secondary py-2 rounded-md text-center hover:bg-blue-50 transition font-medium">Register</Link>
                    </div>
                </div>

                {/* Doctor Card */}
                <div className="gmail-card hover:shadow-md transition">
                    <h2 className="text-2xl font-semibold text-accent mb-4 text-center">Doctor</h2>
                    <p className="text-gmailGray-600 mb-6 text-center">Manage appointments and schedule.</p>
                    <div className="flex flex-col gap-3">
                        <Link to="/login/doctor" className="w-full bg-accent text-white py-2 rounded-md text-center hover:bg-green-700 transition font-medium">Sign in</Link>
                        <Link to="/register/doctor" className="w-full border-2 border-accent text-accent py-2 rounded-md text-center hover:bg-green-50 transition font-medium">Register</Link>
                    </div>
                </div>

                {/* Admin Card */}
                <div className="gmail-card hover:shadow-md transition">
                    <h2 className="text-2xl font-semibold text-primary mb-4 text-center">Admin</h2>
                    <p className="text-gmailGray-600 mb-6 text-center">Manage doctors and departments.</p>
                    <div className="flex flex-col gap-3">
                        <Link to="/login/admin" className="gmail-btn-primary w-full text-center">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
