// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
    // La URL base de nuestra API. NGINX Proxy Manager redirigirá esto.
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;