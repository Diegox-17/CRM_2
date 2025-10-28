// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
    // La URL base de nuestra API. NGINX Proxy Manager redirigirá esto.
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
