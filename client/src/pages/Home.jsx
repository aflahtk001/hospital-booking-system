import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-gray-800 transition-colors duration-300 flex items-center justify-center">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                        Hospital Booking
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto font-light">
                        Book appointments with ease. Manage your healthcare schedule seamlessly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/login" className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all shadow-lg shadow-primary/30 w-full sm:w-auto">
                            Sign In
                        </Link>
                        <Link to="/register" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all w-full sm:w-auto">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
