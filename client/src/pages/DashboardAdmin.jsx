import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../components/DashboardLayout';
import { FiUsers, FiActivity, FiBriefcase, FiTrash2, FiPlus } from 'react-icons/fi';

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
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-500">System overview and management.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="modern-card">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-2xl">
                            <FiUsers className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-gray-900">{doctors.length}</div>
                    <div className="text-gray-500 text-sm">Total Doctors</div>
                </div>
                <div className="modern-card">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-3 bg-green-100 rounded-2xl">
                            <FiActivity className="w-6 h-6 text-green-700" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-gray-900">{appointments.length}</div>
                    <div className="text-gray-500 text-sm">Total Appointments</div>
                </div>
                <div className="modern-card">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-3 bg-purple-100 rounded-2xl">
                            <FiBriefcase className="w-6 h-6 text-purple-700" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-gray-900">{departments.length}</div>
                    <div className="text-gray-500 text-sm">Departments</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-8 bg-white p-1 rounded-xl w-fit shadow-sm border border-gray-100">
                {['appointments', 'doctors', 'departments'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-6 capitalize font-medium rounded-lg transition-all ${activeTab === tab
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="modern-card">
                {activeTab === 'departments' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Departments Management</h3>
                        </div>
                        <form onSubmit={handleAddDept} className="mb-8 flex gap-4 bg-gray-50 p-4 rounded-2xl">
                            <input
                                type="text"
                                placeholder="New Department Name"
                                className="modern-input"
                                value={newDeptName}
                                onChange={(e) => setNewDeptName(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary whitespace-nowrap">
                                <FiPlus className="w-4 h-4" /> Add Dept
                            </button>
                        </form>
                        <div className="overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-l-xl">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-r-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {departments.map(dept => (
                                        <tr key={dept._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dept.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button onClick={() => handleDeleteDept(dept._id)} className="text-red-400 hover:text-red-600 transition-colors">
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
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
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Doctors Management</h3>
                        </div>
                        <form onSubmit={handleAddDoctor} className="mb-8 bg-gray-50 p-6 rounded-2xl space-y-4">
                            <h4 className="font-bold text-gray-700 mb-2">Register New Doctor</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Name" className="modern-input" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} required />
                                <input type="email" placeholder="Email" className="modern-input" value={newDoc.email} onChange={e => setNewDoc({ ...newDoc, email: e.target.value })} required />
                                <input type="password" placeholder="Password" className="modern-input" value={newDoc.password} onChange={e => setNewDoc({ ...newDoc, password: e.target.value })} required />
                                <select className="modern-input" value={newDoc.specialization} onChange={e => setNewDoc({ ...newDoc, specialization: e.target.value })} required>
                                    <option value="">Select Specialization</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Initial Schedule</label>
                                <div className="flex gap-2">
                                    <select className="modern-input w-40" value={scheduleDay} onChange={e => setScheduleDay(e.target.value)}>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <input type="text" placeholder="Slots (e.g. 09:00, 09:30)" className="modern-input flex-grow" value={scheduleSlots} onChange={e => setScheduleSlots(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="btn-primary">Create Doctor Account</button>
                            </div>
                        </form>

                        <div className="overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-l-xl">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Specialization</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-r-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {doctors.map(doc => (
                                        <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{doc.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{doc.specialization?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button onClick={() => handleDeleteDoctor(doc._id)} className="text-red-400 hover:text-red-600 transition-colors">
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-l-xl">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date/Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-r-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {appointments.map(appt => (
                                    <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{appt.user?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{appt.doctor?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(appt.date).toLocaleDateString()} {appt.timeSlot}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-md
                          ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                    appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <span className="text-gray-400 text-sm">View Only</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DashboardAdmin;
