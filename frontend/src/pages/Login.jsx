import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      toast.success('Successfully logged in!');
      
      const userData = res.user || res.data?.user || res.data;
      const rawRole = res.role || userData?.role?.role_name || userData?.role || 'Customer';
      let roleStr = rawRole;
      if (rawRole === 'Owner') roleStr = 'Theatre Owner';
      if (rawRole === 'Organizer') roleStr = 'Event Organizer';

      // Automatic dashboard redirection based on roles
      let redirectPath = '/';
      if (roleStr === 'Super Admin') {
        redirectPath = '/super-admin/dashboard';
      } else if (roleStr === 'Admin') {
        redirectPath = '/admin/dashboard';
      } else if (roleStr === 'Theatre Owner') {
        redirectPath = '/owner/dashboard';
      } else if (roleStr === 'Event Organizer') {
        redirectPath = '/dashboard/organizer';
      }

      const destination = location.state?.from?.pathname || redirectPath;
      navigate(destination, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillDemo = (emailVal, passVal, label) => {
    setEmail(emailVal);
    setPassword(passVal);
    toast.success(`Demo credentials loaded for ${label}!`);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-50 px-4 py-12 gap-8 relative overflow-hidden text-left">
      {/* Decorative gradient overlay */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Card className="p-8 shadow-md bg-white border border-gray-200 rounded-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">Sign in to manage your tickets and events</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 font-black rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 font-semibold mt-8 text-center">
            New to TicketShow?{' '}
            <Link to="/register" className="font-bold text-amber-500 hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </motion.div>

      {/* Demo Accounts Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-sm z-10"
      >
        <Card className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-black text-lg text-gray-900">Demo Login Accounts</h3>
            <p className="text-[11px] font-semibold text-gray-500 mt-0.5">Click any role below to automatically fill credentials:</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Super Admin', email: 'superadmin@ticketshow.com', pass: 'Admin@123', color: 'bg-red-50 border-red-200 text-red-800' },
              { label: 'Admin', email: 'admin@ticketshow.com', pass: 'Admin@123', color: 'bg-blue-50 border-blue-200 text-blue-800' },
              { label: 'Theatre Owner', email: 'owner@ticketshow.com', pass: 'Owner@123', color: 'bg-purple-50 border-purple-200 text-purple-800' },
              { label: 'Customer', email: 'customer@ticketshow.com', pass: 'Customer@123', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' }
            ].map((role) => (
              <button
                key={role.label}
                onClick={() => autofillDemo(role.email, role.pass, role.label)}
                className={`w-full p-3.5 border rounded-2xl text-left cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col gap-0.5 bg-white border-gray-200`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-gray-800">{role.label}</span>
                  <span className="text-[9px] font-extrabold uppercase bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full shadow-xs">Autofill</span>
                </div>
                <div className="text-[10px] font-semibold text-gray-500 mt-1">Email: <span className="font-mono text-gray-700">{role.email}</span></div>
                <div className="text-[10px] font-semibold text-gray-500">Pass: <span className="font-mono text-gray-700">{role.pass}</span></div>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
