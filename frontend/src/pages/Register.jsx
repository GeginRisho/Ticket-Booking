import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../utils/constants';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cityId: CITIES[0]?.id || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const rawRole = user.role?.role_name || user.role || 'Customer';
      let roleStr = rawRole;
      if (rawRole === 'Owner') roleStr = 'Theatre Owner';
      if (rawRole === 'Organizer') roleStr = 'Event Organizer';

      let redirectPath = '/dashboard';
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
  }, [isAuthenticated, user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    setIsSubmitting(true);
    try {
      await register({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city_id: formData.cityId
      });
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Check validator requirements.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 relative overflow-hidden text-left">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[500px] z-10"
      >
        <Card className="p-6 md:p-8 shadow-md bg-white border border-gray-200 rounded-3xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block text-2xl font-black tracking-tighter text-amber-500 mb-3">
              Ticket<span className="text-gray-900">Show</span>
            </Link>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">Join TicketShow to browse movies and reserve seats</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="john@doe.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Phone Number (E.164 format)"
              placeholder="+919876543210"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <div className="flex flex-col text-left">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1">City Location</label>
              <select
                value={formData.cityId}
                onChange={e => setFormData({ ...formData, cityId: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white text-sm font-semibold transition-colors"
              >
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.city_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 font-black rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-sm mt-4 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 font-semibold mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-500 hover:underline">
              Sign In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
