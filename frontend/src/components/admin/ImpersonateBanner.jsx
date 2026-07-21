import React from 'react';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ImpersonateBanner = () => {
  const { isImpersonating, user, stopImpersonating } = useAuth();
  const navigate = useNavigate();

  if (!isImpersonating) return null;

  const ownerName = user?.full_name || user?.name || user?.business_name || 'Theatre Owner';

  const handleReturn = () => {
    stopImpersonating();
    navigate('/super-admin/dashboard');
  };

  return (
    <div className="bg-amber-500 text-gray-950 font-bold px-6 py-2.5 flex items-center justify-between shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-3 text-sm">
        <FiAlertTriangle size={18} className="text-gray-900" />
        <span>
          You are currently impersonating <strong className="underline decoration-2">{ownerName}</strong>.
        </span>
      </div>
      <button
        onClick={handleReturn}
        className="flex items-center gap-2 bg-gray-950 text-amber-400 hover:bg-gray-900 px-4 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm focus:ring-2 focus:ring-amber-300 cursor-pointer"
      >
        <FiArrowLeft size={14} />
        <span>Return to Super Admin</span>
      </button>
    </div>
  );
};

export default ImpersonateBanner;
