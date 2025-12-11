import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardAdmin = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('appointments');

    // Data States
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [newDeptName, setNewDeptName] = useState('');
    const [newDoc, setNewDoc] = useState({ name: '', email: '', password: '', specialization: '', schedule: [] });
    const [scheduleDay, setScheduleDay] = useState('Monday');
    const [scheduleSlots, setScheduleSlots] = useState(''); // Comma separated

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchData = async () => {
        setLoading(true);
        try {
            const depts = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/departments`, config);
            setDepartments(depts.data);

            const docs = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/doctors`, config);
            setDoctors(docs.data);

            const appts = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/appointments`, config);
            setAppointments(appts.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // --- Department Handlers ---
    const handleAddDept = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/departments`, { name: newDeptName }, config);
            toast.success('Department added');
            setNewDeptName('');
            fetchData();
        } catch (error) {
            toast.error('Failed to add department');
        }
    };

    const handleDeleteDept = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/departments/${id}`, config);
            toast.success('Department deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete department');
        }
    };

    // --- Doctor Handlers ---
    const handleAddDoctor = async (e) => {
        e.preventDefault();
        try {
            // Parse schedule
            const schedule = [{
                day: scheduleDay,
                slots: scheduleSlots.split(',').map(s => s.trim())
            }];

            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/doctors`, { ...newDoc, schedule }, config);
            toast.success('Doctor added');
            setNewDoc({ name: '', email: '', password: '', specialization: '', schedule: [] });
            setScheduleSlots('');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add doctor');
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/doctors/${id}`, config);
            toast.success('Doctor deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete doctor');
        }
    };

    // --- Appointment Handlers ---
    const handleStatusChange = async (id, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/appointments/${id}/status`, { status }, config);
            toast.success(`Appointment ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading && appointments.length === 0 && doctors.length === 0 && departments.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

            <div className="flex space-x-4 mb-8 border-b">
                {['appointments', 'doctors', 'departments'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 capitalize font-semibold ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'departments' && (
                <div>
                    <form onSubmit={handleAddDept} className="mb-8 flex gap-4">
                        <input
                            type="text"
                            placeholder="New Department Name"
                            className="border p-2 rounded"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            required
                        />
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Add Department</button>
                    </form>
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {departments.map(dept => (
                                    <tr key={dept._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{dept.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => handleDeleteDept(dept._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'doctors' && (
                <div>
                    <form onSubmit={handleAddDoctor} className="mb-8 bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-bold mb-4">Add New Doctor</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Name" className="border p-2 rounded" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} required />
                            <input type="email" placeholder="Email" className="border p-2 rounded" value={newDoc.email} onChange={e => setNewDoc({ ...newDoc, email: e.target.value })} required />
                            <input type="password" placeholder="Password" className="border p-2 rounded" value={newDoc.password} onChange={e => setNewDoc({ ...newDoc, password: e.target.value })} required />
                            <select className="border p-2 rounded" value={newDoc.specialization} onChange={e => setNewDoc({ ...newDoc, specialization: e.target.value })} required>
                                <option value="">Select Specialization</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold mb-1">Initial Schedule (One Day)</label>
                                <div className="flex gap-2">
                                    <select className="border p-2 rounded" value={scheduleDay} onChange={e => setScheduleDay(e.target.value)}>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <input type="text" placeholder="Slots (e.g. 09:00, 09:30)" className="border p-2 rounded flex-grow" value={scheduleSlots} onChange={e => setScheduleSlots(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="mt-4 bg-primary text-white px-4 py-2 rounded">Add Doctor</button>
                    </form>

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {doctors.map(doc => (
                                    <tr key={doc._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{doc.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{doc.specialization?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => handleDeleteDoctor(doc._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map(appt => (
                                <tr key={appt._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{appt.user?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{appt.doctor?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(appt.date).toLocaleDateString()} {appt.timeSlot}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {/* Actions removed for Admin */}
                                        <span className="text-gray-400 text-sm">View Only</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DashboardAdmin;
