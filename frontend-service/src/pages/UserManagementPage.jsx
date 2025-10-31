// src/pages/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import CreateUserForm from '../components/CreateUserForm';
import EditUserForm from '../components/EditUserForm';
import { AuthContext } from '../context/AuthContext';

function UserManagementPage() {

    console.log("UserManagementPage: Renderizando componente.");

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // <-- Nuevo estado para saber a quién editamos
    const { user: currentUser } = useContext(AuthContext); // <-- Obtenemos al usuario que está logueado

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

    const handleUserUpdated = () => {
        setEditingUser(null); // Cerramos el formulario de edición
        fetchUsers(); // Recargamos la lista
    };

    const handleDisableUser = async (userId, isActive) => {
        const action = isActive ? 'deshabilitar' : 'habilitar';
        if (window.confirm(`¿Estás seguro de que quieres ${action} a este usuario?`)) {
            try {
                await apiClient.delete(`/users/${userId}`);
                fetchUsers(); // Recargamos la lista
            } catch (err) {
                alert(`Error al ${action} al usuario.`);
            }
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Gestión de Usuarios</h2>

            {currentUser && currentUser.roles && (currentUser.roles.includes('Superadmin') || currentUser.roles.includes('Admin')) && (
                !isCreating && !editingUser && <button onClick={() => setIsCreating(true)}>Crear Nuevo Usuario</button>
            )}
            
            {isCreating && <CreateUserForm onUserCreated={handleUserCreated} onCancel={() => setIsCreating(false)} />}
            {editingUser && <EditUserForm userToEdit={editingUser} onUserUpdated={handleUserUpdated} onCancel={() => setEditingUser(null)} />}
            
            {loading ? <p>Cargando usuarios...</p> : (
                <table border="1" cellPadding="5" style={{ marginTop: '20px', width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.first_name} {user.last_name}</td>
                                <td>{user.email}</td>
                                <td style={{ color: user.is_active ? 'green' : 'red' }}>
                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                </td>
                                <td>
                                    <button onClick={() => setEditingUser(user)}>Editar</button>
                                    
                                    {currentUser && currentUser.roles && currentUser.roles.includes('Superadmin') && (
                                        <button onClick={() => handleDisableUser(user.id, user.is_active)}>
                                            {user.is_active ? 'Deshabilitar' : 'Habilitar'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserManagementPage;