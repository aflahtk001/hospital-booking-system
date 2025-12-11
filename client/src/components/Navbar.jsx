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
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center text-primary font-bold text-xl">
                            HospitalToken
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-gray-700">Hello, {user.name}</span>
                                {user.role === 'user' && <Link to="/dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>}
                                {user.role === 'doctor' && <Link to="/doctor-dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>}
                                {user.role === 'admin' && <Link to="/admin-dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>}
                                <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-primary">Login</Link>
                                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-sky-600">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
