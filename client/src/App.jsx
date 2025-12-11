import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DashboardUser from './pages/DashboardUser';

import DashboardAdmin from './pages/DashboardAdmin';

import DashboardDoctor from './pages/DashboardDoctor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Generic Routes (redirect or handle logic inside) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role Specific Routes */}
            <Route path="/login/user" element={<Login role="user" />} />
            <Route path="/login/doctor" element={<Login role="doctor" />} />
            <Route path="/login/admin" element={<Login role="admin" />} />

            <Route path="/register/user" element={<Register role="user" />} />
            <Route path="/register/doctor" element={<Register role="doctor" />} />

            <Route path="/dashboard" element={<DashboardUser />} />
            <Route path="/doctor-dashboard" element={<DashboardDoctor />} />
            <Route path="/admin-dashboard" element={<DashboardAdmin />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
