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
      const roleStr = userData.role?.role_name || userData.role || 'Customer';

      // Automatic dashboard redirection based on roles
      let redirectPath = '/dashboard/customer';
      if (roleStr === 'Admin') {
        redirectPath = '/dashboard/admin';
      } else if (roleStr === 'Theatre Owner') {
        redirectPath = '/dashboard/theatre-owner';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Card className="p-8 shadow-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Welcome Back</h2>
            <p className="text-sm text-text-secondary mt-1">Sign in to manage your tickets and events</p>
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
                <label className="block text-sm font-semibold text-text-primary">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 font-bold"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <p className="text-sm text-text-secondary mt-8 text-center">
            New to TicketShow?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
