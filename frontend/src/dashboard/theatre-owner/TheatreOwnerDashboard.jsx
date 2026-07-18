import React, { useState, useEffect } from 'react';
import { 
  FiGrid, FiFilm, FiCalendar, FiDollarSign, FiPlusSquare, 
  FiCreditCard, FiTrash2, FiPlus, FiMapPin, FiPhone, FiMail, 
  FiInfo, FiEdit, FiVideo, FiGrid as FiLayout, FiImage, FiUpload, FiPlay
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import api from '../../services/api';
import { getDashboardStats } from '../../services/dashboardService';
import { getTheatres, createTheatre } from '../../services/theatreService';
import { getScreens, createScreen } from '../../services/screenService';
import { getShows, createShow, updateShow, deleteShow } from '../../services/showService';
import { getMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService';
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
  const [isUploading, setIsUploading] = useState(false);

  // Lists
  const [stats, setStats] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);

  // Selections & Views
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [viewingLayoutScreen, setViewingLayoutScreen] = useState(null);

  // Modals
  const [isAddTheatreOpen, setIsAddTheatreOpen] = useState(false);
  const [isAddScreenOpen, setIsAddScreenOpen] = useState(false);
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);
  const [isEditShowOpen, setIsEditShowOpen] = useState(false);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);

  // Form states
  const [editingShow, setEditingShow] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);

  const [theatreForm, setTheatreForm] = useState({
    theatre_name: '', address: '', city_id: CITIES[0]?.id || '',
    facilities: 'Parking, Food Court, Wheelchair Access, Dolby Atmos Sound',
    phone: '', email: '', latitude: '19.076090', longitude: '72.877726', description: ''
  });

  const [screenForm, setScreenForm] = useState({
    screen_name: '', capacity: '120', rows_count: '10', cols_count: '12'
  });

  const [showForm, setShowForm] = useState({
    movie_id: '', screen_id: '', show_date: '', start_time: '', end_time: '',
    language: 'English', format: '2D', price: '200'
  });

  const [movieForm, setMovieForm] = useState({
    title: '', description: '', poster: '', banner: '', language: 'English',
    genre: 'Action, Thriller', duration: '120', age_rating: 'UA', release_date: '',
    status: 'now_showing', trailer_url: ''
  });

  const loadOwnerStats = async () => {
    setLoading(true);
    try {
      const statsRes = await getDashboardStats();
      setStats(statsRes.data || statsRes);

      const theatresRes = await getTheatres();
      const list = Array.isArray(theatresRes) ? theatresRes : [];
      setTheatres(list);
      if (list.length > 0 && !selectedTheatreId) {
        setSelectedTheatreId(list[0].id);
      }

      const moviesRes = await getMovies();
      setMovies(Array.isArray(moviesRes) ? moviesRes : []);
    } catch (err) {
      toast.error('Failed to load dashboard parameters');
    } finally {
      setLoading(false);
    }
  };

  const loadScreensAndShows = async () => {
    if (!selectedTheatreId) return;
    try {
      const screensRes = await getScreens(selectedTheatreId);
      setScreens(Array.isArray(screensRes) ? screensRes : []);

      const showsRes = await getShows();
      setShows(Array.isArray(showsRes) ? showsRes : []);
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

  // Image Upload helper
  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', field);

    setIsUploading(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.data?.url) {
        setMovieForm(prev => ({ ...prev, [field]: res.data.data.url }));
        toast.success(`${field.toUpperCase() === 'POSTER' ? 'Poster' : 'Backdrop'} uploaded successfully!`);
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Movie actions
  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        duration: parseInt(movieForm.duration, 10)
      };
      if (editingMovie) {
        await updateMovie(editingMovie.id, payload);
        toast.success('Movie updated successfully');
      } else {
        await createMovie(payload);
        toast.success('Movie listed successfully');
      }
      setIsMovieModalOpen(false);
      setEditingMovie(null);
      loadOwnerStats();
    } catch (err) {
      toast.error('Failed to save movie');
    }
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title || '',
      description: movie.description || '',
      poster: movie.poster || '',
      banner: movie.banner || '',
      language: movie.language || 'English',
      genre: movie.genre || '',
      duration: movie.duration ? String(movie.duration) : '120',
      age_rating: movie.age_rating || 'UA',
      release_date: movie.release_date || '',
      status: movie.status || 'now_showing',
      trailer_url: movie.trailer_url || ''
    });
    setIsMovieModalOpen(true);
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie? All scheduled shows for this movie will be affected.')) return;
    try {
      await deleteMovie(id);
      toast.success('Movie deleted successfully');
      loadOwnerStats();
    } catch (err) {
      toast.error('Failed to delete movie');
    }
  };

  // Theatre actions
  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      const descJson = JSON.stringify({
        facilities: theatreForm.facilities,
        gmapsLink: `https://www.google.com/maps?q=${theatreForm.latitude},${theatreForm.longitude}`,
        customDesc: theatreForm.description
      });
      const res = await createTheatre({
        theatre_name: theatreForm.theatre_name,
        address: theatreForm.address,
        city_id: theatreForm.city_id,
        latitude: parseFloat(theatreForm.latitude),
        longitude: parseFloat(theatreForm.longitude),
        phone: theatreForm.phone,
        email: theatreForm.email,
        description: descJson
      });
      toast.success('Theatre onboarded successfully');
      setIsAddTheatreOpen(false);
      loadOwnerStats();
    } catch (err) {
      toast.error('Failed to create theatre');
    }
  };

  // Screen actions
  const handleCreateScreen = async (e) => {
    e.preventDefault();
    try {
      await createScreen(selectedTheatreId, {
        screen_name: screenForm.screen_name,
        rows: parseInt(screenForm.rows_count, 10),
        columns: parseInt(screenForm.cols_count, 10)
      });
      toast.success('Screen seat layout configured');
      setIsAddScreenOpen(false);
      loadScreensAndShows();
    } catch (err) {
      toast.error('Failed to create screen layout');
    }
  };

  // Show actions
  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await createShow({
        ...showForm,
        price: parseFloat(showForm.price)
      });
      toast.success('Show scheduled successfully');
      setIsAddShowOpen(false);
      loadScreensAndShows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create show');
    }
  };

  const handleEditShowClick = (show) => {
    setEditingShow(show);
    setShowForm({
      movie_id: show.movie_id,
      screen_id: show.screen_id,
      show_date: show.show_date,
      start_time: show.start_time,
      end_time: show.end_time || '',
      language: show.language || 'English',
      format: show.format || '2D',
      price: String(show.price || '200')
    });
    setIsEditShowOpen(true);
  };

  const handleUpdateShowSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateShow(editingShow.id, {
        ...showForm,
        price: parseFloat(showForm.price)
      });
      toast.success('Show updated successfully');
      setIsEditShowOpen(false);
      loadScreensAndShows();
    } catch (err) {
      toast.error('Failed to update show');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Cancel and delete this show?')) return;
    try {
      await deleteShow(id);
      toast.success('Show time deleted');
      loadScreensAndShows();
    } catch (err) {
      toast.error('Failed to delete show');
    }
  };

  // Charts mapping data
  const chartData = [
    { name: 'Mon', revenue: (stats?.revenue || 12000) * 0.12 },
    { name: 'Tue', revenue: (stats?.revenue || 12000) * 0.09 },
    { name: 'Wed', revenue: (stats?.revenue || 12000) * 0.14 },
    { name: 'Thu', revenue: (stats?.revenue || 12000) * 0.11 },
    { name: 'Fri', revenue: (stats?.revenue || 12000) * 0.18 },
    { name: 'Sat', revenue: (stats?.revenue || 12000) * 0.23 },
    { name: 'Sun', revenue: (stats?.revenue || 12000) * 0.13 },
  ];

  if (loading) {
    return <Loader type="chart" />;
  }

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto px-4 md:px-8 py-10">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Theatre Partner Workspace</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">Configure multiplex seating grids, movie posters, and playtimes.</p>
        </div>
        
        {/* Actions & Theatre select */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {theatres.length > 0 ? (
            <select
              value={selectedTheatreId}
              onChange={e => setSelectedTheatreId(e.target.value)}
              className="px-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-extrabold focus:outline-none focus:border-amber-400"
            >
              {theatres.map(t => (
                <option key={t.id} value={t.id}>{t.theatre_name}</option>
              ))}
            </select>
          ) : (
            <Button onClick={() => setIsAddTheatreOpen(true)} className="flex items-center gap-1.5 font-bold text-xs bg-amber-400 text-gray-900 rounded-xl px-4 py-2 shadow-xs">
              <FiPlus />
              <span>Register Theatre</span>
            </Button>
          )}
          
          {theatres.length > 0 && (
            <Button onClick={() => setIsAddTheatreOpen(true)} variant="secondary" className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200">
              <FiPlus /> Add Theatre
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 hide-scrollbar">
        {[
          { id: 'analytics', label: 'Analytics', icon: FiGrid },
          { id: 'movies', label: 'Movies Catalog', icon: FiFilm },
          { id: 'screens', label: 'Screens Grid', icon: FiLayout },
          { id: 'shows', label: 'Play Schedules', icon: FiCalendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
        
        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Gross Revenue', value: `₹${stats?.revenue || 0}`, icon: FiDollarSign, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
                { title: 'Total Bookings', value: stats?.bookingsCount || 0, icon: FiCreditCard, color: 'text-amber-500 bg-amber-50 border-amber-100' },
                { title: 'Active Screens', value: stats?.totalScreens || 0, icon: FiPlusSquare, color: 'text-blue-500 bg-blue-50 border-blue-100' },
                { title: 'Listed Shows', value: stats?.totalShows || 0, icon: FiCalendar, color: 'text-purple-500 bg-purple-50 border-purple-100' }
              ].map((card, idx) => (
                <Card key={idx} className="flex items-center gap-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <div className={`p-4 rounded-2xl border ${card.color}`}>
                    <card.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.title}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{card.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-black text-lg text-gray-900 mb-6">Revenue Dashboard</h3>
                <div className="h-64">
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

              {/* Recent Bookings List */}
              <Card className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-lg text-gray-900 mb-4">Recent Transactions</h3>
                  <div className="space-y-4">
                    {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                      stats.recentBookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="text-xs font-black text-gray-800">{b.user?.full_name}</p>
                            <p className="text-[10px] text-gray-400 font-semibold">{b.booking_number}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-gray-900">₹{b.total_amount}</p>
                            <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              b.booking_status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {b.booking_status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs font-semibold text-gray-400 py-6 text-center">No transaction logs available.</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* MOVIES CONFIG */}
        {activeTab === 'movies' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-lg text-gray-900">Manage Cinema Catalog</h3>
              <Button onClick={() => { setEditingMovie(null); setMovieForm({ title:'', description:'', poster:'', banner:'', language:'English', genre:'Action', duration:'120', age_rating:'UA', release_date:'', status:'now_showing', trailer_url:'' }); setIsMovieModalOpen(true); }} className="flex items-center gap-1 text-xs font-black bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-xl px-4 py-2.5 shadow-xs">
                <FiPlus /> Add Movie
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.length > 0 ? (
                movies.map(movie => (
                  <div key={movie.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      <img src={movie.poster || movie.banner || 'https://placehold.co/300x450/1a1a1a/ffffff?text=No+Poster'} alt={movie.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                        {movie.age_rating || 'UA'}
                      </span>
                      <span className="absolute bottom-3 right-3 bg-amber-400 text-gray-900 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                        {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                      </span>
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between gap-4">
                      <div>
                        <h4 className="font-black text-base text-gray-900 line-clamp-1">{movie.title}</h4>
                        <p className="text-[10px] text-gray-400 font-extrabold mt-0.5">{movie.genre} | {movie.duration} Mins</p>
                        <p className="text-xs text-gray-500 font-semibold mt-2 line-clamp-2">{movie.description}</p>
                      </div>
                      
                      <div className="flex gap-2 border-t border-gray-100 pt-3">
                        <Button onClick={() => handleEditMovie(movie)} variant="secondary" size="sm" className="flex-1 flex justify-center items-center gap-1 text-[10px] font-black py-2 rounded-xl">
                          <FiEdit size={12} /> Edit
                        </Button>
                        <button onClick={() => handleDeleteMovie(movie.id)} className="p-2 border border-red-200 hover:bg-red-50 text-red-500 rounded-xl transition-colors cursor-pointer">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState title="No Movies Listed" message="List movies to schedule play shows." />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREENS CONFIG */}
        {activeTab === 'screens' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-lg text-gray-900">Physical Screens Map</h3>
              <Button onClick={() => setIsAddScreenOpen(true)} className="flex items-center gap-1 text-xs font-black bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-xl px-4 py-2.5 shadow-xs">
                <FiPlus /> Configure Screen
              </Button>
            </div>

            {screens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {screens.map(scr => (
                  <Card key={scr.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-lg text-gray-900">{scr.screen_name}</h4>
                        <p className="text-xs text-gray-400 font-extrabold uppercase mt-0.5">Seating capacity: {scr.capacity} seats</p>
                      </div>
                      <span className="p-3 bg-amber-50 text-amber-500 rounded-2xl border border-amber-100">
                        <FiLayout size={20} />
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-200/60 p-4 rounded-2xl text-center">
                      <div>
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Rows</span>
                        <span className="text-base font-black text-gray-900">{scr.rows}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Columns</span>
                        <span className="text-base font-black text-gray-900">{scr.columns}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Status</span>
                        <span className="text-xs font-black text-emerald-600 block mt-1">Ready</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => setViewingLayoutScreen(scr)} variant="secondary" className="flex-grow flex justify-center items-center gap-1.5 font-bold text-xs py-2.5 rounded-xl">
                        <FiLayout size={14} /> View Layout Configuration
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState title="No Screens Mapped" message="Register screens and allocate seat matrix grids." />
            )}
          </div>
        )}

        {/* SHOWS SCHEDULING */}
        {activeTab === 'shows' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-lg text-gray-900">Showtimes Schedules</h3>
              <Button onClick={() => { setShowForm({ movie_id: '', screen_id: '', show_date: '', start_time: '', end_time: '', language: 'English', format: '2D', price: '200' }); setIsAddShowOpen(true); }} className="flex items-center gap-1 text-xs font-black bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-xl px-4 py-2.5 shadow-xs">
                <FiPlus /> Schedule Show
              </Button>
            </div>

            {shows.filter(s => screens.some(sc => sc.id === s.screen_id)).length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                <Table
                  headers={['Movie Title', 'Screen', 'Show Date', 'Show Time', 'Language', 'Format', 'Price (INR)', 'Actions']}
                  data={shows.filter(s => screens.some(sc => sc.id === s.screen_id))}
                  renderRow={(s) => (
                    <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-sm text-gray-900">{s.movie?.title}</td>
                      <td className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">{s.screen?.screen_name}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-600">{s.show_date}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-600">{s.start_time} {s.end_time ? `- ${s.end_time}` : ''}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-600">{s.language || 'English'}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-600">{s.format || '2D'}</td>
                      <td className="px-6 py-4 text-xs font-black text-gray-800">₹{s.price}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleEditShowClick(s)} className="p-2 rounded-lg">
                          <FiEdit size={13} />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteShow(s.id)} className="p-2 rounded-lg">
                          <FiTrash2 size={13} />
                        </Button>
                      </td>
                    </tr>
                  )}
                />
              </div>
            ) : (
              <EmptyState title="No Shows Scheduled" message="Schedule movies on configured screens." />
            )}
          </div>
        )}

      </div>

      {/* --- MODALS LIST --- */}

      {/* Add Theatre */}
      <Modal isOpen={isAddTheatreOpen} onClose={() => setIsAddTheatreOpen(false)} title="Register Physical Theatre" size="lg">
        <form onSubmit={handleCreateTheatre} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left p-4">
          <Input label="Theatre Name" value={theatreForm.theatre_name} onChange={e => setTheatreForm({...theatreForm, theatre_name: e.target.value})} required />
          <Input label="Address Details" value={theatreForm.address} onChange={e => setTheatreForm({...theatreForm, address: e.target.value})} required />
          
          <div className="flex flex-col">
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Ticketing Zone (City)</label>
            <select
              value={theatreForm.city_id}
              onChange={e => setTheatreForm({...theatreForm, city_id: e.target.value})}
              className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id}>{c.city_name}</option>
              ))}
            </select>
          </div>

          <Input label="Facilities & Tags" value={theatreForm.facilities} onChange={e => setTheatreForm({...theatreForm, facilities: e.target.value})} required />
          <Input label="Helpdesk Phone" value={theatreForm.phone} onChange={e => setTheatreForm({...theatreForm, phone: e.target.value})} />
          <Input label="Support Email" type="email" value={theatreForm.email} onChange={e => setTheatreForm({...theatreForm, email: e.target.value})} />
          <Input label="Geo Latitude Coordinate" type="number" step="any" value={theatreForm.latitude} onChange={e => setTheatreForm({...theatreForm, latitude: e.target.value})} required />
          <Input label="Geo Longitude Coordinate" type="number" step="any" value={theatreForm.longitude} onChange={e => setTheatreForm({...theatreForm, longitude: e.target.value})} required />
          
          <div className="col-span-1 md:col-span-2">
            <Input label="Short Description" value={theatreForm.description} onChange={e => setTheatreForm({...theatreForm, description: e.target.value})} />
          </div>
          
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsAddTheatreOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black rounded-2xl px-6 py-2.5">Onboard Theatre</Button>
          </div>
        </form>
      </Modal>

      {/* Configure Screen Seat Layout */}
      <Modal isOpen={isAddScreenOpen} onClose={() => setIsAddScreenOpen(false)} title="Configure Screen Seating" size="md">
        <form onSubmit={handleCreateScreen} className="space-y-5 text-left p-4">
          <Input label="Screen Name (e.g. Cinema 1)" value={screenForm.screen_name} onChange={e => setScreenForm({...screenForm, screen_name: e.target.value})} required />
          <Input label="Total Seat Capacity" type="number" value={screenForm.capacity} onChange={e => setScreenForm({...screenForm, capacity: e.target.value})} required />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Vertical Rows Count" type="number" value={screenForm.rows_count} onChange={e => setScreenForm({...screenForm, rows_count: e.target.value})} required />
            <Input label="Seats Per Row" type="number" value={screenForm.cols_count} onChange={e => setScreenForm({...screenForm, cols_count: e.target.value})} required />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsAddScreenOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black rounded-2xl px-6 py-2.5">Initialize Seating</Button>
          </div>
        </form>
      </Modal>

      {/* Movie Form Modal */}
      <Modal isOpen={isMovieModalOpen} onClose={() => setIsMovieModalOpen(false)} title={editingMovie ? "Edit listed Movie" : "Add New Movie to Platform"} size="lg">
        <form onSubmit={handleMovieSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left p-4">
          <Input label="Movie Title" value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
          <Input label="Genres" placeholder="Action, Sci-Fi" value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} required />
          <Input label="Language" value={movieForm.language} onChange={e => setMovieForm({...movieForm, language: e.target.value})} required />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (Mins)" type="number" value={movieForm.duration} onChange={e => setMovieForm({...movieForm, duration: e.target.value})} required />
            
            <div className="flex flex-col">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Age Rating</label>
              <select
                value={movieForm.age_rating}
                onChange={e => setMovieForm({...movieForm, age_rating: e.target.value})}
                className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
              >
                <option value="U">U (General)</option>
                <option value="UA">UA (Parental guidance)</option>
                <option value="A">A (Adults only)</option>
              </select>
            </div>
          </div>

          <Input label="Release Date (YYYY-MM-DD)" type="date" value={movieForm.release_date} onChange={e => setMovieForm({...movieForm, release_date: e.target.value})} required />
          <Input label="Trailer YouTube Link" placeholder="https://youtube.com/watch?v=..." value={movieForm.trailer_url} onChange={e => setMovieForm({...movieForm, trailer_url: e.target.value})} />
          
          <div className="flex flex-col">
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Release Status</label>
            <select
              value={movieForm.status}
              onChange={e => setMovieForm({...movieForm, status: e.target.value})}
              className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
            >
              <option value="now_showing">Now Showing</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <Input label="Short Synopsis" value={movieForm.description} onChange={e => setMovieForm({...movieForm, description: e.target.value})} required />
          </div>

          {/* Image uploads */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <span className="block text-xs font-extrabold text-gray-500 uppercase">Poster Image</span>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'poster')} 
                  className="hidden" 
                  id="poster-upload-input" 
                />
                <label 
                  htmlFor="poster-upload-input" 
                  className="px-4 py-2 border border-gray-200 border-dashed hover:border-amber-400 bg-gray-50 hover:bg-white rounded-xl text-xs font-black text-gray-700 cursor-pointer flex items-center gap-1.5 transition-all w-full justify-center"
                >
                  <FiUpload /> {isUploading ? 'Uploading...' : 'Upload Poster'}
                </label>
              </div>
              {movieForm.poster && <p className="text-[10px] text-emerald-600 truncate font-semibold">Loaded: {movieForm.poster}</p>}
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-extrabold text-gray-500 uppercase">Backdrop Banner</span>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'banner')} 
                  className="hidden" 
                  id="banner-upload-input" 
                />
                <label 
                  htmlFor="banner-upload-input" 
                  className="px-4 py-2 border border-gray-200 border-dashed hover:border-amber-400 bg-gray-50 hover:bg-white rounded-xl text-xs font-black text-gray-700 cursor-pointer flex items-center gap-1.5 transition-all w-full justify-center"
                >
                  <FiUpload /> {isUploading ? 'Uploading...' : 'Upload Banner'}
                </label>
              </div>
              {movieForm.banner && <p className="text-[10px] text-emerald-600 truncate font-semibold">Loaded: {movieForm.banner}</p>}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsMovieModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black rounded-2xl px-6 py-2.5">
              {editingMovie ? 'Save Movie' : 'Publish Movie'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Show */}
      <Modal isOpen={isAddShowOpen} onClose={() => setIsAddShowOpen(false)} title="Schedule New Show" size="md">
        <form onSubmit={handleCreateShow} className="space-y-5 text-left p-4">
          <div className="flex flex-col">
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Movie</label>
            <select
              value={showForm.movie_id}
              onChange={e => setShowForm({...showForm, movie_id: e.target.value})}
              className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
              required
            >
              <option value="">Select Movie</option>
              {movies.filter(m => m.status === 'now_showing').map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Screen</label>
            <select
              value={showForm.screen_id}
              onChange={e => setShowForm({...showForm, screen_id: e.target.value})}
              className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
              required
            >
              <option value="">Select Screen</option>
              {screens.map(s => (
                <option key={s.id} value={s.id}>{s.screen_name}</option>
              ))}
            </select>
          </div>

          <Input label="Show Date (YYYY-MM-DD)" type="date" value={showForm.show_date} onChange={e => setShowForm({...showForm, show_date: e.target.value})} required />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" value={showForm.start_time} onChange={e => setShowForm({...showForm, start_time: e.target.value})} required />
            <Input label="End Time" type="time" value={showForm.end_time} onChange={e => setShowForm({...showForm, end_time: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Language</label>
              <select
                value={showForm.language}
                onChange={e => setShowForm({...showForm, language: e.target.value})}
                className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Format</label>
              <select
                value={showForm.format}
                onChange={e => setShowForm({...showForm, format: e.target.value})}
                className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX 2D">IMAX 2D</option>
                <option value="IMAX 3D">IMAX 3D</option>
              </select>
            </div>
          </div>

          <Input label="Base Ticket Price (INR)" type="number" value={showForm.price} onChange={e => setShowForm({...showForm, price: e.target.value})} required />

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsAddShowOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black rounded-2xl px-6 py-2.5">Schedule Show</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Show Modal */}
      <Modal isOpen={isEditShowOpen} onClose={() => setIsEditShowOpen(false)} title="Reschedule Showtime" size="md">
        <form onSubmit={handleUpdateShowSubmit} className="space-y-5 text-left p-4">
          <div className="flex flex-col">
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Movie</label>
            <select
              value={showForm.movie_id}
              onChange={e => setShowForm({...showForm, movie_id: e.target.value})}
              className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
              required
            >
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Screen</label>
            <select
              value={showForm.screen_id}
              onChange={e => setShowForm({...showForm, screen_id: e.target.value})}
              className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
              required
            >
              {screens.map(s => (
                <option key={s.id} value={s.id}>{s.screen_name}</option>
              ))}
            </select>
          </div>

          <Input label="Show Date (YYYY-MM-DD)" type="date" value={showForm.show_date} onChange={e => setShowForm({...showForm, show_date: e.target.value})} required />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" value={showForm.start_time} onChange={e => setShowForm({...showForm, start_time: e.target.value})} required />
            <Input label="End Time" type="time" value={showForm.end_time} onChange={e => setShowForm({...showForm, end_time: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Language</label>
              <select
                value={showForm.language}
                onChange={e => setShowForm({...showForm, language: e.target.value})}
                className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2">Format</label>
              <select
                value={showForm.format}
                onChange={e => setShowForm({...showForm, format: e.target.value})}
                className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold transition-colors"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX 2D">IMAX 2D</option>
                <option value="IMAX 3D">IMAX 3D</option>
              </select>
            </div>
          </div>

          <Input label="Base Ticket Price (INR)" type="number" value={showForm.price} onChange={e => setShowForm({...showForm, price: e.target.value})} required />

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsEditShowOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black rounded-2xl px-6 py-2.5">Update Show</Button>
          </div>
        </form>
      </Modal>

      {/* View Seat Layout Modal */}
      <Modal isOpen={!!viewingLayoutScreen} onClose={() => setViewingLayoutScreen(null)} title={`Seating Configuration - ${viewingLayoutScreen?.screen_name}`} size="lg">
        {viewingLayoutScreen && (
          <div className="p-6 text-center space-y-6">
            <div className="w-full bg-gray-300 h-1.5 rounded-full relative mb-12">
              <span className="absolute left-1/2 -translate-x-1/2 -top-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Cinema Screen (This Way Facing)</span>
            </div>

            <div className="space-y-2 overflow-auto max-h-96 pb-4">
              {Array.from({ length: viewingLayoutScreen.rows }).map((_, r) => {
                const rowLetter = String.fromCharCode(65 + r);
                return (
                  <div key={rowLetter} className="flex justify-center items-center gap-2">
                    <span className="w-6 font-extrabold text-xs text-gray-400">{rowLetter}</span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: viewingLayoutScreen.columns }).map((_, c) => {
                        const colIdx = c + 1;
                        let color = 'bg-gray-100 hover:bg-amber-100 text-gray-600';
                        if (r < 2) {
                          color = 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-100'; // VIP
                        } else if (r < 5) {
                          color = 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100'; // Premium
                        }
                        return (
                          <div 
                            key={colIdx} 
                            className={`w-7 h-7 rounded-lg text-[9px] font-black flex items-center justify-center transition-all cursor-default ${color}`}
                            title={`${rowLetter}-${colIdx}`}
                          >
                            {colIdx}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-6 pt-4 border-t border-gray-100 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-red-50 border border-red-100 block"></span>
                <span>VIP (Row A-B) - ₹350</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-blue-50 border border-blue-100 block"></span>
                <span>Premium (Row C-E) - ₹220</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-gray-100 block"></span>
                <span>Normal (Row F+) - ₹150</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default TheatreOwnerDashboard;
