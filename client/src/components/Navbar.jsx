import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gmailGray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xl">H</span>
                            </div>
                            <span className="text-gmailGray-900 font-medium text-xl">Hospital Booking</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <span className="text-gmailGray-700 text-sm">Hello, <span className="font-medium">{user.name}</span></span>
                                {user.role === 'user' && <Link to="/dashboard" className="text-gmailGray-700 hover:text-secondary font-medium">Dashboard</Link>}
                                {user.role === 'doctor' && <Link to="/doctor-dashboard" className="text-gmailGray-700 hover:text-secondary font-medium">Dashboard</Link>}
                                {user.role === 'admin' && <Link to="/admin-dashboard" className="text-gmailGray-700 hover:text-secondary font-medium">Dashboard</Link>}
                                <button onClick={handleLogout} className="text-gmailGray-700 hover:text-primary font-medium">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gmailGray-700 hover:text-secondary font-medium">Sign in</Link>
                                <Link to="/register" className="gmail-btn-primary">Get started</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
