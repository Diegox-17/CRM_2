import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
    return (
        <div>
            <h1>CRM Consilium</h1>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" 
                    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/admin/users" 
                    element={<AdminRoute><UserManagementPage /></AdminRoute>} />
            </Routes>
        </div>
    );
}

export default App;
