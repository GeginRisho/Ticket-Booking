import api from'./api';

export const login = async (email, password) => {
 const response = await api.post('/auth/login', { email, password });
 return response.data;
};

export const register = async (userData) => {
 const response = await api.post('/auth/register', userData);
 return response.data;
};

export const registerOrganizer = async (organizerData) => {
 const response = await api.post('/auth/register-organizer', organizerData);
 return response.data;
};

export const logout = async (refreshToken) => {
 const response = await api.post('/auth/logout', { refreshToken });
 return response.data;
};

export const getMe = async () => {
 const response = await api.get('/auth/me');
 return response.data;
};

export const updateProfile = async (profileData) => {
 const response = await api.put('/auth/profile', profileData);
 return response.data;
};

export const changePassword = async (passwordData) => {
 const response = await api.put('/auth/change-password', passwordData);
 return response.data;
};
