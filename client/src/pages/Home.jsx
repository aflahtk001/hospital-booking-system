import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-appleGray-800 transition-colors duration-300">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-6xl md:text-7xl font-bold text-appleGray-900 dark:text-white mb-6 tracking-tight">
                        Hospital Booking
                    </h1>
                    <p className="text-xl md:text-2xl text-appleGray-600 dark:text-appleGray-300 mb-12 max-w-3xl mx-auto font-light">
                        Book appointments with ease. Manage your healthcare schedule seamlessly.
                    </p>
                </div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
                    {/* Patient Card */}
                    <div className="apple-card hover:shadow-lg transition-shadow duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-appleGray-900 dark:text-white mb-3">Patient</h2>
                            <p className="text-appleGray-600 dark:text-appleGray-300 mb-6">
                                Book appointments and manage your health
                            </p>
                            <div className="space-y-3">
                                <Link to="/login/user" className="block apple-btn-primary text-center">
                                    Sign in
                                </Link>
                                <Link to="/register/user" className="block apple-btn-secondary text-center">
                                    Register
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Card */}
                    <div className="apple-card hover:shadow-lg transition-shadow duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-accent to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-appleGray-900 dark:text-white mb-3">Doctor</h2>
                            <p className="text-appleGray-600 dark:text-appleGray-300 mb-6">
                                Manage appointments and schedules
                            </p>
                            <div className="space-y-3">
                                <Link to="/login/doctor" className="block apple-btn-primary text-center">
                                    Sign in
                                </Link>
                                <Link to="/register/doctor" className="block apple-btn-secondary text-center">
                                    Register
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Admin Card */}
                    <div className="apple-card hover:shadow-lg transition-shadow duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-appleGray-900 dark:text-white mb-3">Admin</h2>
                            <p className="text-appleGray-600 dark:text-appleGray-300 mb-6">
                                Manage system and operations
                            </p>
                            <div className="space-y-3">
                                <Link to="/login/admin" className="block apple-btn-primary text-center">
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
