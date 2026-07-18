import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token is missing in the URL path');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Your password has been reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-gray-200 rounded-3xl shadow-md">
        <div>
          <h2 className="text-center text-3xl font-black text-gray-900">Reset Password</h2>
          <p className="mt-2 text-center text-xs font-semibold text-gray-600">
            Please enter your new account password credentials.
          </p>
        </div>

        {!token ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-2xl">
            Reset token is missing from the URL query. Please trigger forgot-password again to obtain a valid token.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, 1 upper, 1 special, 1 number"
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full font-black py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-sm"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Set New Password'}
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-gray-600 hover:text-amber-500 transition-colors">
            Back to Sign In <FiArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
