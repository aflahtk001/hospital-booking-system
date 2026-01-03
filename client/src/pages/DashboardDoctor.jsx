import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../components/DashboardLayout';
import { FiUsers, FiClock, FiCalendar, FiPlay, FiSkipForward, FiPause, FiAlertCircle } from 'react-icons/fi';

const DashboardDoctor = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useSocket();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSchedule, setCurrentSchedule] = useState([]);
    const [currentActiveToken, setCurrentActiveToken] = useState(0);

    // Schedule Form
    const [day, setDay] = useState('Monday');
    const [slots, setSlots] = useState('');
    const [scheduleLoading, setScheduleLoading] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchDashboardData = async () => {
        try {
            const [apptsRes, profileRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/doctors/appointments/upcoming`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/doctors/profile`, config)
            ]);
            setAppointments(apptsRes.data);
            setCurrentSchedule(profileRes.data.schedule || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchDashboardData();
            setLoading(false);
        };
        loadData();

        // Socket listener for live updates
        if (socket) {
            socket.on('queue_update', (data) => {
                if (data.doctorId === user._id) {
                    fetchDashboardData();
                    if (data.activeToken !== undefined) {
                        setCurrentActiveToken(data.activeToken);
                    }
                    if (data.status) toast.info(`Update: ${data.status}`);
                }
            });

            return () => {
                socket.off('queue_update');
            };
        }
    }, [user, socket]);

    const handleCallNext = async () => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/queue/next`, {}, config);
            toast.success(res.data.message);
            if (res.data.activeToken) setCurrentActiveToken(res.data.activeToken);
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error calling next patient');
        }
    };

    const handleSkip = async () => {
        const reason = prompt("Enter reason for skipping:");
        if (!reason) return;
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/queue/skip`, { reason }, config);
            toast.success(res.data.message);
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error skipping patient');
        }
    };

    const handleEmergency = async () => {
        if (!window.confirm("Insert Emergency Patient to the top of the queue?")) return;
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/doctors/queue/emergency`, {}, config);
            toast.success(res.data.message);
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating emergency');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/appointments/${id}/status`, { status }, config);
            toast.success(`Appointment ${status}`);
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Schedule handlers
    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        setScheduleLoading(true);
        try {
            const existingDayIndex = currentSchedule.findIndex(s => s.day === day);
            let updatedSchedule = [...currentSchedule];
            const newSlotData = { day, slots: slots.split(',').map(s => s.trim()).filter(s => s) };

            if (existingDayIndex >= 0) updatedSchedule[existingDayIndex] = newSlotData;
            else updatedSchedule.push(newSlotData);

            await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/schedule`, { schedule: updatedSchedule }, config);
            toast.success('Schedule updated');
            setSlots('');
            fetchDashboardData();
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
            toast.success('Schedule removed');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to remove schedule');
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    const pendingCount = appointments.filter(a => a.queueStatus === 'Approved').length;

    // Find who is currently active in the list (for display)
    const activePatient = appointments.find(a => a.queueStatus === 'Active');

    return (
        <DashboardLayout title="Doctor Command Center" subtitle={`Dr. ${user.name}`}>

            {/* Control Panel */}
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Live Queue Control</h2>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-gray-400 text-xs uppercase tracking-wider">Current Token</p>
                                <p className="text-4xl font-mono font-bold text-primary">{activePatient ? `#${activePatient.tokenNumber}` : '--'}</p>
                            </div>
                            <div className="h-10 w-px bg-gray-700 mx-2"></div>
                            <div className="text-center">
                                <p className="text-gray-400 text-xs uppercase tracking-wider">In Queue</p>
                                <p className="text-4xl font-mono font-bold">{pendingCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleCallNext}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 transition-transform hover:scale-105 active:scale-95"
                        >
                            <FiPlay className="fill-current" /> Call Next
                        </button>
                        <button
                            onClick={handleSkip}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                        >
                            <FiSkipForward /> Skip
                        </button>
                        <button
                            onClick={handleEmergency}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-3 rounded-xl font-medium transition-colors"
                        >
                            <FiAlertCircle /> Emergency
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Patient Queue List */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Patient Queue ({pendingCount})</h2>
                    </div>

                    {/* Active Patient Card */}
                    {activePatient && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-pulse">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Now Serving</span>
                                    <h3 className="text-xl font-bold text-gray-900 mt-2">{activePatient.user?.name}</h3>
                                    <p className="text-sm text-gray-600">Token #{activePatient.tokenNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-mono font-bold text-green-600">00:00</p>
                                    <p className="text-xs text-green-600">Time Elapsed</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="modern-card p-0 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {/* Filter for Approved/Pending */}
                            {appointments.filter(a => a.queueStatus === 'Approved').map((appt) => (
                                <li key={appt._id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                                {appt.tokenNumber}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{appt.user?.name}</p>
                                                <p className="text-xs text-gray-500">Wait: ~15 mins</p>
                                            </div>
                                        </div>
                                        <button className="text-xs border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50">Details</button>
                                    </div>
                                </li>
                            ))}
                            {appointments.filter(a => a.queueStatus === 'Approved').length === 0 && (
                                <li className="p-8 text-center text-gray-500">No patients in queue</li>
                            )}
                        </ul>
                    </div>

                    <div className="pt-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Approvals</h2>
                        <div className="modern-card p-0 overflow-hidden">
                            {appointments.filter(a => a.status === 'Pending').map((appt) => (
                                <div key={appt._id} className="p-4 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-900">{appt.user?.name}</p>
                                        <p className="text-xs text-gray-500">{appt.timeSlot}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStatusUpdate(appt._id, 'Confirmed')} className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Approve</button>
                                        <button onClick={() => handleStatusUpdate(appt._id, 'Rejected')} className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded hover:bg-red-100">Reject</button>
                                    </div>
                                </div>
                            ))}
                            {appointments.filter(a => a.status === 'Pending').length === 0 && (
                                <p className="p-4 text-center text-gray-400 text-sm">No new requests</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Schedule & Stats */}
                <div className="space-y-6">
                    {/* Simplified Stats */}
                    <div className="modern-card">
                        <h3 className="font-bold text-gray-900 mb-4">Session Analytics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-600 font-bold uppercase">Avg Consult</p>
                                <p className="text-xl font-bold">12m</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-purple-600 font-bold uppercase">Completed</p>
                                <p className="text-xl font-bold">{appointments.filter(a => a.status === 'Completed').length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Manager (Kept same logic, just minimized) */}
                    <div className="modern-card">
                        <h3 className="font-bold text-gray-900 mb-4">Availability</h3>
                        <form onSubmit={handleUpdateSchedule} className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <select className="modern-input py-2" value={day} onChange={(e) => setDay(e.target.value)}>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d}>{d}</option>)}
                                </select>
                                <input type="text" placeholder="09:00, 09:30..." className="modern-input py-2" value={slots} onChange={(e) => setSlots(e.target.value)} />
                            </div>
                            <button disabled={scheduleLoading} className="btn-primary w-full text-sm py-2">Update Slots</button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardDoctor;
