import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <h1 className="text-5xl font-bold text-gray-800 mb-4 text-center">Hospital Token System</h1>
            <p className="text-xl text-gray-600 mb-12 text-center">Book your appointments hassle-free.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {/* Patient Card */}
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                    <h2 className="text-2xl font-bold text-primary mb-4 text-center">Patient</h2>
                    <p className="text-gray-600 mb-6 text-center">Book appointments and view history.</p>
                    <div className="flex flex-col gap-3">
                        <Link to="/login/user" className="w-full bg-primary text-white py-2 rounded-md text-center hover:bg-sky-600 transition">Login</Link>
                        <Link to="/register/user" className="w-full border border-primary text-primary py-2 rounded-md text-center hover:bg-sky-50 transition">Register</Link>
                    </div>
                </div>

                {/* Doctor Card */}
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                    <h2 className="text-2xl font-bold text-accent mb-4 text-center">Doctor</h2>
                    <p className="text-gray-600 mb-6 text-center">Manage appointments and schedule.</p>
                    <div className="flex flex-col gap-3">
                        <Link to="/login/doctor" className="w-full bg-accent text-white py-2 rounded-md text-center hover:bg-rose-600 transition">Login</Link>
                        <Link to="/register/doctor" className="w-full border border-accent text-accent py-2 rounded-md text-center hover:bg-rose-50 transition">Register</Link>
                    </div>
                </div>

                {/* Admin Card */}
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                    <h2 className="text-2xl font-bold text-secondary mb-4 text-center">Admin</h2>
                    <p className="text-gray-600 mb-6 text-center">Manage doctors and departments.</p>
                    <div className="flex flex-col gap-3">
                        <Link to="/login/admin" className="w-full bg-secondary text-white py-2 rounded-md text-center hover:bg-slate-600 transition">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
