// src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        try {
            return token ? jwtDecode(token) : null;
        } catch (error) {
            console.error("Token inválido en localStorage", error);
            localStorage.removeItem('token');
            return null;
        }
    });

    const login = (token) => {
        localStorage.setItem('token', token);
        setUser(jwtDecode(token)); // 3. Al hacer login, decodificamos y guardamos el usuario
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null); // 4. Al hacer logout, limpiamos el usuario
    };

    // 5. Exponemos tanto el usuario como el token (por si se necesita el string completo)
    return (
        <AuthContext.Provider value={{ user, token: localStorage.getItem('token'), login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};