import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../components/DashboardLayout';
import { FiArrowUpRight, FiPlus } from 'react-icons/fi';

const DashboardUser = () => {
    const { user } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [bookDate, setBookDate] = useState('');
    const [bookSlot, setBookSlot] = useState('');

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchDoctors = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/doctors`, {
                ...config,
                params: { name: searchName }
            });
            setDoctors(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/my`, config);
            setAppointments(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchDoctors(), fetchAppointments()]);
            setLoading(false);
        };
        loadData();
    }, [searchName]);

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
            toast.success('Appointment booked successfully!');
            setShowBookingModal(false);
            fetchAppointments();
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

    // Removed dummy analytics data

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <DashboardLayout>
            <div className="mb-8">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-500">Plan, prioritize, and accomplish your medical appointments with ease.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="btn-primary group">
                            <FiPlus className="group-hover:rotate-90 transition-transform duration-300" />
                            New Appointment
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Primary Card */}
                    <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-emerald-100 font-medium">Total Appointments</span>
                            <div className="bg-white/20 p-2 rounded-full transform rotate-45">
                                <FiArrowUpRight className="w-4 h-4" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">{appointments.length}</h2>
                        <div className="flex items-center gap-2 text-xs text-emerald-100 bg-white/10 px-2 py-1 rounded w-fit">
                            <span className="bg-emerald-400 text-primary px-1 rounded text-[10px] font-bold">5%</span>
                            <span>Increased from last month</span>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    {[
                        { label: 'Upcoming', value: appointments.filter(a => new Date(a.date) > new Date()).length, sub: 'Next 7 days' },
                        { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, sub: 'Total history' },
                        { label: 'Pending', value: appointments.filter(a => a.status === 'Pending').length, sub: 'Awaiting approval' }
                    ].map((stat, i) => (
                        <div key={i} className="modern-card">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-gray-500 font-medium">{stat.label}</span>
                                <div className="border border-gray-200 p-2 rounded-full transform rotate-45">
                                    <FiArrowUpRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{stat.value}</h2>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded w-fit">
                                {i === 0 ? <span className="bg-primary/20 text-primary px-1 rounded text-[10px] font-bold">New</span> : null}
                                <span>{stat.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Appointments List */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Your Appointments</h3>
                            <button className="text-primary text-sm font-semibold hover:underline" onClick={() => fetchAppointments()}>Refresh</button>
                        </div>
                        <div className="modern-card p-0 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {appointments.map((appt) => (
                                    <li key={appt._id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{appt.doctor?.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md
                                                ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                    appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                                {appointments.length === 0 && <li className="p-6 text-center text-gray-500">No appointments found.</li>}
                            </ul>
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
                                        {selectedDoctor.schedule.map(sch => (
                                            <optgroup key={sch.day} label={sch.day}>
                                                {sch.slots.map(slot => (
                                                    <option key={`${sch.day}-${slot}`} value={slot}>{slot} ({sch.day})</option>
                                                ))}
                                            </optgroup>
                                        ))}
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
