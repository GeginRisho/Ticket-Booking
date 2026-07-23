import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { useAuth, normalizeRole } from '../context/AuthContext';
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
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineErrors, setInlineErrors] = useState({});

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const roleStr = normalizeRole(user.role);

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

  // Live Password Criteria Checks
  const passwordRules = [
    { label: 'Minimum 8 characters', valid: formData.password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(formData.password) },
    { label: 'One number (0-9)', valid: /\d/.test(formData.password) },
    { label: 'One special character (@$!%*?&)', valid: /[@$!%*?&]/.test(formData.password) },
  ];

  const isPasswordValid = passwordRules.every(r => r.valid);

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email address';
    }
    const cleanPhone = formData.phone.trim();
    if (!cleanPhone || !/^(?:\+91|91)?[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }
    if (!isPasswordValid) {
      errors.password = 'Password does not meet the complexity requirements.';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setInlineErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setInlineErrors(errors);
      const firstErrKey = Object.keys(errors)[0];
      toast.error(errors[firstErrKey]);

      // Autofocus first invalid field
      if (firstErrKey === 'fullName' && nameRef.current) nameRef.current.focus();
      else if (firstErrKey === 'email' && emailRef.current) emailRef.current.focus();
      else if (firstErrKey === 'phone' && phoneRef.current) phoneRef.current.focus();
      else if (firstErrKey === 'password' && passwordRef.current) passwordRef.current.focus();
      else if (firstErrKey === 'confirmPassword' && confirmPasswordRef.current) confirmPasswordRef.current.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });
      toast.success('Account created successfully. Please sign in.');
      navigate('/login');
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message || '';
      let userFriendlyMsg = 'Registration failed. Please check your information.';
      
      if (serverMsg.toLowerCase().includes('password')) {
        userFriendlyMsg = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.';
        setInlineErrors(prev => ({ ...prev, password: userFriendlyMsg }));
      } else if (serverMsg.toLowerCase().includes('phone')) {
        userFriendlyMsg = 'Please enter a valid 10-digit Indian mobile number.';
        setInlineErrors(prev => ({ ...prev, phone: userFriendlyMsg }));
      } else if (serverMsg.toLowerCase().includes('email')) {
        userFriendlyMsg = serverMsg.includes('already registered') ? 'Email is already registered. Please login.' : 'Please enter a valid email address.';
        setInlineErrors(prev => ({ ...prev, email: userFriendlyMsg }));
      } else if (serverMsg) {
        userFriendlyMsg = serverMsg;
      }
      
      toast.error(userFriendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 relative overflow-hidden text-left sm:safe-top sm:safe-bottom">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[550px] z-10"
      >
        <Card className="p-6 sm:p-8 shadow-md bg-white border border-gray-200 rounded-3xl">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block text-2xl font-black tracking-tighter text-amber-500 mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg">
              Ticket<span className="text-gray-900">Show</span>
            </Link>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-xs text-gray-500 font-semibold mt-1">Join TicketShow to book movie & event tickets instantly</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <Input
                ref={nameRef}
                label="Full Name"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={e => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (inlineErrors.fullName) setInlineErrors({ ...inlineErrors, fullName: null });
                }}
                className={`min-h-[44px] ${inlineErrors.fullName ? 'border-red-500 bg-red-50/20' : ''}`}
                required
              />
              {inlineErrors.fullName && (
                <p className="text-xs text-red-600 font-semibold mt-1">{inlineErrors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  ref={emailRef}
                  label="Email Address"
                  type="email"
                  placeholder="john@doe.com"
                  value={formData.email}
                  onChange={e => {
                    setFormData({ ...formData, email: e.target.value });
                    if (inlineErrors.email) setInlineErrors({ ...inlineErrors, email: null });
                  }}
                  className={`min-h-[44px] ${inlineErrors.email ? 'border-red-500 bg-red-50/20' : ''}`}
                  required
                />
                {inlineErrors.email && (
                  <p className="text-xs text-red-600 font-semibold mt-1">{inlineErrors.email}</p>
                )}
              </div>

              <div>
                <Input
                  ref={phoneRef}
                  label="Phone Number"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={e => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (inlineErrors.phone) setInlineErrors({ ...inlineErrors, phone: null });
                  }}
                  className={`min-h-[44px] ${inlineErrors.phone ? 'border-red-500 bg-red-50/20' : ''}`}
                  required
                />
                {inlineErrors.phone && (
                  <p className="text-xs text-red-600 font-semibold mt-1">{inlineErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  ref={passwordRef}
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => {
                    setFormData({ ...formData, password: e.target.value });
                    if (inlineErrors.password) setInlineErrors({ ...inlineErrors, password: null });
                  }}
                  className={`min-h-[44px] ${inlineErrors.password ? 'border-red-500 bg-red-50/20' : ''}`}
                  required
                />
              </div>

              <div>
                <Input
                  ref={confirmPasswordRef}
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (inlineErrors.confirmPassword) setInlineErrors({ ...inlineErrors, confirmPassword: null });
                  }}
                  className={`min-h-[44px] ${inlineErrors.confirmPassword ? 'border-red-500 bg-red-50/20' : ''}`}
                  required
                />
                {inlineErrors.confirmPassword && (
                  <p className="text-xs text-red-600 font-semibold mt-1">{inlineErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password checklist */}
            <div className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-left space-y-1.5 mt-2">
              <p className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider mb-1">
                Password Requirements
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-xs">
                {passwordRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className={`p-0.5 rounded-full ${rule.valid ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-400'}`}>
                      {rule.valid ? <FiCheck size={12} /> : <FiX size={12} />}
                    </span>
                    <span className={`font-semibold text-[11px] ${rule.valid ? 'text-green-700 font-bold' : 'text-gray-500'}`}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {inlineErrors.password && (
              <p className="text-xs text-red-600 font-semibold">{inlineErrors.password}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full min-h-[44px] py-3.5 font-black rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-sm mt-4 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FiLoader size={18} className="animate-spin text-gray-900" />
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-xs text-gray-500 font-semibold mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded">
              Sign In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
