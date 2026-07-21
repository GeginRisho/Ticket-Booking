import React from 'react';
import { FiSliders, FiCheck, FiX, FiMoon, FiSun, FiMaximize2, FiMinimize2, FiLayers, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import toast from 'react-hot-toast';

const DashboardCustomizer = () => {
  const { featureFlags, toggleFeatureFlag, compactMode, toggleCompactMode } = useAuth();

  const flagLabels = [
    { key: 'movies', label: 'Movie Management & Catalogs', desc: 'Enable movie additions, now showing & coming soon scheduling' },
    { key: 'events', label: 'Live Events & Concerts Module', desc: 'Enable live concert ticket sales and organizer dashboards' },
    { key: 'offers', label: 'Promotional Offers & Coupons', desc: 'Enable festival codes, promo vouchers & discount calculations' },
    { key: 'coupons', label: 'Coupon Management System', desc: 'Allow admins to publish new coupon campaigns' },
    { key: 'reviews', label: 'Customer Reviews & Moderation', desc: 'Enable star ratings and customer review submissions' },
    { key: 'payments', label: 'Payment Gateway Integrations', desc: 'Enable Razorpay & Stripe online checkout processing' },
    { key: 'advertisements', label: 'Advertisement & CMS Banners', desc: 'Enable homepage hero banners and popup ad placements' },
    { key: 'maintenance', label: 'Platform Maintenance Mode', desc: 'Temporarily restrict customer checkout with maintenance banner' },
    { key: 'aiAnalytics', label: 'AI Occupancy & Revenue Forecasting', desc: 'Enable predictive machine learning models in BI dashboard' }
  ];

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
          <FiSliders size={22} className="text-primary" />
          <span>Dashboard Customization & Feature Flags Center</span>
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Customize UI layout density, toggle platform feature capabilities, and manage live operational flags without code deployments.
        </p>
      </div>

      {/* UI Layout Customization Card */}
      <Card className="space-y-6">
        <h4 className="font-extrabold text-base text-text-primary flex items-center gap-2 border-b border-border pb-3">
          <FiLayers size={18} className="text-blue-500" />
          <span>UI Layout & Visual Preferences</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-border rounded-2xl flex items-center justify-between bg-hover-bg/30">
            <div>
              <p className="font-bold text-sm text-text-primary">Compact Density Layout</p>
              <p className="text-xs text-text-secondary mt-0.5">Reduce padding & table heights for high-density screens</p>
            </div>
            <button
              onClick={toggleCompactMode}
              className={`p-2.5 rounded-xl border font-bold transition-all flex items-center gap-2 cursor-pointer ${
                compactMode ? 'bg-primary text-text-primary border-primary' : 'bg-white text-text-secondary hover:border-text-primary'
              }`}
            >
              {compactMode ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
              <span className="text-xs">{compactMode ? 'Compact On' : 'Standard'}</span>
            </button>
          </div>

          <div className="p-4 border border-border rounded-2xl flex items-center justify-between bg-hover-bg/30">
            <div>
              <p className="font-bold text-sm text-text-primary">Admin Control Center Theme</p>
              <p className="text-xs text-text-secondary mt-0.5">High-contrast enterprise aesthetic styling</p>
            </div>
            <span className="px-3 py-1.5 bg-gray-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5">
              <FiSun size={14} className="text-amber-400" /> Enterprise Light Mode
            </span>
          </div>
        </div>
      </Card>

      {/* Super Admin Feature Flags Grid */}
      <Card className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h4 className="font-extrabold text-base text-text-primary flex items-center gap-2">
              <FiSliders size={18} className="text-primary" />
              <span>Runtime Platform Feature Flags</span>
            </h4>
            <p className="text-xs text-text-secondary mt-0.5">Dynamically enable or disable core system modules across the application.</p>
          </div>
          <button
            onClick={() => toast.success('Feature flag state synchronized with global cache')}
            className="text-xs text-primary font-bold hover:underline cursor-pointer"
          >
            Sync All Flags
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flagLabels.map((flag) => {
            const isEnabled = !!featureFlags[flag.key];
            return (
              <div key={flag.key} className="p-4 border border-border rounded-2xl flex items-start justify-between bg-white hover:border-primary/40 transition-all">
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-text-primary">{flag.label}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{flag.desc}</p>
                </div>
                <button
                  onClick={() => toggleFeatureFlag(flag.key)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isEnabled ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {isEnabled ? <FiToggleRight size={28} /> : <FiToggleLeft size={28} />}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default DashboardCustomizer;
