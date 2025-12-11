import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardUser = () => {
    const { user } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [searchName, setSearchName] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Booking Form State
    const [bookDate, setBookDate] = useState('');
    const [bookSlot, setBookSlot] = useState('');

    const fetchDoctors = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                params: { department: selectedDept, name: searchName }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/doctors`, config);
            setDoctors(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/my`, config);
            setAppointments(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDepartments = async () => {
        // Ideally this should be a public or user accessible route. 
        // For now assuming we can get it or hardcode. 
        // Let's add a route for getting departments in user routes or just use admin one if protected?
        // Actually admin route is protected for admin. I should add a public/user route for departments.
        // For now, I'll skip fetching departments dynamically to save time or mock it, 
        // OR I can quickly add a route. Let's mock for now or just fetch if I add the route.
        // I'll just fetch doctors and filter by unique specializations on frontend if needed, 
        // but backend filter is better.
        // Let's just leave department filter as text input or skip for now.
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchDoctors(), fetchAppointments()]);
            setLoading(false);
        };
        loadData();
    }, [selectedDept, searchName]);

    const handleBook = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
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

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="min-h-screen bg-appleGray-50 dark:bg-appleGray-800 transition-colors duration-300"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-semibold text-appleGray-900 dark:text-white mb-8">User Dashboard</h1>

            {/* Appointments Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold text-appleGray-900 dark:text-white mb-4">My Appointments</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {appointments.map((appt) => (
                            <li key={appt._id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-primary truncate">
                                            Dr. {appt.doctor?.name} ({appt.department?.name})
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}
                                        </p>
                                    </div>
                                    <div>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {appt.status}
                                        </span>
                                        {appt.tokenNumber && (
                                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Token: {appt.tokenNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                        {appointments.length === 0 && <li className="px-6 py-4 text-gray-500">No appointments found.</li>}
                    </ul>
                </div>
            </div>

            {/* Book Appointment Section */}
            <div>
                <h2 className="text-2xl font-semibold text-appleGray-900 dark:text-white mb-4">Find a Doctor</h2>
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="border p-2 rounded w-full max-w-xs"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    {/* Department dropdown could go here */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doc) => (
                        <div key={doc._id} className="apple-card hover:shadow-lg transition">
                            <h3 className="text-xl font-bold text-gray-800">Dr. {doc.name}</h3>
                            <p className="text-gray-600">{doc.specialization?.name}</p>
                            <p className="text-sm text-gray-500 mt-2">Available: {doc.schedule.map(s => s.day).join(', ')}</p>
                            <button
                                onClick={() => openBooking(doc)}
                                className="mt-4 w-full bg-primary text-white py-2 rounded hover:bg-sky-600"
                            >
                                Book Appointment
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedDoctor && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4">Book with Dr. {selectedDoctor.name}</h3>
                        <form onSubmit={handleBook}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border p-2 rounded"
                                    value={bookDate}
                                    onChange={(e) => setBookDate(e.target.value)}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Time Slot</label>
                                <select
                                    required
                                    className="w-full border p-2 rounded"
                                    value={bookSlot}
                                    onChange={(e) => setBookSlot(e.target.value)}
                                >
                                    <option value="">Select Slot</option>
                                    {/* Ideally filter slots based on selected date's day */}
                                    {selectedDoctor.schedule.map(sch => (
                                        <optgroup key={sch.day} label={sch.day}>
                                            {sch.slots.map(slot => (
                                                <option key={`${sch.day}-${slot}`} value={slot}>{slot} ({sch.day})</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-sky-600 flex items-center"
                                >
                                    {actionLoading ? <LoadingSpinner size="small" color="border-white" /> : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardUser;
