// src/components/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdminRoute({ children }) {
    const { user } = useContext(AuthContext);

    // Si no hay usuario o si el usuario no tiene roles o si sus roles no incluyen 'Admin' o 'Superadmin'
    if (!user || !user.roles || (!user.roles.includes('Admin') && !user.roles.includes('Superadmin'))) {
        // Redirige al dashboard principal (o a una página de "acceso denegado")
        return <Navigate to="/" replace />;
    }

    // Si el usuario es un admin, muestra el contenido
    return children;
}

export default AdminRoute;