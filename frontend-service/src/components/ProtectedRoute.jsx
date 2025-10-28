// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    const { token } = useContext(AuthContext);

    if (!token) {
        // Si no hay token, redirige al usuario a la página de login
        return <Navigate to="/login" replace />;
    }

    // Si hay un token, muestra el contenido de la ruta (la página que está protegiendo)
    return children;
}

export default ProtectedRoute;
