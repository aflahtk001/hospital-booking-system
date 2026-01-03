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

    const title = role === 'admin' ? 'Admin Sign in' : role === 'doctor' ? 'Doctor Sign in' : 'Patient Sign in';

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-800 py-12 transition-colors duration-300">
            <div className="modern-card w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Welcome back</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                            {role === 'admin' ? 'Username' : 'Email'}
                        </label>
                        <input
                            type={role === 'admin' ? 'text' : 'email'}
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex justify-center items-center mt-6"
                    >
                        {loading ? <LoadingSpinner size="small" color="border-white" /> : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
