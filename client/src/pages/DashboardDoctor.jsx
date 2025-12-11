import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardDoctor = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        };
        loadData();
    }, []);

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        setScheduleLoading(true);
        try {
            const newSchedule = [{
                day,
                slots: slots.split(',').map(s => s.trim())
            }];

            await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/schedule`, { schedule: newSchedule }, config);
            toast.success('Schedule updated');
        } catch (error) {
            toast.error('Failed to update schedule');
        } finally {
            setScheduleLoading(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Doctor Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Appointments */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upcoming Appointments</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {appointments.map((appt) => (
                                <li key={appt._id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-primary">
                                                {appt.user?.name} ({appt.user?.age} yrs)
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Token: {appt.tokenNumber || 'Pending'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mb-2
                        ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                    appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {appt.status}
                                            </span>
                                            {appt.status === 'Pending' && (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleStatusUpdate(appt._id, 'Confirmed')}
                                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(appt._id, 'Rejected')}
                                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {appointments.length === 0 && <li className="px-6 py-4 text-gray-500">No appointments found.</li>}
                        </ul>
                    </div>
                </div>

                {/* Schedule Management */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Update Schedule</h2>
                    <form onSubmit={handleUpdateSchedule} className="bg-white p-6 rounded-lg shadow">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Day</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Available Slots (comma separated)</label>
                            <input
                                type="text"
                                placeholder="09:00, 09:30, 10:00"
                                className="w-full border p-2 rounded"
                                value={slots}
                                onChange={(e) => setSlots(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={scheduleLoading} className="w-full bg-primary text-white py-2 rounded hover:bg-sky-600 flex justify-center items-center">
                            {scheduleLoading ? <LoadingSpinner size="small" color="border-white" /> : 'Update Schedule'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DashboardDoctor;
