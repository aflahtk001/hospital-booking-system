import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [isDoctor, setIsDoctor] = useState(false);
    const [loading, setLoading] = useState(false);

    // Doctor specific
    const [specialization, setSpecialization] = useState('');
    const [departments, setDepartments] = useState([]);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isDoctor) {
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
    }, [isDoctor]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const role = isDoctor ? 'doctor' : 'user';
        const userData = { name, email, password, phone, age, role };

        if (isDoctor) {
            userData.specialization = specialization;
        }

        const res = await register(userData);
        setLoading(false);
        if (res.success) {
            toast.success('Registered successfully');
            if (isDoctor) navigate('/doctor-dashboard');
            else navigate('/dashboard');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-800 py-12 transition-colors duration-300">
            <div className="modern-card w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Create Account</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Join Hospital Booking System</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Toggle */}
                    <div className="flex items-center justify-center gap-3 mb-6 bg-gray-100 p-1 rounded-lg w-max mx-auto">
                        <button
                            type="button"
                            onClick={() => setIsDoctor(false)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!isDoctor ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Patient
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDoctor(true)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${isDoctor ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Doctor
                        </button>
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="modern-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="modern-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="modern-input"
                            required
                        />
                    </div>

                    {isDoctor && (
                        <div>
                            <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">Specialization</label>
                            <select
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                className="modern-input"
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">Phone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="modern-input"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">Age</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="modern-input"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex justify-center items-center mt-6"
                    >
                        {loading ? <LoadingSpinner size="small" color="border-white" /> : 'Create Account'}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account? <span onClick={() => navigate('/login')} className="text-primary hover:underline cursor-pointer">Sign in</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
