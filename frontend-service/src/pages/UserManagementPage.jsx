// src/pages/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import CreateUserForm from '../components/CreateUserForm';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false); // <-- Estado para mostrar/ocultar el form

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/users');
            setUsers(response.data);
        } catch (err) {
            setError('No se pudo cargar la lista de usuarios.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUserCreated = () => {
        setIsCreating(false); // Ocultamos el formulario
        fetchUsers(); // Recargamos la lista de usuarios
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Gestión de Usuarios</h2>
            
            {/* Botón para mostrar el formulario */}
            {!isCreating && <button onClick={() => setIsCreating(true)}>Crear Nuevo Usuario</button>}
            
            {/* Formulario condicional */}
            {isCreating && <CreateUserForm onUserCreated={handleUserCreated} onCancel={() => setIsCreating(false)} />}
            
            {loading ? <p>Cargando usuarios...</p> : (
                <table border="1" cellPadding="5" style={{ marginTop: '20px' }}>
                    {/* ... (el código de tu tabla se queda igual) ... */}
                </table>
            )}
        </div>
    );
}

export default UserManagementPage;