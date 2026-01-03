import React, { useContext } from 'react';
import { FiSearch, FiBell, FiMail, FiMenu } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';

const Topbar = ({ onMenuClick }) => {
    const { user } = useContext(AuthContext);

    return (
        <header className="flex items-center justify-between py-4 px-4 md:py-6 md:px-8 bg-[#F3F4F6] sticky top-0 z-30">
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
                <FiMenu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-lg relative hidden md:block ml-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-0 sm:text-sm shadow-sm"
                    placeholder="Search task"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs shadow-sm bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">⌘ F</span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 ml-auto">
                <button className="relative p-2 rounded-full bg-white text-gray-400 hover:text-gray-500 hover:bg-gray-50 shadow-sm transition-colors">
                    <span className="sr-only">Messages</span>
                    <FiMail className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>

                <button className="relative p-2 rounded-full bg-white text-gray-400 hover:text-gray-500 hover:bg-gray-50 shadow-sm transition-colors">
                    <span className="sr-only">View notifications</span>
                    <FiBell className="h-5 w-5" />
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-2">
                    <div className="flex flex-col items-end hidden sm:block">
                        <span className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</span>
                        <span className="text-xs text-gray-500">{user?.email || 'email@example.com'}</span>
                    </div>
                    <img
                        className="h-10 w-10 rounded-full border-2 border-white shadow-sm object-cover"
                        src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                        alt=""
                    />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
