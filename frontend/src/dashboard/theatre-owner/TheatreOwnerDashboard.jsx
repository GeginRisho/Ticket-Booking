import React, { useState, useEffect } from 'react';
import { 
  FiGrid, FiFilm, FiCalendar, FiDollarSign, FiPlusSquare, 
  FiCreditCard, FiTrash2, FiPlus, FiMapPin, FiPhone, FiMail, FiInfo
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getDashboardStats } from '../../services/dashboardService';
import { getTheatres, createTheatre } from '../../services/theatreService';
import { getScreens, createScreen } from '../../services/screenService';
import { getShows, createShow, deleteShow } from '../../services/showService';
import { getMovies } from '../../services/movieService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const TheatreOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState(null);

  // Entities
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);

  // Selections
  const [selectedTheatreId, setSelectedTheatreId] = useState('');

  // Modals
  const [isAddTheatreOpen, setIsAddTheatreOpen] = useState(false);
  const [isAddScreenOpen, setIsAddScreenOpen] = useState(false);
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);

  // Forms
  const [theatreForm, setTheatreForm] = useState({
    theatre_name: '', 
    address: '', 
    city_id: CITIES[0]?.id || '', 
    latitude: '', 
    longitude: '', 
    phone: '', 
    email: '', 
    facilities: 'Parking, Food Court, Wheelchair Access',
    description: ''
  });
  
  const [screenForm, setScreenForm] = useState({
    screen_name: '', capacity: '', rows_count: '10', cols_count: '12'
  });

  const [showForm, setShowForm] = useState({
    movie_id: '', 
    screen_id: '', 
    show_date: '', 
    start_time: '', 
    end_time: '', 
    language: 'English',
    format: '2D',
    price: ''
  });

  const loadOwnerStats = async () => {
    setLoading(true);
    try {
      const statsRes = await getDashboardStats();
      setStats(statsRes.data || statsRes);

      // Load theatres owned
      const theatresRes = await getTheatres();
      const list = theatresRes.data || theatresRes || [];
      setTheatres(list);
      if (list.length > 0) {
        setSelectedTheatreId(list[0].id);
      }

      // Load movies list for show mapping selection
      const moviesRes = await getMovies();
      setMovies(moviesRes.data?.movies || moviesRes.movies || moviesRes || []);
    } catch (err) {
      toast.error('Failed to load owner details');
    } finally {
      setLoading(false);
    }
  };

  const loadScreensAndShows = async () => {
    if (!selectedTheatreId) return;
    try {
      const screensRes = await getScreens(selectedTheatreId);
      setScreens(screensRes.data || screensRes || []);

      const showsRes = await getShows();
      setShows(showsRes.data || showsRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOwnerStats();
  }, []);

  useEffect(() => {
    loadScreensAndShows();
  }, [selectedTheatreId]);

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      const descJson = JSON.stringify({
        facilities: theatreForm.facilities,
        gmapsLink: `https://www.google.com/maps?q=${theatreForm.latitude},${theatreForm.longitude}`,
        customDesc: theatreForm.description
      });

      await createTheatre({
        theatre_name: theatreForm.theatre_name,
        address: theatreForm.address,
        city_id: theatreForm.city_id,
        latitude: parseFloat(theatreForm.latitude) || 0,
        longitude: parseFloat(theatreForm.longitude) || 0,
        phone: theatreForm.phone,
        email: theatreForm.email,
        description: descJson
      });
      toast.success('Theatre added successfully (Pending Approval)');
      setIsAddTheatreOpen(false);
      loadOwnerStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create theatre');
    }
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    try {
      await createScreen(selectedTheatreId, {
        screen_name: screenForm.screen_name,
        capacity: parseInt(screenForm.capacity, 10),
        rows: parseInt(screenForm.rows_count, 10),
        columns: parseInt(screenForm.cols_count, 10)
      });
      toast.success('Screen layout config saved');
      setIsAddScreenOpen(false);
      loadScreensAndShows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add screen');
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await createShow({
        movie_id: showForm.movie_id,
        screen_id: showForm.screen_id,
        show_date: showForm.show_date,
        start_time: showForm.start_time,
        end_time: showForm.end_time,
        language: showForm.language,
        format: showForm.format,
        price: parseFloat(showForm.price)
      });
      toast.success('Show scheduled successfully');
      setIsAddShowOpen(false);
      loadScreensAndShows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Show schedule overlap detected or invalid mapping');
    }
  };

  const handleDeleteShow = async (id) => {
    try {
      await deleteShow(id);
      toast.success('Show deleted');
      loadScreensAndShows();
    } catch (err) {
      toast.error('Failed to delete show');
    }
  };

  const chartData = [
    { name: 'Monday', revenue: (stats?.revenue || 1200) * 0.1 },
    { name: 'Tuesday', revenue: (stats?.revenue || 1200) * 0.12 },
    { name: 'Wednesday', revenue: (stats?.revenue || 1200) * 0.15 },
    { name: 'Thursday', revenue: (stats?.revenue || 1200) * 0.08 },
    { name: 'Friday', revenue: (stats?.revenue || 1200) * 0.2 },
    { name: 'Saturday', revenue: (stats?.revenue || 1200) * 0.22 },
    { name: 'Sunday', revenue: (stats?.revenue || 1200) * 0.13 },
  ];

  if (loading) {
    return <Loader type="chart" />;
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">Theatre Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Manage physical screen grids, schedules, and live seat maps.</p>
        </div>
        
        {/* Theatre Selection Dropdown */}
        {theatres.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-secondary uppercase">Active Theatre</span>
            <select
              value={selectedTheatreId}
              onChange={e => setSelectedTheatreId(e.target.value)}
              className="px-4 py-2 text-sm rounded-xl border border-border bg-white text-text-primary font-semibold focus:outline-none"
            >
              {theatres.map(t => (
                <option key={t.id} value={t.id}>{t.theatre_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto gap-2 hide-scrollbar">
        {[
          { id: 'analytics', label: 'Analytics', icon: FiGrid },
          { id: 'screens', label: 'Screens Config', icon: FiPlusSquare },
          { id: 'shows', label: 'Shows Scheduling', icon: FiCalendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TABS VIEW */}
      <div className="space-y-6">
        {/* ANALYTICS PANEL */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'My Revenue', value: `₹${stats?.revenue || 0}`, icon: FiDollarSign, bg: 'bg-green-50 text-green-600' },
                { title: 'Total Bookings', value: stats?.bookingsCount || 0, icon: FiCreditCard, bg: 'bg-amber-50 text-amber-600' },
                { title: 'Screens Managed', value: stats?.totalScreens || 0, icon: FiPlusSquare, bg: 'bg-blue-50 text-blue-600' },
                { title: 'Shows Run', value: stats?.totalShows || 0, icon: FiCalendar, bg: 'bg-purple-50 text-purple-600' }
              ].map((card, idx) => (
                <Card key={idx} className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${card.bg}`}>
                    <card.icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-black text-text-primary mt-1">{card.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <h3 className="font-bold text-lg text-text-primary mb-6">Revenue Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#FFC107" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-lg text-text-primary mb-4">Theatre Info</h3>
                {theatres.find(t => t.id === selectedTheatreId) ? (() => {
                  const currentTheatre = theatres.find(t => t.id === selectedTheatreId);
                  let descObj = { facilities: '', gmapsLink: '', customDesc: '' };
                  try {
                    descObj = JSON.parse(currentTheatre.description || '{}');
                  } catch (e) {
                    descObj.customDesc = currentTheatre.description;
                  }
                  return (
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start gap-2">
                        <FiMapPin className="text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Address</p>
                          <p className="text-text-secondary text-xs">{currentTheatre.address}</p>
                          {currentTheatre.latitude && (
                            <p className="text-[10px] text-text-secondary mt-1">Coords: {currentTheatre.latitude}, {currentTheatre.longitude}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-primary flex-shrink-0" />
                        <div>
                          <p className="font-bold">Phone</p>
                          <p className="text-text-secondary text-xs">{currentTheatre.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMail className="text-primary flex-shrink-0" />
                        <div>
                          <p className="font-bold">Email</p>
                          <p className="text-text-secondary text-xs">{currentTheatre.email || 'N/A'}</p>
                        </div>
                      </div>
                      {descObj.facilities && (
                        <div className="flex items-start gap-2 pt-2 border-t border-border">
                          <FiInfo className="text-primary mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-bold">Facilities</p>
                            <p className="text-text-secondary text-xs">{descObj.facilities}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <p className="text-sm text-text-secondary">No details available.</p>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* SCREENS CONFIG PANEL */}
        {activeTab === 'screens' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-text-primary">Screen Layouts</h3>
              <div className="flex gap-2">
                <Button onClick={() => setIsAddTheatreOpen(true)} variant="secondary">Add Theatre</Button>
                {theatres.length > 0 && (
                  <Button onClick={() => setIsAddScreenOpen(true)} className="flex items-center gap-1.5">
                    <FiPlus size={16} />
                    <span>Configure Screen</span>
                  </Button>
                )}
              </div>
            </div>

            {screens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {screens.map(s => (
                  <Card key={s.id} className="space-y-4">
                    <h4 className="font-bold text-xl text-text-primary">{s.screen_name}</h4>
                    <div className="space-y-2 text-sm text-text-secondary">
                      <div className="flex justify-between">
                        <span>Total Capacity</span>
                        <span className="font-bold text-text-primary">{s.capacity} seats</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Row Count</span>
                        <span className="font-bold text-text-primary">{s.rows || s.rows_count} rows</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cols Count</span>
                        <span className="font-bold text-text-primary">{s.columns || s.cols_count} columns</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No screens configured"
                description="Before scheduling shows, you need to add screen grids layout row/columns."
              />
            )}
          </div>
        )}

        {/* SHOWS SCHEDULING PANEL */}
        {activeTab === 'shows' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-text-primary">Scheduled Shows</h3>
              {screens.length > 0 && movies.length > 0 && (
                <Button onClick={() => setIsAddShowOpen(true)} className="flex items-center gap-1.5">
                  <FiPlus size={16} />
                  <span>Schedule Show</span>
                </Button>
              )}
            </div>

            <Table
              headers={['Movie Title', 'Screen', 'Show Date', 'Start Time', 'Language', 'Format', 'Actions']}
              data={shows.filter(s => screens.some(sc => sc.id === s.screen_id))}
              renderRow={(s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 font-bold text-sm">{s.movie?.title}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{s.screen?.screen_name}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{s.show_date}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{s.start_time} - {s.end_time}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary font-semibold">{s.language || 'English'}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary font-semibold">{s.format || '2D'}</td>
                  <td className="px-6 py-4">
                    <Button variant="danger" size="sm" onClick={() => handleDeleteShow(s.id)}>
                      <FiTrash2 size={14} />
                    </Button>
                  </td>
                </tr>
              )}
            />
          </div>
        )}
      </div>

      {/* Add Theatre Modal */}
      <Modal isOpen={isAddTheatreOpen} onClose={() => setIsAddTheatreOpen(false)} title="Add New Theatre" size="lg">
        <form onSubmit={handleCreateTheatre} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Theatre Name" value={theatreForm.theatre_name} onChange={e => setTheatreForm({...theatreForm, theatre_name: e.target.value})} required />
          <Input label="Address" value={theatreForm.address} onChange={e => setTheatreForm({...theatreForm, address: e.target.value})} required />
          <div className="flex flex-col text-left">
            <label className="block text-sm font-semibold mb-2">City</label>
            <select
              value={theatreForm.city_id}
              onChange={e => setTheatreForm({...theatreForm, city_id: e.target.value})}
              className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none"
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id}>{c.city_name}</option>
              ))}
            </select>
          </div>
          <Input label="Facilities" value={theatreForm.facilities} onChange={e => setTheatreForm({...theatreForm, facilities: e.target.value})} required />
          <Input label="Phone Number" value={theatreForm.phone} onChange={e => setTheatreForm({...theatreForm, phone: e.target.value})} />
          <Input label="Email Address" type="email" value={theatreForm.email} onChange={e => setTheatreForm({...theatreForm, email: e.target.value})} />
          <Input label="Latitude Coordinate" type="number" step="any" value={theatreForm.latitude} onChange={e => setTheatreForm({...theatreForm, latitude: e.target.value})} required />
          <Input label="Longitude Coordinate" type="number" step="any" value={theatreForm.longitude} onChange={e => setTheatreForm({...theatreForm, longitude: e.target.value})} required />
          <div className="col-span-1 md:col-span-2">
            <Input label="Theatre Description" value={theatreForm.description} onChange={e => setTheatreForm({...theatreForm, description: e.target.value})} />
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddTheatreOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Theatre</Button>
          </div>
        </form>
      </Modal>

      {/* Add Screen Modal */}
      <Modal isOpen={isAddScreenOpen} onClose={() => setIsAddScreenOpen(false)} title="Configure Screen Seat Grid" size="md">
        <form onSubmit={handleCreateScreen} className="space-y-4">
          <Input label="Screen Name (e.g. Screen 1)" value={screenForm.screen_name} onChange={e => setScreenForm({...screenForm, screen_name: e.target.value})} required />
          <Input label="Capacity" type="number" value={screenForm.capacity} onChange={e => setScreenForm({...screenForm, capacity: e.target.value})} required />
          <Input label="Number of Rows" type="number" value={screenForm.rows_count} onChange={e => setScreenForm({...screenForm, rows_count: e.target.value})} required />
          <Input label="Seats Per Row" type="number" value={screenForm.cols_count} onChange={e => setScreenForm({...screenForm, cols_count: e.target.value})} required />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddScreenOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Configure Layout</Button>
          </div>
        </form>
      </Modal>

      {/* Add Show Modal */}
      <Modal isOpen={isAddShowOpen} onClose={() => setIsAddShowOpen(false)} title="Schedule Show" size="md">
        <form onSubmit={handleCreateShow} className="space-y-4">
          <div className="flex flex-col text-left">
            <label className="block text-sm font-semibold mb-2">Movie</label>
            <select
              value={showForm.movie_id}
              onChange={e => setShowForm({...showForm, movie_id: e.target.value})}
              className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none"
              required
            >
              <option value="">Select Movie</option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col text-left">
            <label className="block text-sm font-semibold mb-2">Screen</label>
            <select
              value={showForm.screen_id}
              onChange={e => setShowForm({...showForm, screen_id: e.target.value})}
              className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none"
              required
            >
              <option value="">Select Screen</option>
              {screens.map(s => (
                <option key={s.id} value={s.id}>{s.screen_name}</option>
              ))}
            </select>
          </div>
          <Input label="Show Date (YYYY-MM-DD)" type="date" value={showForm.show_date} onChange={e => setShowForm({...showForm, show_date: e.target.value})} required />
          <Input label="Start Time" type="time" value={showForm.start_time} onChange={e => setShowForm({...showForm, start_time: e.target.value})} required />
          <Input label="End Time" type="time" value={showForm.end_time} onChange={e => setShowForm({...showForm, end_time: e.target.value})} required />
          <div className="flex flex-col text-left">
            <label className="block text-sm font-semibold mb-2">Language</label>
            <select
              value={showForm.language}
              onChange={e => setShowForm({...showForm, language: e.target.value})}
              className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
              <option value="Kannada">Kannada</option>
              <option value="Malayalam">Malayalam</option>
            </select>
          </div>
          <div className="flex flex-col text-left">
            <label className="block text-sm font-semibold mb-2">Format</label>
            <select
              value={showForm.format}
              onChange={e => setShowForm({...showForm, format: e.target.value})}
              className="px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none"
            >
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX 2D">IMAX 2D</option>
              <option value="IMAX 3D">IMAX 3D</option>
            </select>
          </div>
          <Input label="Base Ticket Price (INR)" type="number" value={showForm.price} onChange={e => setShowForm({...showForm, price: e.target.value})} required />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddShowOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Schedule Show</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TheatreOwnerDashboard;
