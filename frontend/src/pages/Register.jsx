import React, { useState } from 'react';
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
    roleName: 'Customer',
    cityId: CITIES[0]?.id || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

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
        role_name: formData.roleName,
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg z-10"
      >
        <Card className="p-8 shadow-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Create Account</h2>
            <p className="text-sm text-text-secondary mt-1">Join TicketShow to browse movies and reserve seats</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col text-left">
                <label className="block text-sm font-semibold text-text-primary mb-2">Register As</label>
                <select
                  value={formData.roleName}
                  onChange={e => setFormData({ ...formData, roleName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Customer">Movie & Event Goer</option>
                  <option value="Theatre Owner">Theatre Owner</option>
                  <option value="Event Organizer">Event Organizer</option>
                </select>
              </div>

              <div className="flex flex-col text-left">
                <label className="block text-sm font-semibold text-text-primary mb-2">City Location</label>
                <select
                  value={formData.cityId}
                  onChange={e => setFormData({ ...formData, cityId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {CITIES.map(c => (
                    <option key={c.id} value={c.id}>{c.city_name}</option>
                  ))}
                </select>
              </div>
            </div>

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
              placeholder="9876543210"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Password123!"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 font-bold mt-4"
              isLoading={isSubmitting}
            >
              Get Started
            </Button>
          </form>

          <p className="text-sm text-text-secondary mt-8 text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
