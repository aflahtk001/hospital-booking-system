import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await login(email, password);
        setLoading(false);
        if (res.success) {
            toast.success('Logged in successfully');
            // Check localStorage or wait for context update to get the role if not returned directly by login wrapper
            // But login wrapper updates user state. Ideally res should optionally return data. 
            // The context login function returns {success:true} but doesn't return the user object. 
            // However, we just updated context user state. 
            // Let's rely on the user data stored in localStorage which was set in login function
            const storedUser = JSON.parse(localStorage.getItem('userInfo'));
            const role = storedUser?.role;

            if (role === 'admin') navigate('/admin-dashboard');
            else if (role === 'doctor') navigate('/doctor-dashboard');
            else navigate('/dashboard');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-800 py-12 transition-colors duration-300">
            <div className="modern-card w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Sign In</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Welcome back</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                            Email
                        </label>
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex justify-center items-center mt-6"
                    >
                        {loading ? <LoadingSpinner size="small" color="border-white" /> : 'Sign in'}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account? <span onClick={() => navigate('/register')} className="text-primary hover:underline cursor-pointer">Register here</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
