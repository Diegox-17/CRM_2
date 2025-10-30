// src/pages/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Hacemos la llamada al nuevo endpoint que creamos en el backend
                const response = await apiClient.get('/users');
                setUsers(response.data);
            } catch (err) {
                setError('No se pudo cargar la lista de usuarios. Es posible que no tengas los permisos necesarios.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []); // El array vacío significa que este efecto se ejecuta solo una vez, cuando el componente se monta

    if (loading) return <p>Cargando usuarios...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Gestión de Usuarios</h2>
            <table border="1" cellPadding="5">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Puesto</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.first_name}</td>
                            <td>{user.last_name}</td>
                            <td>{user.email}</td>
                            <td>{user.position || 'N/A'}</td>
                            <td>{user.is_active ? 'Activo' : 'Inactivo'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserManagementPage;