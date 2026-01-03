import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import DarkModeContext from '../context/DarkModeContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">H</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-900 dark:text-white">Hospital</span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {user.name}
                                </span>
                                {user.role === 'user' && (
                                    <Link to="/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition">
                                        Dashboard
                                    </Link>
                                )}
                                {user.role === 'doctor' && (
                                    <Link to="/doctor-dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition">
                                        Dashboard
                                    </Link>
                                )}
                                {user.role === 'admin' && (
                                    <Link to="/admin-dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition">
                                        Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition">
                                    Sign in
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    Get started
                                </Link>
                            </>
                        )}

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? (
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
