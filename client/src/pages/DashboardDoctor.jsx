import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../components/DashboardLayout';
import { FiArrowUpRight, FiUsers, FiClock, FiCalendar } from 'react-icons/fi';

const DashboardDoctor = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSchedule, setCurrentSchedule] = useState([]);

    // Schedule Form
    const [day, setDay] = useState('Monday');
    const [slots, setSlots] = useState('');
    const [scheduleLoading, setScheduleLoading] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchData = async () => {
        try {
            const appts = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctors/appointments/upcoming`, config);
            setAppointments(appts.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSchedule = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctors/profile`, config);
            setCurrentSchedule(data.schedule || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchData(), fetchSchedule()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        setScheduleLoading(true);
        try {
            // Check if day already exists in schedule
            const existingDayIndex = currentSchedule.findIndex(s => s.day === day);
            let updatedSchedule;

            if (existingDayIndex >= 0) {
                // Update existing day
                updatedSchedule = [...currentSchedule];
                updatedSchedule[existingDayIndex] = {
                    day,
                    slots: slots.split(',').map(s => s.trim()).filter(s => s)
                };
            } else {
                // Add new day
                updatedSchedule = [
                    ...currentSchedule,
                    {
                        day,
                        slots: slots.split(',').map(s => s.trim()).filter(s => s)
                    }
                ];
            }

            await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/schedule`, { schedule: updatedSchedule }, config);
            toast.success(`Schedule ${existingDayIndex >= 0 ? 'updated' : 'added'} for ${day}`);
            setSlots('');
            await fetchSchedule();
        } catch (error) {
            toast.error('Failed to update schedule');
        } finally {
            setScheduleLoading(false);
        }
    };

    const handleRemoveDay = async (dayToRemove) => {
        if (!window.confirm(`Remove schedule for ${dayToRemove}?`)) return;
        try {
            const updatedSchedule = currentSchedule.filter(s => s.day !== dayToRemove);
            await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/schedule`, { schedule: updatedSchedule }, config);
            toast.success(`Removed schedule for ${dayToRemove}`);
            await fetchSchedule();
        } catch (error) {
            toast.error('Failed to remove schedule');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/appointments/${id}/status`, { status }, config);
            toast.success(`Appointment ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
            console.error(error);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
                <p className="text-gray-500">Manage your appointments and schedule efficiently.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="modern-card bg-primary text-white border-none">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FiUsers className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-emerald-100 text-xs font-semibold bg-white/10 px-2 py-1 rounded">+12%</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{appointments.length}</div>
                    <div className="text-emerald-100 text-sm">Total Appointments</div>
                </div>

                <div className="modern-card">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FiClock className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-gray-900">{appointments.filter(a => a.status === 'Pending').length}</div>
                    <div className="text-gray-500 text-sm">Pending Requests</div>
                </div>

                <div className="modern-card">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <FiCalendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-gray-900">{currentSchedule.length}</div>
                    <div className="text-gray-500 text-sm">Active Schedule Days</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appointments List */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                        <button className="text-primary text-sm font-semibold hover:underline">View All</button>
                    </div>
                    <div className="modern-card p-0 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {appointments.map((appt) => (
                                <li key={appt._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                {appt.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">
                                                    {appt.user?.name} <span className="text-gray-400 font-normal text-xs">({appt.user?.age} yrs)</span>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md
                        ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                    appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {appt.status}
                                            </span>

                                            {appt.status === 'Pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(appt._id, 'Confirmed')}
                                                        className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600 transition-colors shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(appt._id, 'Rejected')}
                                                        className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {appointments.length === 0 && <li className="p-6 text-center text-gray-500">No appointments found.</li>}
                        </ul>
                    </div>
                </div>

                {/* Schedule Management */}
                <div className="space-y-8">
                    {/* Schedule Manager */}
                    <div className="modern-card">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Manage Schedule</h3>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Weekly Recurring</span>
                        </div>

                        {/* Current Schedule Chips */}
                        {currentSchedule.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {currentSchedule.map((sch) => (
                                    <div key={sch.day} className="group relative bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 hover:border-primary transition-colors cursor-default">
                                        <div className="flex justify-between items-center gap-3">
                                            <span className="font-semibold text-gray-900">{sch.day}</span>
                                            <button
                                                onClick={() => handleRemoveDay(sch.day)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{sch.slots.length} Slots</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add/Update Schedule Form */}
                        <form onSubmit={handleUpdateSchedule} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">Select Day</label>
                                <select
                                    className="modern-input"
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                >
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">Available Slots</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 09:00, 09:30, 10:00"
                                    className="modern-input"
                                    value={slots}
                                    onChange={(e) => setSlots(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Comma separated times (24h format recommended)</p>
                            </div>
                            <button type="submit" disabled={scheduleLoading} className="w-full btn-primary mt-2">
                                {scheduleLoading ? <LoadingSpinner size="small" color="border-white" /> : 'Save Availability'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardDoctor;
