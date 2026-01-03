import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../components/DashboardLayout';
import { FiArrowUpRight, FiPlus, FiClock } from 'react-icons/fi';

const DashboardUser = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <LoadingSpinner fullScreen />;
    const { socket } = useSocket();
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [bookDate, setBookDate] = useState('');
    const [bookSlot, setBookSlot] = useState('');

    // Live Queue State
    const [liveQueueState, setLiveQueueState] = useState(null);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchData = async () => {
        try {
            const [docsRes, apptsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/users/doctors`, { ...config, params: { name: searchName } }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/my`, config)
            ]);
            setDoctors(docsRes.data);
            setAppointments(apptsRes.data);
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

        if (socket) {
            socket.on('queue_update', (data) => {
                // If it's my appointment or a queue I'm in
                fetchData();
                if (data.status === 'Next Called' || data.queueStatus) {
                    toast.info(`Queue Update: ${data.status}`);
                }
            });

            return () => {
                socket.off('queue_update');
            };
        }
    }, [searchName, socket]);

    const handleBook = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/book`, {
                doctorId: selectedDoctor._id,
                departmentId: selectedDoctor.specialization._id,
                date: bookDate,
                timeSlot: bookSlot
            }, config);
            toast.success('Appointment booked!');
            setShowBookingModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setActionLoading(false);
        }
    };

    const openBooking = (doctor) => {
        setSelectedDoctor(doctor);
        setShowBookingModal(true);
    };

    if (loading) return <LoadingSpinner fullScreen />;

    // Logic to find "Active" appointment (highest priority one for the user)
    // 1. In Progress (Active)
    // 2. Approved (Waiting)
    // 3. Pending
    const activeAppointment = appointments.find(a => a.queueStatus === 'Active') ||
        appointments.find(a => a.queueStatus === 'Approved') ||
        appointments.find(a => a.status === 'Pending');

    return (
        <DashboardLayout title="Patient Dashboard" subtitle={`Welcome back, ${user.name}`}>

            {/* Live Queue Status Widget */}
            {activeAppointment && activeAppointment.queueStatus === 'Active' && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white shadow-xl animate-pulse">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">It's Your Turn!</h2>
                            <p className="opacity-90">Please proceed to Dr. {activeAppointment.doctor?.name}'s room.</p>
                        </div>
                        <div className="bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm">
                            <p className="text-xs uppercase font-bold text-white/80">Token Number</p>
                            <p className="text-4xl font-mono font-bold">#{activeAppointment.tokenNumber}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeAppointment && activeAppointment.queueStatus === 'Approved' && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-wide mb-1">My Token</p>
                            <div className="text-5xl font-mono font-bold">#{activeAppointment.tokenNumber}</div>
                            <p className="text-sm mt-2 text-blue-100">Dr. {activeAppointment.doctor?.name}</p>
                        </div>
                        <div className="md:col-span-2 flex justify-around items-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-center">
                                <p className="text-blue-200 text-xs uppercase mb-1">People Ahead</p>
                                <p className="text-3xl font-bold">{activeAppointment.peopleAhead || 0}</p>
                            </div>
                            <div className="h-10 w-px bg-white/20"></div>
                            <div className="text-center">
                                <p className="text-blue-200 text-xs uppercase mb-1">Est. Wait Time</p>
                                <p className="text-3xl font-bold">{activeAppointment.estimatedWaitTime || 0}<span className="text-sm font-normal">m</span></p>
                            </div>
                        </div>
                    </div>
                    {/* Progress Bar Visual */}
                    <div className="mt-6">
                        <div className="flex justify-between text-xs text-blue-200 mb-2">
                            <span>Now Serving</span>
                            <span>Your Turn</span>
                        </div>
                        <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full animate-pulse"
                                style={{ width: `${Math.max(10, 100 - ((activeAppointment.peopleAhead || 0) * 10))}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats & Appointments */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Cards (Simplified for space) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="modern-card bg-primary text-white border-none p-4">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{appointments.length}</p>
                                        <p className="text-xs opacity-80">Total Appointments</p>
                                    </div>
                                    <FiArrowUpRight className="opacity-50" />
                                </div>
                            </div>
                            <div className="modern-card p-4">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {appointments.filter(a => a.status === 'Pending').length}
                                        </p>
                                        <p className="text-xs text-gray-500">Pending Approval</p>
                                    </div>
                                    <FiArrowUpRight className="text-gray-300" />
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Appointments List */}
                        <div className="modern-card p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Appointments</h3>
                            <div className="space-y-4">
                                {appointments.map(apt => (
                                    <div key={apt._id} className="p-4 rounded-xl bg-gray-50 flex justify-between items-center group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                {new Date(apt.date).getDate()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Dr. {apt.doctor?.name}</h4>
                                                <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString()} • {apt.timeSlot}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                            ${apt.queueStatus === 'Active' ? 'bg-green-100 text-green-700 animate-pulse' :
                                                    apt.queueStatus === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                                        apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {apt.queueStatus === 'Pending' ? apt.status : apt.queueStatus}
                                            </span>
                                            {apt.tokenNumber && <p className="text-xs font-mono font-bold mt-1">Token #{apt.tokenNumber}</p>}
                                        </div>
                                    </div>
                                ))}
                                {appointments.length === 0 && <p className="text-center text-gray-400 py-8">No appointments yet.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Available Doctors List */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Book a Doctor</h3>
                        </div>
                        <input
                            type="text"
                            placeholder="Search doctors..."
                            className="modern-input mb-4"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        <div className="space-y-4">
                            {doctors.map(doctor => (
                                <div key={doctor._id} className="modern-card flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {doctor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{doctor.name}</h4>
                                            <p className="text-xs text-gray-500">{doctor.specialization?.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openBooking(doctor)} className="btn-primary text-xs px-3 py-1.5">
                                        Book
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                {showBookingModal && selectedDoctor && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 transform transition-all">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900">Book Appointment</h3>
                            <form onSubmit={handleBook}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="modern-input"
                                        value={bookDate}
                                        onChange={(e) => setBookDate(e.target.value)}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Time Slot</label>
                                    <select
                                        required
                                        className="modern-input"
                                        value={bookSlot}
                                        onChange={(e) => setBookSlot(e.target.value)}
                                    >
                                        <option value="">Select Slot</option>
                                        {selectedDoctor.schedule && selectedDoctor.schedule.length > 0 ? (
                                            selectedDoctor.schedule.map(sch => (
                                                <optgroup key={sch.day} label={sch.day}>
                                                    {sch.slots.map(slot => (
                                                        <option key={`${sch.day}-${slot}`} value={slot}>{slot} ({sch.day})</option>
                                                    ))}
                                                </optgroup>
                                            ))
                                        ) : (
                                            <option disabled>No slots available</option>
                                        )}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingModal(false)}
                                        className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="btn-primary"
                                    >
                                        {actionLoading ? <LoadingSpinner size="small" color="border-white" /> : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DashboardUser;
