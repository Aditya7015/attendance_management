import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './components/auth/Login';
import Dashboard from './components/employee/Dashboard';
import History from './components/employee/History';
import RequestCorrection from './components/employee/RequestCorrection';
import PendingRequests from './components/hr/PendingRequests';
import TeamAttendance from './components/hr/TeamAttendance';
import UserManagement from './components/admin/UserManagement';
import RuleManagement from './components/admin/RuleManagement';
import AuditLogs from './components/admin/AuditLogs';
import './styles/index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Employee Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/history" element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            } />
            <Route path="/request-correction" element={
              <PrivateRoute>
                <RequestCorrection />
              </PrivateRoute>
            } />
            
            {/* HR Routes */}
            <Route path="/pending-requests" element={
              <PrivateRoute allowedRoles={['hr', 'admin']}>
                <PendingRequests />
              </PrivateRoute>
            } />
            <Route path="/team-attendance" element={
              <PrivateRoute allowedRoles={['hr', 'admin']}>
                <TeamAttendance />
              </PrivateRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/users" element={
              <PrivateRoute allowedRoles={['admin']}>
                <UserManagement />
              </PrivateRoute>
            } />
            <Route path="/rules" element={
              <PrivateRoute allowedRoles={['admin']}>
                <RuleManagement />
              </PrivateRoute>
            } />
            <Route path="/audit-logs" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AuditLogs />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;