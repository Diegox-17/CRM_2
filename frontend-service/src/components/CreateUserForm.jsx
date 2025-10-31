// src/components/CreateUserForm.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

function CreateUserForm({ onUserCreated, onCancel }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        position: '',
        phoneNumber: ''
    });
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        // Cargar los roles disponibles cuando el componente se monta
        apiClient.get('/roles')
            .then(response => setAvailableRoles(response.data))
            .catch(err => setError('No se pudieron cargar los roles.'));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        setSelectedRoles({ ...selectedRoles, [e.target.name]: e.target.checked });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const rolesArray = Object.keys(selectedRoles).filter(role => selectedRoles[role]);

        if (rolesArray.length === 0) {
            setError('Debes seleccionar al menos un rol.');
            return;
        }

        try {
            await apiClient.post('/users', { ...formData, roles: rolesArray });
            onUserCreated(); // Llama al callback del padre para refrescar la lista
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al crear el usuario.');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
            <h3>Nuevo Usuario</h3>
            <form onSubmit={handleSubmit}>
                {/* Inputs para los datos del usuario */}
                <input name="firstName" placeholder="Nombre" onChange={handleChange} required />
                <input name="lastName" placeholder="Apellido" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
                <input name="position" placeholder="Puesto" onChange={handleChange} />
                <input name="phoneNumber" placeholder="Teléfono" onChange={handleChange} />

                {/* Checkboxes para los roles */}
                <h4>Roles</h4>
                {availableRoles.map(role => (
                    <div key={role.id}>
                        <label>
                            <input type="checkbox" name={role.name} onChange={handleRoleChange} />
                            {role.name}
                        </label>
                    </div>
                ))}

                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <button type="submit">Crear Usuario</button>
                <button type="button" onClick={onCancel}>Cancelar</button>
            </form>
        </div>
    );
}

export default CreateUserForm;