// src/components/EditUserForm.jsx
import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { AuthContext } from '../context/AuthContext';

function EditUserForm({ userToEdit, onUserUpdated, onCancel }) {
    const [formData, setFormData] = useState({ ...userToEdit, roles: [] });
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [error, setError] = useState('');
    const { user: currentUser } = useContext(AuthContext);

    // Cargar roles disponibles y los roles actuales del usuario
    useEffect(() => {
        apiClient.get('/roles').then(res => setAvailableRoles(res.data));
        apiClient.get(`/users/${userToEdit.id}`).then(res => {
            setFormData({ ...res.data, password: '' }); // No cargamos el hash de la contraseña
            const userRoles = {};
            res.data.roles.forEach(roleName => {
                userRoles[roleName] = true;
            });
            setSelectedRoles(userRoles);
        });
    }, [userToEdit.id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleRoleChange = (e) => setSelectedRoles({ ...selectedRoles, [e.target.name]: e.target.checked });
    const handleIsActiveChange = (e) => setFormData({ ...formData, is_active: e.target.checked });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const rolesArray = Object.keys(selectedRoles).filter(role => selectedRoles[role]);
        const dataToSubmit = {
            ...formData,
            roles: rolesArray,
            isActive: formData.is_active
        };

        try {
            await apiClient.put(`/users/${userToEdit.id}`, dataToSubmit);
            onUserUpdated();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar el usuario.');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
            <h3>Editando a {formData.email}</h3>
            <form onSubmit={handleSubmit}>
                <input name="firstName" value={formData.first_name || ''} onChange={handleChange} required />
                <input name="lastName" value={formData.last_name || ''} onChange={handleChange} required />
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                {/* ... otros inputs ... */}
                
                {/* Superadmin ve y edita roles, Admin solo los ve */}
                <h4>Roles</h4>
                {availableRoles.map(role => (
                    <div key={role.id}>
                        <label>
                            <input
                                type="checkbox"
                                name={role.name}
                                checked={!!selectedRoles[role.name]}
                                onChange={handleRoleChange}
                                disabled={!currentUser.roles.includes('Superadmin')}
                            />
                            {role.name}
                        </label>
                    </div>
                ))}
                
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Guardar Cambios</button>
                <button type="button" onClick={onCancel}>Cancelar</button>
            </form>
        </div>
    );
}

export default EditUserForm;