import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <div>
            <h1>CRM Consilium</h1>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </div>
    );
}

export default App;
