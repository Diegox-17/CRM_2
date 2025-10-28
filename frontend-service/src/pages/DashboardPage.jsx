// src/pages/DashboardPage.jsx
import React from 'react';

function DashboardPage() {
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        // No necesitamos redirigir manualmente. 
        // El ProtectedRoute se dará cuenta de que el token ha desaparecido y nos enviará a /login.
    };
    return (
        <div>
            <h2>Dashboard Principal</h2>
            <p>¡Bienvenido al CRM de Consilium!</p>
            {/* Más adelante añadiremos el botón de logout aquí */}
        </div>
    );
}

export default DashboardPage;
