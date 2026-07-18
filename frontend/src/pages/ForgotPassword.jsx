import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success('Reset link generated successfully!');
      if (res.data?.resetToken) {
        setTokenGenerated(res.data.resetToken);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-gray-200 rounded-3xl shadow-md">
        <div>
          <h2 className="text-center text-3xl font-black text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-center text-xs font-semibold text-gray-600">
            Enter your email and we'll generate a password recovery token.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. customer@ticketshow.com"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full font-black py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-sm"
            disabled={loading}
          >
            {loading ? 'Requesting...' : 'Generate Reset Token'}
          </Button>
        </form>

        {tokenGenerated && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 mt-4">
            <h4 className="font-extrabold text-sm text-amber-800 flex items-center gap-1.5">
              <FiAlertCircle /> Dev Token Bypass
            </h4>
            <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
              For testing convenience, here is your password reset link:
            </p>
            <Link 
              to={`/reset-password?token=${tokenGenerated}`}
              className="block break-all font-mono text-[10px] text-blue-600 hover:underline bg-white border border-amber-200/60 p-2 rounded-xl"
            >
              /reset-password?token={tokenGenerated}
            </Link>
          </div>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-gray-600 hover:text-amber-500 transition-colors">
            <FiArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
