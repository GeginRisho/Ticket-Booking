import React, { createContext, useContext, useState, useEffect } from'react';
import * as authService from'../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [token, setToken] = useState(localStorage.getItem('token'));
 const [isAuthenticated, setIsAuthenticated] = useState(!!token);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const fetchUser = async () => {
 if (token) {
 try {
 const profileData = await authService.getMe();
 // Assuming profileData returns user details, sometimes inside a'data' object
 setUser(profileData.data || profileData.user || profileData);
 setIsAuthenticated(true);
 } catch (error) {
 console.error("Failed to fetch user profile", error);
 setUser(null);
 setIsAuthenticated(false);
 // Don't strictly clear token here, api interceptor might be trying to refresh it
 }
 } else {
 setUser(null);
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
 const accessToken = data.accessToken || data.token;
 const refreshToken = data.refreshToken; // Handle if returned in body
 
 if (accessToken) {
 localStorage.setItem('token', accessToken);
 setToken(accessToken);
 }
 if (refreshToken) {
 localStorage.setItem('refreshToken', refreshToken);
 }
 
 setUser(data.user || data.data);
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
 await authService.logout(refreshToken).catch(console.error); // Ignore errors on logout
 }
 } finally {
 localStorage.removeItem('token');
 localStorage.removeItem('refreshToken');
 setToken(null);
 setUser(null);
 setIsAuthenticated(false);
 setIsLoading(false);
 }
 };

 const updateUser = (newUserData) => {
 setUser(newUserData);
 };

 return (
 <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout, updateUser }}>
 {children}
 </AuthContext.Provider>
 );
};
