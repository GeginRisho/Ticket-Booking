import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiCalendar, FiUsers, FiDollarSign, FiPlusCircle, 
  FiTrash2, FiMapPin, FiActivity, FiPercent, FiSettings, FiUser, FiInfo, FiTag, FiGrid
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { getEvents, createEvent, deleteEvent, getEventCategories } from '../../services/eventService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPathname = () => {
    const path = location.pathname;
    if (path.includes('/events')) return 'events';
    if (path.includes('/ticket-sales')) return 'ticket-sales';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/coupons')) return 'coupons';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/revenue')) return 'revenue';
    if (path.includes('/profile')) return 'profile';
    return 'analytics';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPathname());

  useEffect(() => {
    setActiveTab(getTabFromPathname());
  }, [location.pathname]);

  const [loading, setLoading] = useState(true);

  // Entities
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modals
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Forms
  const [eventForm, setEventForm] = useState({
    title: '', description: '', poster: '', banner: '', category_id: '',
    city_id: CITIES[0]?.id || '', venue: '', address: '', start_date: '',
    end_date: '', start_time: '', status: 'active'
  });

  const loadOrganizerData = async () => {
    setLoading(true);
    try {
      const [eventsRes, categoriesRes] = await Promise.all([
        getEvents(),
        getEventCategories()
      ]);
      setEvents(eventsRes.data || eventsRes || []);
      
      const cats = categoriesRes.data || categoriesRes || [];
      setCategories(cats);
      if (cats.length > 0) {
        setEventForm(prev => ({ ...prev, category_id: cats[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load organizer records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizerData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await createEvent(eventForm);
      toast.success('Event published successfully');
      setIsAddEventOpen(false);
      loadOrganizerData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      loadOrganizerData();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return <Loader type="chart" />;
  }

  // Calculate quick metrics
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;

  const chartData = [
    { name: 'Mon', revenue: 4200 },
    { name: 'Tue', revenue: 5100 },
    { name: 'Wed', revenue: 8400 },
    { name: 'Thu', revenue: 9300 },
    { name: 'Fri', revenue: 12000 },
    { name: 'Sat', revenue: 15400 },
    { name: 'Sun', revenue: 13000 },
  ];

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-center bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Event Organizer Workspace</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">Configure ticket packages, track attendees, and list schedules.</p>
        </div>
        <Button onClick={() => setIsAddEventOpen(true)} className="flex items-center gap-1.5 font-bold text-xs bg-amber-400 text-gray-900 rounded-xl px-4 py-2.5 shadow-xs">
          <FiPlusCircle />
          <span>Publish Event</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 hide-scrollbar">
        {[
          { id: 'analytics', label: 'Dashboard', icon: FiGrid },
          { id: 'events', label: 'Events', icon: FiCalendar },
          { id: 'ticket-sales', label: 'Ticket Sales', icon: FiTag },
          { id: 'bookings', label: 'Bookings', icon: FiUsers },
          { id: 'coupons', label: 'Coupons', icon: FiPercent },
          { id: 'reports', label: 'Reports', icon: FiActivity },
          { id: 'revenue', label: 'Revenue', icon: FiDollarSign },
          { id: 'profile', label: 'Profile Settings', icon: FiUser }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              navigate(tab.id === 'analytics' ? '/organizer/dashboard' : `/organizer/${tab.id}`);
            }}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-amber-400 text-amber-500'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TABS CONTENT */}
      <div className="space-y-6">
        
        {/* DASHBOARD ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="flex items-center gap-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="p-4 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100">
                  <FiCalendar size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Events</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{totalEvents}</p>
                </div>
              </Card>

              <Card className="flex items-center gap-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="p-4 rounded-2xl bg-green-50 text-green-500 border border-green-100">
                  <FiActivity size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Events</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{activeEvents}</p>
                </div>
              </Card>

              <Card className="flex items-center gap-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="p-4 rounded-2xl bg-blue-50 text-blue-500 border border-blue-100">
                  <FiUsers size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket Sales</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">₹68,500</p>
                </div>
              </Card>
            </div>

            <Card className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-lg text-gray-900 mb-6">Recent Sales Activity</h3>
              <div className="divide-y divide-gray-100">
                {[
                  { name: 'Karthik Rao', qty: 2, amount: 2400, event: 'AR Rahman Live Symphony' },
                  { name: 'Divya Nair', qty: 1, amount: 499, event: 'Zakir Khan Comedy Tour' },
                  { name: 'Sam Peter', qty: 4, amount: 4800, event: 'AR Rahman Live Symphony' },
                ].map((sale, idx) => (
                  <div key={idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-black text-gray-800">{sale.name}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{sale.event} | Qty: {sale.qty}</p>
                    </div>
                    <span className="text-sm font-black text-gray-900">₹{sale.amount}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* EVENTS LIST TAB */}
        {activeTab === 'events' && (
          <Card className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-6">Published Events Catalog</h3>
            {events.length > 0 ? (
              <Table
                headers={['Banner', 'Event Title', 'Venue', 'Start Date', 'Status', 'Actions']}
                data={events}
                renderRow={(e) => (
                  <tr key={e.id}>
                    <td className="px-6 py-4">
                      <img src={e.poster || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'} alt={e.title} className="w-14 h-10 object-cover rounded-lg border border-border" />
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-gray-900">{e.title}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600">{e.venue}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-semibold">{e.start_date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="danger" size="sm" onClick={() => handleDeleteEvent(e.id)}>
                        <FiTrash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                )}
              />
            ) : (
              <EmptyState
                title="No events created yet"
                description="Publish your first event and start selling entry passes right away."
                actionLabel="Publish Event"
                onActionClick={() => setIsAddEventOpen(true)}
              />
            )}
          </Card>
        )}

        {/* TICKET SALES TAB */}
        {activeTab === 'ticket-sales' && (
          <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-6">Live Event Ticket Categories</h3>
            <Table
              headers={['Category Code', 'Allocated Passes', 'Sold Qty', 'Price per ticket', 'Status']}
              data={[
                { code: 'VIP-PASS', total: 100, sold: 48, price: '1200', status: 'active' },
                { code: 'GENERAL-PASS', total: 500, sold: 184, price: '499', status: 'active' },
                { code: 'EARLY-BIRD', total: 200, sold: 200, price: '399', status: 'sold_out' }
              ]}
              renderRow={(cat, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-gray-800">{cat.code}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600">{cat.total} Passes</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600">{cat.sold} Passes</td>
                  <td className="px-6 py-4 text-xs font-black text-gray-900">₹{cat.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      cat.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cat.status}
                    </span>
                  </td>
                </tr>
              )}
            />
          </Card>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-6">Event Ticket Bookings Logs</h3>
            <Table
              headers={['Booking ID', 'Customer Name', 'Selected Event', 'Total Qty', 'Total Paid']}
              data={[
                { id: 'E-B001', name: 'Karthik Rao', event: 'AR Rahman Live Symphony', qty: 2, amount: 2400 },
                { id: 'E-B002', name: 'Divya Nair', event: 'Zakir Khan Comedy Tour', qty: 1, amount: 499 },
                { id: 'E-B003', name: 'Sam Peter', event: 'AR Rahman Live Symphony', qty: 4, amount: 4800 },
              ]}
              renderRow={(b) => (
                <tr key={b.id}>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{b.id}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-800">{b.name}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600">{b.event}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600">{b.qty} tickets</td>
                  <td className="px-6 py-4 text-xs font-black text-gray-900">₹{b.amount}</td>
                </tr>
              )}
            />
          </Card>
        )}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-lg text-gray-900">Event Promotional Coupons</h3>
              <Button onClick={() => toast.success('Coupon creation popup!')} className="flex items-center gap-1 text-xs font-black bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-xl px-4 py-2.5 shadow-xs">
                <FiPlusCircle /> Create Event Coupon
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { code: 'ARRAHMAN10', desc: 'Flat 10% off on AR Rahman concert seats.', type: 'percentage', val: 10 },
                { code: 'COMEDY50', desc: 'Flat ₹50 cash back on comedy show standup entries.', type: 'flat', val: 50 }
              ].map(coupon => (
                <Card key={coupon.code} className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 font-mono font-bold text-xs rounded-lg tracking-widest">{coupon.code}</span>
                    <p className="font-bold text-sm text-gray-900 mt-4">{coupon.desc}</p>
                    <p className="text-[10px] text-gray-400 font-extrabold mt-1">Discount Type: {coupon.type === 'percentage' ? `${coupon.val}%` : `₹${coupon.val}`}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <Card className="space-y-6 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
            <div>
              <h3 className="font-black text-lg text-gray-900">Event Ticket Sales Reports</h3>
              <p className="text-xs font-semibold text-gray-500 mt-1">Download monthly CSV reports.</p>
            </div>
            <div className="space-y-4 border-t border-gray-100 pt-6">
              {[
                { name: 'July Live Events Ticket Allocations Summary.csv', size: '1.8 MB' },
                { name: 'June Comedy Show Tax Audits.csv', size: '820 KB' }
              ].map((rep, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-gray-800">{rep.name}</p>
                    <p className="text-[9px] text-gray-400 font-extrabold">{rep.size}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => toast.success('Report download started!')} className="text-[10px] font-black border border-gray-200 bg-white">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm space-y-6">
            <div>
              <h3 className="font-black text-lg text-gray-900">Weekly Revenue Receipts</h3>
              <p className="text-xs font-semibold text-gray-500 mt-1">Receipt metrics mapping event sales income.</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} fontWeight={600} />
                  <YAxis stroke="#9CA3AF" fontSize={11} fontWeight={600} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#FFC107" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* PROFILE AND SETTINGS TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <h3 className="font-black text-lg text-gray-900 mb-6">Organizer Profile Details</h3>
              <div className="space-y-4 font-semibold text-gray-600">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Representative Name</p>
                  <p className="text-base font-black text-gray-900 mt-1">{user?.full_name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Helpdesk Email</p>
                  <p className="text-base font-black text-gray-900 mt-1">{user?.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Account Role</p>
                  <p className="text-base font-black text-gray-900 mt-1">{user?.role?.role_name || user?.role}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm space-y-6">
              <div>
                <h3 className="font-black text-lg text-gray-900">Partner Settings</h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">Adjust notification delivery and manage roles.</p>
              </div>
              <div className="space-y-4 border-t border-gray-100 pt-4 font-semibold text-gray-600 text-sm">
                <div className="flex justify-between items-center">
                  <span>Send registration summary emails</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Daily ticketing alerts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-500" />
                </div>
                {/* Switch Role developer utility */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <span className="block font-black text-[10px] text-gray-400 uppercase tracking-widest">Developer Switch Active Role</span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Customer', 'Theatre Owner', 'Event Organizer', 'Admin', 'Super Admin'].map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          const paths = {
                            'Customer': '/dashboard',
                            'Theatre Owner': '/theatre/dashboard',
                            'Event Organizer': '/organizer/dashboard',
                            'Admin': '/admin/dashboard',
                            'Super Admin': '/super-admin/dashboard'
                          };
                          navigate(paths[r]);
                        }}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                          user?.role === r || user?.role?.role_name === r
                            ? 'bg-amber-400 text-gray-900 border-amber-400 font-black'
                            : 'bg-white text-gray-500 hover:border-amber-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* Publish Event Modal */}
      <Modal isOpen={isAddEventOpen} onClose={() => setIsAddEventOpen(false)} title="Publish New Event" size="lg">
        <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Event Title" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required />
          <div className="flex flex-col text-left">
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select
              value={eventForm.category_id}
              onChange={e => setEventForm({...eventForm, category_id: e.target.value})}
              className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none"
              required
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.category_name}</option>
              ))}
            </select>
          </div>
          <Input label="Poster Image URL" value={eventForm.poster} onChange={e => setEventForm({...eventForm, poster: e.target.value})} required />
          <Input label="Banner Image URL" value={eventForm.banner} onChange={e => setEventForm({...eventForm, banner: e.target.value})} required />
          <div className="flex flex-col text-left">
            <label className="block text-sm font-semibold mb-2">City Location</label>
            <select
              value={eventForm.city_id}
              onChange={e => setEventForm({...eventForm, city_id: e.target.value})}
              className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none"
              required
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id}>{c.city_name}</option>
              ))}
            </select>
          </div>
          <Input label="Venue Name" value={eventForm.venue} onChange={e => setEventForm({...eventForm, venue: e.target.value})} required />
          <Input label="Address Details" value={eventForm.address} onChange={e => setEventForm({...eventForm, address: e.target.value})} required />
          <Input label="Start Date (YYYY-MM-DD)" value={eventForm.start_date} onChange={e => setEventForm({...eventForm, start_date: e.target.value})} required />
          <Input label="End Date (YYYY-MM-DD)" value={eventForm.end_date} onChange={e => setEventForm({...eventForm, end_date: e.target.value})} required />
          <Input label="Start Time (e.g. 18:00)" value={eventForm.start_time} onChange={e => setEventForm({...eventForm, start_time: e.target.value})} required />
          <div className="col-span-1 md:col-span-2">
            <Input label="Short Description" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} required />
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Publish Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrganizerDashboard;
