// src/pages/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import CreateUserForm from '../components/CreateUserForm';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // useCallback memoriza la función para evitar re-renders innecesarios
    const fetchUsers = useCallback(async () => {
        try {
            setError(''); // Limpia errores anteriores
            setLoading(true);
            const response = await apiClient.get('/users');
            setUsers(response.data);
        } catch (err) {
            setError('No se pudo cargar la lista de usuarios. Es posible que no tengas los permisos necesarios.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect se ejecuta una vez cuando el componente se monta
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Esta función se pasará como prop a CreateUserForm
    const handleUserCreated = () => {
        setIsCreating(false); // Ocultamos el formulario
        fetchUsers(); // Recargamos la lista de usuarios para ver al nuevo miembro
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Gestión de Usuarios</h2>
            
            {!isCreating ? (
                <button onClick={() => setIsCreating(true)}>Crear Nuevo Usuario</button>
            ) : (
                <CreateUserForm onUserCreated={handleUserCreated} onCancel={() => setIsCreating(false)} />
            )}
            
            {loading ? (
                <p>Cargando usuarios...</p>
            ) : (
                // --- SECCIÓN DE LA TABLA RESTAURADA ---
                <table border="1" cellPadding="5" style={{ marginTop: '20px', width: '100%' }}>
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
            )}
        </div>
    );
}

export default UserManagementPage;