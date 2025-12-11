import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = ({ role = 'user' }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [loading, setLoading] = useState(false);

    // Doctor specific
    const [specialization, setSpecialization] = useState('');
    const [departments, setDepartments] = useState([]);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (role === 'doctor') {
            const fetchDepts = async () => {
                try {
                    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/departments`);
                    setDepartments(data);
                } catch (error) {
                    console.error(error);
                }
            };
            fetchDepts();
        }
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const userData = { name, email, password, phone, age, role };

        if (role === 'doctor') {
            userData.specialization = specialization;
        }

        const res = await register(userData);
        setLoading(false);
        if (res.success) {
            toast.success('Registered successfully');
            if (role === 'doctor') navigate('/doctor-dashboard');
            else navigate('/dashboard');
        } else {
            toast.error(res.message);
        }
    };

    const title = role === 'doctor' ? 'Doctor Register' : 'Patient Register';
    const bgColor = role === 'doctor' ? 'bg-accent' : 'bg-primary';

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-100 py-10">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className={`text-2xl font-bold mb-6 text-center ${role === 'doctor' ? 'text-accent' : 'text-primary'}`}>
                    {title}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                            required
                        />
                    </div>

                    {role === 'doctor' && (
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Specialization</label>
                            <select
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Age</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white py-2 rounded-md transition duration-300 ${bgColor} hover:opacity-90 flex justify-center items-center`}
                    >
                        {loading ? <LoadingSpinner size="small" color="border-white" /> : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
