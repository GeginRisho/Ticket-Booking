import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const normalizeRole = (r) => {
  if (!r) return 'Customer';
  const name = typeof r === 'object' ? (r.role_name || r.name) : r;
  if (!name) return 'Customer';
  const clean = name.toLowerCase().replace(/[\s_]+/g, '');
  if (clean === 'superadmin') return 'Super Admin';
  if (clean === 'admin') return 'Admin';
  if (clean === 'theatreowner' || clean === 'owner') return 'Theatre Owner';
  if (clean === 'eventorganizer' || clean === 'organizer') return 'Event Organizer';
  return 'Customer';
};

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
  const [role, setRole] = useState(() => normalizeRole(localStorage.getItem('role')));
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
            const normalized = normalizeRole(roleStr);
            if (normalized) {
              localStorage.setItem('role', normalized);
              setRole(normalized);
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
      const normalized = normalizeRole(roleStr);
      if (normalized) {
        localStorage.setItem('role', normalized);
        setRole(normalized);
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
      const normalized = normalizeRole(roleStr);
      if (normalized) {
        localStorage.setItem('role', normalized);
        setRole(normalized);
      }
    }
  };

  const switchRole = (newRole) => {
    localStorage.setItem('role', newRole);
    setRole(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    toast.success(`Switched role to ${newRole}`);
  };

  const [isImpersonating, setIsImpersonating] = useState(() => {
    return localStorage.getItem('isImpersonating') === 'true';
  });

  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState(() => {
    const saved = localStorage.getItem('featureFlags');
    return saved ? JSON.parse(saved) : {
      movies: true,
      events: true,
      offers: true,
      coupons: true,
      reviews: true,
      payments: true,
      advertisements: true,
      maintenance: false,
      aiAnalytics: true
    };
  });

  const toggleFeatureFlag = (key) => {
    setFeatureFlags(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('featureFlags', JSON.stringify(updated));
      toast.success(`Feature '${key}' ${updated[key] ? 'enabled' : 'disabled'}`);
      return updated;
    });
  };

  // UI Layout Modes (Compact Mode & Dark Mode)
  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('compactMode') === 'true';
  });

  const toggleCompactMode = () => {
    setCompactMode(prev => {
      const next = !prev;
      localStorage.setItem('compactMode', next ? 'true' : 'false');
      toast.success(`Compact mode ${next ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  const impersonateUser = (targetUser) => {
    // Save current admin session
    localStorage.setItem('originalAdminUser', JSON.stringify(user));
    localStorage.setItem('originalAdminRole', role || 'Super Admin');
    localStorage.setItem('isImpersonating', 'true');
    
    // Set target user details & Theatre Owner role
    const impUser = {
      ...targetUser,
      role: 'Theatre Owner'
    };
    localStorage.setItem('user', JSON.stringify(impUser));
    localStorage.setItem('role', 'Theatre Owner');
    setUser(impUser);
    setRole('Theatre Owner');
    setIsImpersonating(true);
    toast.success(`Now impersonating ${targetUser.name || targetUser.full_name || 'Theatre Owner'}`);
  };

  const stopImpersonating = () => {
    const origUserStr = localStorage.getItem('originalAdminUser');
    const origRoleStr = localStorage.getItem('originalAdminRole');
    
    if (origUserStr) {
      const origUser = JSON.parse(origUserStr);
      localStorage.setItem('user', JSON.stringify(origUser));
      setUser(origUser);
    }
    if (origRoleStr) {
      localStorage.setItem('role', origRoleStr);
      setRole(origRoleStr);
    }
    
    localStorage.removeItem('originalAdminUser');
    localStorage.removeItem('originalAdminRole');
    localStorage.removeItem('isImpersonating');
    setIsImpersonating(false);
    toast.success('Restored Super Admin session successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, role, isAuthenticated, isLoading, isImpersonating,
      featureFlags, toggleFeatureFlag, setFeatureFlags,
      compactMode, toggleCompactMode,
      login, register, logout, updateUser, switchRole, 
      impersonateUser, stopImpersonating,
      setUser, setToken, setRole, setIsAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

