import React, { createContext, useContext, useState, useEffect } from'react';
import * as authService from'../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const profileData = await authService.getMe();
          const userObj = profileData.data || profileData.user || profileData;
          setUser(userObj);
          setIsAuthenticated(true);
          if (userObj) {
            localStorage.setItem('user', JSON.stringify(userObj));
            const roleStr = userObj.role?.role_name || userObj.role;
            if (roleStr) {
              localStorage.setItem('role', roleStr);
              setRole(roleStr);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      // Support both new direct response structure { token, user, role } and old { data: { user, accessToken, refreshToken } }
      const accessToken = data.token || data.data?.accessToken || data.accessToken;
      const userObj = data.user || data.data?.user || data.data;
      const roleStr = data.role || userObj?.role?.role_name || userObj?.role;
      const refreshToken = data.refreshToken || data.data?.refreshToken;
      
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (userObj) {
        localStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj);
      }
      if (roleStr) {
        localStorage.setItem('role', roleStr);
        setRole(roleStr);
      }
      
      setIsAuthenticated(true);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const data = await authService.register(userData);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken).catch(console.error);
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setToken(null);
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    if (newUserData) {
      localStorage.setItem('user', JSON.stringify(newUserData));
      const roleStr = newUserData.role?.role_name || newUserData.role;
      if (roleStr) {
        localStorage.setItem('role', roleStr);
        setRole(roleStr);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
