import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/authService';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const Login = () => {
  useDocumentTitle('Sign In', 'Log in to your TicketShow account to reserve tickets and manage bookings.');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, setUser, setToken, setRole, setIsAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = location.state?.from?.pathname;
      if (destination) {
        navigate(destination, { replace: true });
        return;
      }

      const rawRole = user.role?.role_name || user.role || 'Customer';
      let roleStr = rawRole;
      if (rawRole === 'Owner') roleStr = 'Theatre Owner';
      if (rawRole === 'Organizer') roleStr = 'Event Organizer';

      let redirectPath = '/';
      if (roleStr === 'Super Admin') {
        redirectPath = '/super-admin/dashboard';
      } else if (roleStr === 'Admin') {
        redirectPath = '/admin/dashboard';
      } else if (roleStr === 'Theatre Owner') {
        redirectPath = '/theatre/dashboard';
      } else if (roleStr === 'Event Organizer') {
        redirectPath = '/organizer/dashboard';
      }
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      
      const userData = res.user || res.data?.user || res.data;
      const accessToken = res.token || res.data?.accessToken || res.accessToken;
      const rawRole = res.role || userData?.role?.role_name || userData?.role || 'Customer';
      let roleStr = rawRole;
      if (rawRole === 'Owner') roleStr = 'Theatre Owner';
      if (rawRole === 'Organizer') roleStr = 'Event Organizer';

      // Save token, user, role to localStorage
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
      }
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      if (roleStr) {
        localStorage.setItem('role', roleStr);
        setRole(roleStr);
      }
      setIsAuthenticated(true);

      // Fetch /api/auth/me
      try {
        const profileData = await getMe();
        const freshUserObj = profileData.data || profileData.user || profileData;
        if (freshUserObj) {
          localStorage.setItem('user', JSON.stringify(freshUserObj));
          setUser(freshUserObj);
          const freshRole = freshUserObj.role?.role_name || freshUserObj.role;
          if (freshRole) {
            localStorage.setItem('role', freshRole);
            setRole(freshRole);
          }
        }
      } catch (err) {
        console.error("Failed to fetch /api/auth/me during login redirect sequence:", err);
      }

      toast.success('Successfully logged in!');
      
      // Determine redirection path (Customer redirects to /)
      let redirectPath = '/';
      if (roleStr === 'Super Admin') {
        redirectPath = '/super-admin/dashboard';
      } else if (roleStr === 'Admin') {
        redirectPath = '/admin/dashboard';
      } else if (roleStr === 'Theatre Owner') {
        redirectPath = '/theatre/dashboard';
      } else if (roleStr === 'Event Organizer') {
        redirectPath = '/organizer/dashboard';
      }

      let destination = location.state?.from?.pathname;
      if (roleStr === 'Customer' || !destination || (destination.startsWith('/admin') || destination.startsWith('/super-admin') || destination.startsWith('/theatre') || destination.startsWith('/organizer'))) {
        destination = roleStr === 'Customer' ? '/' : redirectPath;
      }
      navigate(destination, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 relative overflow-hidden text-left">
      {/* Decorative gradient overlay */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px] z-10"
      >
        <Card className="p-6 md:p-8 shadow-md bg-white border border-gray-200 rounded-3xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block text-2xl font-black tracking-tighter text-amber-500 mb-3">
              Ticket<span className="text-gray-900">Show</span>
            </Link>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">Sign in to manage your tickets and events</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-extrabold text-gray-500 uppercase">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-amber-500 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white text-sm font-semibold transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs font-semibold text-gray-600 cursor-pointer select-none">
                Remember me on this device
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 font-black rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-sm transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 font-semibold mt-6 text-center">
            New to TicketShow?{' '}
            <Link to="/register" className="font-bold text-amber-500 hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
