import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = ({ role = 'user' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await login(email, password, role);
        setLoading(false);
        if (res.success) {
            toast.success('Logged in successfully');
            if (role === 'admin') navigate('/admin-dashboard');
            else if (role === 'doctor') navigate('/doctor-dashboard');
            else navigate('/dashboard');
        } else {
            toast.error(res.message);
        }
    };

    const title = role === 'admin' ? 'Admin Login' : role === 'doctor' ? 'Doctor Login' : 'Patient Login';
    const bgColor = role === 'admin' ? 'bg-secondary' : role === 'doctor' ? 'bg-accent' : 'bg-primary';

    return (
        <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className={`text-2xl font-bold mb-6 text-center ${role === 'admin' ? 'text-secondary' : role === 'doctor' ? 'text-accent' : 'text-primary'}`}>
                    {title}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {role === 'admin' ? 'Username' : 'Email'}
                        </label>
                        <input
                            type={role === 'admin' ? 'text' : 'email'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                            style={{ borderColor: 'inherit' }}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white py-2 rounded-md transition duration-300 ${bgColor} hover:opacity-90 flex justify-center items-center`}
                    >
                        {loading ? <LoadingSpinner size="small" color="border-white" /> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
