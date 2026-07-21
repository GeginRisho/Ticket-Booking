import React from 'react';
import { FiCheck, FiX, FiShield, FiLock } from 'react-icons/fi';

const permissionsData = [
  { feature: 'Approve Theatre Owner', admin: true, superAdmin: true, description: 'Verify KYC & approve business registration' },
  { feature: 'Delete Theatre', admin: true, superAdmin: true, description: 'Permanently remove theatre & screen data' },
  { feature: 'Create Admin User', admin: false, superAdmin: true, description: 'Invite & provision operational admins' },
  { feature: 'Delete Admin User', admin: false, superAdmin: true, description: 'Revoke admin credentials & access' },
  { feature: 'Brand Settings & Logo', admin: false, superAdmin: true, description: 'Custom white-label branding & primary palette' },
  { feature: 'System Configuration', admin: false, superAdmin: true, description: 'Convenience fees, GST rates, currencies & cities' },
  { feature: 'Payment Gateway Setup', admin: false, superAdmin: true, description: 'Razorpay & Stripe live API keys & secrets' },
  { feature: 'Database Backup & Restore', admin: false, superAdmin: true, description: 'Execute instant DB snapshots & restore points' },
  { feature: 'Audit Logs Inspection', admin: 'READ_ONLY', superAdmin: 'FULL', description: 'Track every admin login, edit, refund & config change' },
  { feature: 'Broadcast Notifications', admin: true, superAdmin: true, description: 'Send push, email & SMS announcements' },
  { feature: 'Feature Flags Control', admin: false, superAdmin: true, description: 'Toggle platform capabilities without code deployments' },
  { feature: 'Impersonate Theatre Owner', admin: false, superAdmin: true, description: 'Live session switch to view owner panel' },
  { feature: 'Force Session Termination', admin: false, superAdmin: true, description: 'Kill suspicious active user sessions & block devices' }
];

const PermissionsMatrixTable = () => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <FiShield size={22} className="text-primary" />
            <span>Role Permissions Matrix</span>
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            System authorization matrix defining operational boundaries between Admin and Super Admin roles.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full border border-green-200">
            <FiCheck size={14} /> Full Access
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full border border-red-200">
            <FiX size={14} /> Restricted Access
          </span>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-xs font-black text-text-secondary uppercase tracking-wider">
              <th className="px-6 py-4">Platform Feature Capability</th>
              <th className="px-6 py-4 text-center w-36">Admin</th>
              <th className="px-6 py-4 text-center w-36">Super Admin</th>
              <th className="px-6 py-4">Security Policy & Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {permissionsData.map((row, idx) => (
              <tr key={idx} className="hover:bg-hover-bg/40 transition-colors">
                <td className="px-6 py-4 font-bold text-text-primary">{row.feature}</td>
                <td className="px-6 py-4 text-center">
                  {row.admin === true ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-green-100 text-green-700 rounded-full font-black text-sm">
                      ✔
                    </span>
                  ) : row.admin === 'READ_ONLY' ? (
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 font-extrabold text-[11px] rounded-full">
                      Read Only
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-red-100 text-red-700 rounded-full font-black text-sm">
                      ✖
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-green-100 text-green-700 rounded-full font-black text-sm">
                    ✔
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-text-secondary font-medium">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsMatrixTable;
