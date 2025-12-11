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
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gmailGray-50 py-12">
            <div className="gmail-card w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">H</span>
                    </div>
                    <h2 className="text-2xl font-normal text-gmailGray-900 mb-2">{title}</h2>
                    <p className="text-gmailGray-600 text-sm">to continue to Hospital Booking</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gmailGray-700 text-sm font-medium mb-2">
                            {role === 'admin' ? 'Username' : 'Email'}
                        </label>
                        <input
                            type={role === 'admin' ? 'text' : 'email'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="gmail-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gmailGray-700 text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="gmail-input"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="gmail-btn-primary w-full flex justify-center items-center mt-6"
                    >
                        {loading ? <LoadingSpinner size="small" color="border-white" /> : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
