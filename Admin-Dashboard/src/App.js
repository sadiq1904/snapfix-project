// src/App.js
import { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';

import './styles/App.css';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import Login from './pages/Login';
import News from './pages/News';
import ScheduleAppointment from './pages/ScheduleAppointment';
import Settings from './pages/Settings';
import Staff from './pages/Staff';
import Students from './pages/Students';
import TechnicianDashboard from './pages/TechnicianDashboard';
import UpdateReport from './pages/UpdateReport';

function App() {
  const [user, setUser] = useState(null);

  // Important: tells us whether localStorage has been checked
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        console.log('Restored user:', parsedUser);

        setUser(parsedUser);
      } catch (error) {
        console.error('Invalid stored user:', error);

        localStorage.removeItem('adminUser');
        setUser(null);
      }
    }

    // We have finished checking localStorage
    setAuthLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  /*
   * Don't render protected routes until we know
   * whether the user is logged in.
   */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-xl font-bold text-black">
            Loading...
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Restoring your session
          </p>
        </div>
      </div>
    );
  }

  const ProtectedRoute = ({ children, allowedRoles = [] }) => {

    // User isn't logged in
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    // User doesn't have permission
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Router>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Login setUser={setUser} />
            )
          }
        />


        {/* DASHBOARD */}
        <Route
          path="/"
          element={
            <ProtectedRoute
              allowedRoles={[
                'super_admin',
                'hall_admin',
                'technician'
              ]}
            >
              <Layout
                user={user}
                handleLogout={handleLogout}
              >
                {user?.role === 'technician' ? (
                  <TechnicianDashboard user={user} />
                ) : (
                  <Dashboard user={user} />
                )}
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* NEWS */}
        <Route
          path="/news"
          element={
            <ProtectedRoute
              allowedRoles={[
                'super_admin',
                'hall_admin',
                'technician'
              ]}
            >
              <Layout
                user={user}
                handleLogout={handleLogout}
              >
                <News user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* SCHEDULE APPOINTMENT */}
        <Route
          path="/schedule-appointment"
          element={
            <ProtectedRoute
              allowedRoles={['technician']}
            >
              <Layout
                user={user}
                handleLogout={handleLogout}
              >
                <ScheduleAppointment user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* UPDATE REPORT */}
        <Route
          path="/update-report"
          element={
            <ProtectedRoute
              allowedRoles={['technician']}
            >
              <Layout
                user={user}
                handleLogout={handleLogout}
              >
                <UpdateReport user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* STUDENTS */}
        <Route
          path="/students"
          element={
            <ProtectedRoute
              allowedRoles={[
                'super_admin',
                'hall_admin'
              ]}
            >
              <Layout
                user={user}
                handleLogout={handleLogout}
              >
                <Students user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* STAFF */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute
              allowedRoles={[
                'super_admin',
                'hall_admin'
              ]}
            >
              <Layout
                user={user}
                handleLogout={handleLogout}
              >
                <Staff user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* LOCATIONS - SUPER ADMIN ONLY */}
        <Route
          path="/locations"
          element={
            <ProtectedRoute
              allowedRoles={['super_admin']}
            >
              <Layout
                user={user}
                handleLogout={handleLogout}
              >
                <Locations user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              allowedRoles={[
                'super_admin',
                'hall_admin',
                'technician'
              ]}
            >
              <Layout
                user={user}
                handleLogout={handleLogout}
              >
                <Settings
                  user={user}
                  setUser={setUser}
                />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* UNKNOWN ROUTE */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </Router>
  );
}

export default App;