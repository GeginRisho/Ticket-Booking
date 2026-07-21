import React, { useState } from 'react';
import { FiMonitor, FiSmartphone, FiLogOut, FiShieldOff, FiRefreshCw, FiSearch, FiFilter, FiActivity } from 'react-icons/fi';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const mockInitialSessions = [
  { id: 's1', user: 'Super Admin Operational', email: 'super@ticketshow.com', role: 'Super Admin', device: 'Desktop', browser: 'Chrome 126', os: 'Windows 11', ip: '182.73.94.12', location: 'Mumbai, India', loginTime: '2026-07-21 08:30:12', lastActivity: '2 mins ago', status: 'Online' },
  { id: 's2', user: 'Rajesh Sharma', email: 'rajesh@pvr.com', role: 'Theatre Owner', device: 'Desktop', browser: 'Safari 17.5', os: 'macOS Sonoma', ip: '103.44.12.89', location: 'Delhi, India', loginTime: '2026-07-21 09:15:00', lastActivity: '12 mins ago', status: 'Online' },
  { id: 's3', user: 'Aarav Patel', email: 'aarav@gmail.com', role: 'Customer', device: 'Mobile', browser: 'Chrome Mobile', os: 'Android 14', ip: '49.36.192.44', location: 'Bangalore, India', loginTime: '2026-07-21 09:45:20', lastActivity: '1 min ago', status: 'Online' },
  { id: 's4', user: 'Admin Ops Lead', email: 'admin1@ticketshow.com', role: 'Admin', device: 'Desktop', browser: 'Firefox 127', os: 'Linux Ubuntu', ip: '182.73.94.15', location: 'Mumbai, India', loginTime: '2026-07-20 18:00:00', lastActivity: '4 hours ago', status: 'Offline' },
  { id: 's5', user: 'Priya Sharma', email: 'priya@gmail.com', role: 'Customer', device: 'Mobile', browser: 'Mobile Safari', os: 'iOS 17.4', ip: '157.33.18.22', location: 'Pune, India', loginTime: '2026-07-21 07:10:00', lastActivity: '30 mins ago', status: 'Online' }
];

const SessionManagementTable = () => {
  const [sessions, setSessions] = useState(mockInitialSessions);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleForceLogout = (id, email) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success(`Forced logout executed for ${email}`);
  };

  const handleTerminateAll = () => {
    setSessions(prev => prev.filter(s => s.role === 'Super Admin'));
    toast.success('Terminated all active user sessions except current Super Admin');
  };

  const handleBlockDevice = (ip, user) => {
    toast.success(`Blocked IP address ${ip} for user ${user}`);
  };

  const handleResetSession = (id) => {
    toast.success('Session token refreshed successfully');
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.user.toLowerCase().includes(search.toLowerCase()) ||
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          s.ip.includes(search);
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <FiActivity size={22} className="text-primary" />
            <span>Active User Sessions</span>
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Real-time security control panel for active user device tokens, IP logs, and session termination.
          </p>
        </div>
        <Button variant="danger" onClick={handleTerminateAll} className="flex items-center gap-2">
          <FiLogOut size={16} />
          <span>Terminate All Non-Admin Sessions</span>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white border border-border rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <FiSearch size={16} className="absolute left-3 top-3 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by customer, owner, email, or IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-hover-bg/30 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-text-secondary">Role:</span>
          {['ALL', 'Customer', 'Theatre Owner', 'Admin', 'Super Admin'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                roleFilter === r ? 'bg-primary text-text-primary border-primary' : 'bg-white text-text-secondary hover:border-text-primary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-text-secondary">Status:</span>
          {['ALL', 'Online', 'Offline'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                statusFilter === st ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-text-secondary hover:border-text-primary'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-xs font-black text-text-secondary uppercase tracking-wider">
              <th className="px-6 py-4">User & Role</th>
              <th className="px-6 py-4">Device / OS</th>
              <th className="px-6 py-4">IP & Location</th>
              <th className="px-6 py-4">Login Time & Activity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {filteredSessions.map((s) => (
              <tr key={s.id} className="hover:bg-hover-bg/30 transition-colors">
                <td className="px-6 py-4 font-bold">
                  <p className="text-text-primary font-extrabold text-sm">{s.user}</p>
                  <p className="text-text-secondary font-mono text-[11px]">{s.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary font-black text-[10px] rounded-full uppercase">
                    {s.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-semibold text-text-primary">
                    {s.device === 'Mobile' ? <FiSmartphone size={16} className="text-amber-500" /> : <FiMonitor size={16} className="text-blue-500" />}
                    <span>{s.browser}</span>
                  </div>
                  <span className="text-text-secondary font-mono text-[11px] block mt-0.5">{s.os}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-text-primary">{s.ip}</span>
                  <span className="text-text-secondary block font-medium mt-0.5">{s.location}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-text-primary block">{s.loginTime}</span>
                  <span className="text-green-600 font-bold block mt-0.5">Active {s.lastActivity}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    s.status === 'Online' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleForceLogout(s.id, s.email)}
                      title="Force Logout"
                      className="p-2 text-danger hover:bg-red-50 rounded-xl transition-all font-bold border border-red-200 cursor-pointer"
                    >
                      <FiLogOut size={14} />
                    </button>
                    <button
                      onClick={() => handleBlockDevice(s.ip, s.user)}
                      title="Block Device IP"
                      className="p-2 text-amber-700 hover:bg-amber-50 rounded-xl transition-all font-bold border border-amber-200 cursor-pointer"
                    >
                      <FiShieldOff size={14} />
                    </button>
                    <button
                      onClick={() => handleResetSession(s.id)}
                      title="Reset Session Token"
                      className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all font-bold border border-primary/30 cursor-pointer"
                    >
                      <FiRefreshCw size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionManagementTable;
