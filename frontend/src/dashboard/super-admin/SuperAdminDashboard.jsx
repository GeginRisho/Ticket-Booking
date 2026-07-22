import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiGrid, FiUsers, FiUser, FiShield, FiSettings, FiLayout, FiPercent, 
  FiDollarSign, FiActivity, FiBell, FiDatabase, FiLock, FiCpu, FiRadio, 
  FiFolder, FiMail, FiTerminal, FiSliders, FiTrendingUp, FiZap, FiPlus, FiTrash2, FiEdit3, FiRotateCcw
} from 'react-icons/fi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

import PermissionsMatrixTable from '../../components/admin/PermissionsMatrixTable';
import SessionManagementTable from '../../components/admin/SessionManagementTable';
import PlatformHealthGrid from '../../components/admin/PlatformHealthGrid';
import ActivityFeedList from '../../components/admin/ActivityFeedList';
import SystemBackupManager from '../../components/admin/SystemBackupManager';
import FileManagerModal from '../../components/admin/FileManagerModal';
import EmailTemplateEditor from '../../components/admin/EmailTemplateEditor';
import SystemLogViewer from '../../components/admin/SystemLogViewer';
import DashboardCustomizer from '../../components/admin/DashboardCustomizer';
import BiDashboardView from '../../components/admin/BiDashboardView';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const mockAdminsList = [
  { id: 'a1', name: 'Super Admin Primary', email: 'super@ticketshow.com', role: 'Super Admin', status: 'Active' },
  { id: 'a2', name: 'Admin Ops Lead', email: 'admin1@ticketshow.com', role: 'Admin', status: 'Active' },
  { id: 'a3', name: 'Compliance Officer', email: 'audit@ticketshow.com', role: 'Admin', status: 'Active' }
];

const mockOwnersList = [
  { id: 'o1', name: 'Rajesh Sharma', business: 'PVR Limited', email: 'rajesh@pvr.com', theatres: 14, status: 'Active' },
  { id: 'o2', name: 'Vikram Seth', business: 'Cinepolis South', email: 'vikram@cinepolis.com', theatres: 8, status: 'Active' },
  { id: 'o3', name: 'Ananya Roy', business: 'Inox Leisure', email: 'ananya@inox.in', theatres: 10, status: 'Active' }
];

const mockAuditLogs = [
  { id: 'au1', user: 'super@ticketshow.com', role: 'Super Admin', action: 'Approved Theatre Owner application for Rex Cinemas', target: 'Rex Cinemas', ip: '182.73.94.12', browser: 'Chrome 126 / Windows', date: '2026-07-21 10:14:02' },
  { id: 'au2', user: 'admin1@ticketshow.com', role: 'Admin', action: 'Issued refund ₹1,250 for Booking #BK-90482', target: 'BK-90482', ip: '182.73.94.15', browser: 'Firefox 127 / Linux', date: '2026-07-21 09:30:15' },
  { id: 'au3', user: 'super@ticketshow.com', role: 'Super Admin', action: 'Updated convenience fee rate to 10%', target: 'System Config', ip: '182.73.94.12', browser: 'Chrome 126 / Windows', date: '2026-07-20 17:45:00' }
];

import useDocumentTitle from '../../hooks/useDocumentTitle';

const SuperAdminDashboard = () => {
  useDocumentTitle('Super Admin Control Center', 'Global governance, platform configuration, admin management, role matrix, and system analytics.');
  const { user, impersonateUser, featureFlags } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getSubtabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/bi-dashboard')) return 'bi-dashboard';
    if (path.includes('/admins')) return 'admins';
    if (path.includes('/owners')) return 'owners';
    if (path.includes('/roles')) return 'roles';
    if (path.includes('/platform-config') || path.includes('/profile') || path.includes('/settings')) return 'config';
    if (path.includes('/cms')) return 'cms';
    if (path.includes('/ads')) return 'ads';
    if (path.includes('/payments')) return 'payments';
    if (path.includes('/audit-logs')) return 'audits';
    if (path.includes('/notifications')) return 'notifications';
    if (path.includes('/database')) return 'database';
    if (path.includes('/sessions')) return 'sessions';
    if (path.includes('/platform-health')) return 'health';
    if (path.includes('/activity-feed')) return 'activity';
    if (path.includes('/file-manager')) return 'file-manager';
    if (path.includes('/email-templates')) return 'email-templates';
    if (path.includes('/system-logs')) return 'system-logs';
    if (path.includes('/customizer')) return 'customizer';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getSubtabFromPath());

  useEffect(() => {
    setActiveTab(getSubtabFromPath());
  }, [location.pathname]);

  const [admins, setAdmins] = useState(mockAdminsList);
  const [owners, setOwners] = useState(mockOwnersList);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isFileLibraryOpen, setIsFileLibraryOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '', role: 'Admin' });

  // Platform Config States
  const [bookingFee, setBookingFee] = useState('20');
  const [convenienceFee, setConvenienceFee] = useState('10');
  const [organizerCommission, setOrganizerCommission] = useState('15');
  const [gstRate, setGstRate] = useState('18');
  const [currency, setCurrency] = useState('INR (₹)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleCreateAdminSubmit = (e) => {
    e.preventDefault();
    if (!newAdminForm.name || !newAdminForm.email) return;
    setAdmins(prev => [...prev, { id: 'a_' + Date.now(), ...newAdminForm, status: 'Active' }]);
    toast.success(`Created admin account for ${newAdminForm.name}`);
    setIsCreateAdminOpen(false);
    setNewAdminForm({ name: '', email: '', password: '', role: 'Admin' });
  };

  const handleImpersonate = (owner) => {
    impersonateUser(owner);
    navigate('/theatre/dashboard');
  };

  const superAdminTabs = [
    { id: 'overview', label: 'Platform Dashboard', icon: FiGrid },
    { id: 'bi-dashboard', label: 'BI Analytics', icon: FiTrendingUp },
    { id: 'admins', label: 'Manage Admins', icon: FiUsers },
    { id: 'owners', label: 'Theatre Owners & Impersonate', icon: FiUser },
    { id: 'roles', label: 'Role Permissions Matrix', icon: FiShield },
    { id: 'config', label: 'Platform Config', icon: FiSettings },
    { id: 'cms', label: 'Homepage CMS', icon: FiLayout },
    { id: 'ads', label: 'Ad Management', icon: FiPercent },
    { id: 'payments', label: 'Payments & Gateway', icon: FiDollarSign },
    { id: 'audits', label: 'System Audit Logs', icon: FiActivity },
    { id: 'notifications', label: 'Broadcast Campaigns', icon: FiBell },
    { id: 'database', label: 'Database & Backups', icon: FiDatabase },
    { id: 'sessions', label: 'User Sessions', icon: FiLock },
    { id: 'health', label: 'Platform Health', icon: FiCpu },
    { id: 'activity', label: 'Live Activity Feed', icon: FiRadio },
    { id: 'file-manager', label: 'Media Library', icon: FiFolder },
    { id: 'email-templates', label: 'Email Templates', icon: FiMail },
    { id: 'system-logs', label: 'System Logs', icon: FiTerminal },
    { id: 'customizer', label: 'Feature Flags & Controls', icon: FiSliders }
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Super Admin Control Center</h1>
          <p className="text-sm text-text-secondary mt-1">
            Global governance, system architecture, role matrix, feature flags, and owner impersonation portal.
          </p>
        </div>
      </div>

      {/* Tabs Sub-navigation bar */}
      <div className="flex border-b border-border overflow-x-auto gap-2 hide-scrollbar py-1">
        {superAdminTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              navigate(`/super-admin/${tab.id === 'overview' ? 'dashboard' : tab.id}`);
            }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === tab.id
                ? 'border-primary text-text-primary font-black bg-amber-50/30 rounded-t-xl'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-hover-bg'
            }`}
            aria-label={`Switch to ${tab.label}`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TABS CONTENT VIEW SWITCH */}
      <ErrorBoundary fallbackMessage="The selected Super Admin control panel view encountered a rendering issue. Switch to another tab to continue.">
        <div className="space-y-6">
        {/* PLATFORM DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Gross Platform GMV', value: '₹1,45,00,000', sub: '+18.4% this month', color: 'bg-green-50 text-green-700' },
                { title: 'Net Platform Revenue', value: '₹14,50,000', sub: 'Commissions & Fees', color: 'bg-amber-50 text-amber-700' },
                { title: 'Active Servers', value: '12 / 12 Host Nodes', sub: '100% Operational', color: 'bg-blue-50 text-blue-700' },
                { title: 'API Requests / sec', value: '4,280 req/s', sub: 'Sub-40ms latency', color: 'bg-purple-50 text-purple-700' }
              ].map((kpi, idx) => (
                <Card key={idx} className="space-y-2">
                  <p className="text-xs font-bold text-text-secondary uppercase">{kpi.title}</p>
                  <p className="text-2xl font-black text-text-primary">{kpi.value}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${kpi.color}`}>
                    {kpi.sub}
                  </span>
                </Card>
              ))}
            </div>

            <Card>
              <h3 className="font-extrabold text-lg text-text-primary mb-4">Gross Platform Growth Curve</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Jan', rev: 4500000 }, { month: 'Feb', rev: 5800000 }, { month: 'Mar', rev: 6200000 },
                    { month: 'Apr', rev: 8400000 }, { month: 'May', rev: 9900000 }, { month: 'Jun', rev: 12000000 }, { month: 'Jul', rev: 14500000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip formatter={(val) => `₹${(val || 0).toLocaleString()}`} />
                    <Area type="monotone" dataKey="rev" stroke="#FFC107" fill="#FFC107" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* BI DASHBOARD */}
        {activeTab === 'bi-dashboard' && <BiDashboardView />}

        {/* ADMIN MANAGEMENT */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-text-primary">Platform Operational Administrators</h3>
              <Button onClick={() => setIsCreateAdminOpen(true)} className="flex items-center gap-1.5">
                <FiPlus size={16} />
                <span>Create Admin Account</span>
              </Button>
            </div>

            <Table
              headers={['Administrator Name', 'Email', 'Role', 'Status', 'Actions']}
              data={admins}
              renderRow={(a) => (
                <tr key={a.id}>
                  <td className="px-6 py-4 font-extrabold text-sm text-text-primary">{a.name}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{a.email}</td>
                  <td className="px-6 py-4 text-xs font-black uppercase">{a.role}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="danger" size="sm" onClick={() => setAdmins(prev => prev.filter(x => x.id !== a.id))}>
                      Delete Admin
                    </Button>
                  </td>
                </tr>
              )}
            />
          </div>
        )}

        {/* THEATRE OWNERS & IMPERSONATION */}
        {activeTab === 'owners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-text-primary">Theatre Owner Accounts & Impersonation Portal</h3>
                <p className="text-xs text-text-secondary mt-0.5">Super Admin can switch session context to any Theatre Owner for troubleshooting.</p>
              </div>
            </div>

            <Table
              headers={['Owner Name', 'Business Entity', 'Email', 'Active Theatres', 'Actions']}
              data={owners}
              renderRow={(o) => (
                <tr key={o.id}>
                  <td className="px-6 py-4 font-extrabold text-sm text-text-primary">{o.name}</td>
                  <td className="px-6 py-4 font-bold text-sm text-text-secondary">{o.business}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{o.email}</td>
                  <td className="px-6 py-4 font-bold text-sm text-primary">{o.theatres} Locations</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button
                      onClick={() => handleImpersonate(o)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <FiZap size={14} />
                      <span>Impersonate Owner</span>
                    </button>
                    <Button variant="secondary" size="sm" onClick={() => toast.success(`Reset password link sent to ${o.email}`)}>
                      Reset Password
                    </Button>
                  </td>
                </tr>
              )}
            />
          </div>
        )}

        {/* ROLE PERMISSIONS MATRIX */}
        {activeTab === 'roles' && <PermissionsMatrixTable />}

        {/* PLATFORM CONFIGURATION */}
        {activeTab === 'config' && (
          <Card className="space-y-6 max-w-xl">
            <h3 className="font-extrabold text-lg text-text-primary">Platform Financial & Localization Configuration</h3>
            <div className="space-y-4">
              <Input label="Platform Booking Fee (₹)" value={bookingFee} onChange={e => setBookingFee(e.target.value)} />
              <Input label="Convenience Fee (%)" value={convenienceFee} onChange={e => setConvenienceFee(e.target.value)} />
              <Input label="Event Organizer Commission Rate (%)" value={organizerCommission} onChange={e => setOrganizerCommission(e.target.value)} />
              <Input label="GST Rate (%)" value={gstRate} onChange={e => setGstRate(e.target.value)} />
              <Input label="Primary Currency Symbol" value={currency} onChange={e => setCurrency(e.target.value)} />
              
              <div className="p-4 bg-hover-bg/30 border border-border rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-text-primary">Maintenance Mode</p>
                  <p className="text-xs text-text-secondary">Restrict customer checkout during platform upgrades</p>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    maintenanceMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {maintenanceMode ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              <Button onClick={() => toast.success('Platform configuration saved!')}>
                Save System Config
              </Button>
            </div>
          </Card>
        )}

        {/* HOMEPAGE CMS */}
        {activeTab === 'cms' && (
          <Card className="space-y-6">
            <h3 className="font-extrabold text-lg text-text-primary">Homepage CMS Banners & Hero Slider Manager</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Hero Slider Banner 1', img: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80', status: 'Active' },
                { title: 'Featured Movies Carousel', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', status: 'Active' }
              ].map((cms, idx) => (
                <div key={idx} className="p-4 border rounded-2xl space-y-3">
                  <img src={cms.img} alt={cms.title} className="w-full h-36 object-cover rounded-xl" />
                  <p className="font-bold text-sm">{cms.title}</p>
                  <Button variant="secondary" size="sm" onClick={() => toast.success('CMS section updated')}>
                    Edit Section
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ADVERTISEMENT MANAGEMENT */}
        {activeTab === 'ads' && (
          <Card className="space-y-6">
            <h3 className="font-extrabold text-lg text-text-primary">Ad Placement & CTR Analytics</h3>
            <div className="p-4 border rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">Popcorn Combo Popup Ad</p>
                <p className="text-xs text-text-secondary">Target: All Cities • CTR: 4.8%</p>
              </div>
              <Button variant="secondary" size="sm">Manage Ad</Button>
            </div>
          </Card>
        )}

        {/* PAYMENTS & GATEWAY */}
        {activeTab === 'payments' && (
          <Card className="space-y-6">
            <h3 className="font-extrabold text-lg text-text-primary">Payment Gateways & Owner Payout Settlements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-2xl space-y-2">
                <p className="font-bold text-sm">Razorpay Integration</p>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Connected (Live)</span>
              </div>
              <div className="p-4 border rounded-2xl space-y-2">
                <p className="font-bold text-sm">Stripe Integration</p>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Connected (Live)</span>
              </div>
            </div>
          </Card>
        )}

        {/* SYSTEM AUDIT LOGS */}
        {activeTab === 'audits' && (
          <Card className="space-y-6">
            <h3 className="font-extrabold text-lg text-text-primary">Complete System Action Audit Trail</h3>
            <Table
              headers={['Timestamp', 'User & Role', 'Action Executed', 'Target Entity', 'IP & Browser']}
              data={mockAuditLogs}
              renderRow={(log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 font-mono text-xs">{log.date}</td>
                  <td className="px-6 py-4 font-bold text-xs">
                    <p className="text-text-primary">{log.user}</p>
                    <span className="text-primary font-black uppercase text-[10px]">{log.role}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-text-primary">{log.action}</td>
                  <td className="px-6 py-4 text-xs font-mono">{log.target}</td>
                  <td className="px-6 py-4 text-xs text-text-secondary">{log.ip} ({log.browser})</td>
                </tr>
              )}
            />
          </Card>
        )}

        {/* BROADCAST NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <Card className="space-y-6 max-w-lg">
            <h3 className="font-extrabold text-lg text-text-primary">Broadcast Campaign Dispatcher</h3>
            <div className="space-y-4">
              <Input label="Campaign Title" placeholder="e.g. Independence Day Blockbuster Sale!" />
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Message Body</label>
                <textarea rows={3} className="w-full p-3 border rounded-xl text-xs font-medium" placeholder="Type notification broadcast message..." />
              </div>
              <Button onClick={() => toast.success('Broadcast sent to all active users!')}>
                Send Push Broadcast
              </Button>
            </div>
          </Card>
        )}

        {/* DATABASE & SYSTEM BACKUP */}
        {activeTab === 'database' && <SystemBackupManager />}

        {/* USER SESSIONS */}
        {activeTab === 'sessions' && <SessionManagementTable />}

        {/* PLATFORM HEALTH */}
        {activeTab === 'health' && <PlatformHealthGrid />}

        {/* LIVE ACTIVITY FEED */}
        {activeTab === 'activity' && <ActivityFeedList />}

        {/* MEDIA FILE LIBRARY */}
        {activeTab === 'file-manager' && (
          <div className="space-y-4">
            <Button onClick={() => setIsFileLibraryOpen(true)}>Open Full Media Asset Manager Modal</Button>
            <FileManagerModal isOpen={true} onClose={() => {}} />
          </div>
        )}

        {/* EMAIL TEMPLATES */}
        {activeTab === 'email-templates' && <EmailTemplateEditor />}

        {/* SYSTEM LOGS */}
        {activeTab === 'system-logs' && <SystemLogViewer />}

        {/* CUSTOMIZER & FEATURE FLAGS */}
        {activeTab === 'customizer' && <DashboardCustomizer />}
        </div>
      </ErrorBoundary>

      {/* Create Admin Modal */}
      <Modal isOpen={isCreateAdminOpen} onClose={() => setIsCreateAdminOpen(false)} title="Create New Admin Account">
        <form onSubmit={handleCreateAdminSubmit} className="space-y-4 text-left">
          <Input label="Full Name" value={newAdminForm.name} onChange={e => setNewAdminForm({ ...newAdminForm, name: e.target.value })} required />
          <Input label="Email Address" type="email" value={newAdminForm.email} onChange={e => setNewAdminForm({ ...newAdminForm, email: e.target.value })} required />
          <Input label="Password" type="password" value={newAdminForm.password} onChange={e => setNewAdminForm({ ...newAdminForm, password: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsCreateAdminOpen(false)}>Cancel</Button>
            <Button type="submit">Create Admin</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
