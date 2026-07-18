import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Request interceptor to add access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh token
                // The backend expects the refresh token in the body if it's not strictly using cookies for it,
                // but according to the swagger, it might expect it in body. Wait, the swagger for /api/auth/refresh-token says:
                //"requestBody": {"properties": {"refreshToken": ... } }
                // Let's assume the refresh token is stored in localStorage as'refreshToken' for simplicity,
                // since the instructions don't strictly require a specific refresh token storage mechanism unless stated.
                // Actually, let's keep it simple and just do a post call.
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const res = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken }, {
                    withCredentials: true,
                });

                const { token } = res.data;
                if (token) {
                    localStorage.setItem('token', token);
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, user needs to login again
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
