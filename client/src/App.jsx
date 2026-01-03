import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DashboardUser from './pages/DashboardUser';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardDoctor from './pages/DashboardDoctor';

const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-white dark:bg-gray-800 transition-colors duration-300">
              <Routes>
                {/* Public Routes with Navbar */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />

                  {/* Unified Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Dashboard Routes - Layout handled internally */}
                <Route path="/dashboard" element={<DashboardUser />} />
                <Route path="/doctor-dashboard" element={<DashboardDoctor />} />
                <Route path="/admin-dashboard" element={<DashboardAdmin />} />
              </Routes>
              <ToastContainer />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
