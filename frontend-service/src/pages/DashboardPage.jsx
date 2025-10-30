// src/pages/DashboardPage.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function DashboardPage() {
    const { user, logout } = useContext(AuthContext);
    const isAdmin = user && user.roles && (user.roles.includes('Admin') || user.roles.includes('Superadmin'));
    const handleLogout = () => { logout(); };

    return (
        <div>
            <h2>Dashboard Principal</h2>
            <p>¡Bienvenido al CRM de Consilium, {user?.email}!</p>
            {isAdmin && (
                <nav>
                    <Link to="/admin/users">Gestionar Usuarios</Link>
                </nav>
            )}

            <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
    );
}

export default DashboardPage;
