import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiSettings, FiHelpCircle, FiLogOut, FiX } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: FiGrid, label: 'Dashboard', path: user?.role === 'doctor' ? '/doctor-dashboard' : user?.role === 'admin' ? '/admin-dashboard' : '/dashboard' },
    ];

    return (
        <aside className={`
            fixed top-0 left-0 h-screen w-64 bg-sidebar border-r border-gray-100 z-50
            flex flex-col p-6 transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
            md:translate-x-0 md:shadow-none
        `}>
            {/* Logo & Close Mobile */}
            <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-primary relative">
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></div>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Donezo</span>
                </div>

                <button
                    onClick={onClose}
                    className="md:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                    <FiX className="w-6 h-6" />
                </button>
            </div>

            {/* Menu */}
            <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 mb-4 px-2 uppercase tracking-wider">Menu</p>
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </div>
                            {item.badge && (
                                <span className="bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-md">{item.badge}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
