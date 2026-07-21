import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiGrid, FiFilm, FiCalendar, FiDollarSign, FiPlusSquare, 
  FiCreditCard, FiTrash2, FiPlus, FiMapPin, FiPhone, FiMail, 
  FiInfo, FiEdit, FiVideo, FiLayout, FiImage, FiUpload, FiPlay, FiUser,
  FiSettings, FiActivity, FiUsers, FiPercent, FiHeart, FiBell, FiCheck, FiX, FiPrinter, FiStar
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../services/api';
import { getDashboardStats } from '../../services/dashboardService';
import { getTheatres, createTheatre } from '../../services/theatreService';
import { getScreens, createScreen, getScreenDetails, updateScreen } from '../../services/screenService';
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

const SEAT_COLORS = {
  empty: 'bg-slate-100/40 border-dashed border-gray-300 text-transparent opacity-20 cursor-pointer hover:bg-slate-200/50',
  normal: 'bg-green-500 border-green-600 text-white hover:bg-green-600 cursor-pointer',
  vip: 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600 cursor-pointer',
  recliner: 'bg-purple-500 border-purple-600 text-white hover:bg-purple-600 cursor-pointer',
  couple: 'bg-yellow-500 border-yellow-600 text-gray-900 hover:bg-yellow-600 cursor-pointer',
  wheelchair: 'bg-teal-500 border-teal-600 text-white hover:bg-teal-600 cursor-pointer',
  blocked: 'bg-gray-400 border-gray-500 text-white cursor-pointer hover:bg-gray-500',
  reserved: 'bg-red-500 border-red-600 text-white cursor-pointer hover:bg-red-600'
};

const AMENITIES_LIST = [
  'Parking', 'Food Court', 'Dolby Atmos', '4K Projection', 'Wheelchair Access', 'Air Conditioning'
];

const parseDescription = (descString) => {
  try {
    const parsed = JSON.parse(descString);
    if (parsed && typeof parsed === 'object') {
      return {
        text: parsed.text || '',
        thumbnail: parsed.thumbnail || '',
        gallery: parsed.gallery || []
      };
    }
  } catch (e) {}
  return {
    text: descString || '',
    thumbnail: '',
    gallery: []
  };
};

const ImageUploadField = ({ label, value, onChange, type = 'poster' }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.data?.url || res.data?.url;
      if (url) {
        onChange(url);
        toast.success(`${label} uploaded successfully!`);
      } else {
        onChange(URL.createObjectURL(file));
      }
    } catch (err) {
      onChange(URL.createObjectURL(file));
      toast.error('Failed to upload to server. Stored locally.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-extrabold text-gray-500 uppercase">{label}</label>
      {value ? (
        <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="bg-white text-gray-900 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl cursor-pointer hover:bg-amber-100">
              Replace
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl hover:bg-red-700 focus:outline-none"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50/50 hover:border-amber-400 transition-all p-4">
          <FiUpload size={24} className="text-gray-400" />
          <span className="text-xs text-gray-500 font-bold mt-2">
            {uploading ? 'Uploading image...' : `Drag & Drop or Browse ${label}`}
          </span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      )}
    </div>
  );
};

const GalleryUploader = ({ label, value = [], onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);

    const urls = [...value];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'backdrop');

      try {
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = res.data?.data?.url || res.data?.url;
        if (url) urls.push(url);
      } catch (err) {
        urls.push(URL.createObjectURL(file));
      }
    }
    onChange(urls);
    setUploading(false);
    toast.success('Gallery images updated!');
  };

  const removeImage = (indexToRemove) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-extrabold text-gray-500 uppercase">{label}</label>
      
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {value.map((img, idx) => (
            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
              >
                <FiX size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50/50 hover:border-amber-400 transition-all p-4">
        <FiPlus size={20} className="text-gray-400" />
        <span className="text-[10px] text-gray-500 font-bold mt-1">
          {uploading ? 'Adding images...' : 'Add Gallery Images'}
        </span>
        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
    </div>
  );
};

import useDocumentTitle from '../../hooks/useDocumentTitle';

const TheatreOwnerDashboard = () => {
  useDocumentTitle('Theatre Owner Partner Dashboard', 'Manage your multiplex screens, movie shows, seat layouts, F&B menu, and revenue telemetry.');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPathname = () => {
    const path = location.pathname;
    if (path.includes('/theatres')) return 'theatres';
    if (path.includes('/screens')) return 'screens';
    if (path.includes('/movies')) return 'movies';
    if (path.includes('/shows')) return 'shows';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/food-beverage')) return 'food-beverage';
    if (path.includes('/staff')) return 'staff';
    if (path.includes('/promotions')) return 'promotions';
    if (path.includes('/reviews')) return 'reviews';
    if (path.includes('/revenue')) return 'revenue';
    if (path.includes('/audit-logs')) return 'audit-logs';
    if (path.includes('/profile') || path.includes('/settings')) return 'profile';
    return 'analytics';
  };

  const activeTab = getTabFromPathname();
  const [loading, setLoading] = useState(true);

  // Core Data Lists
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Selections
  const [selectedTheatreId, setSelectedTheatreId] = useState('');

  // Modals & Drawers
  const [isAddTheatreOpen, setIsAddTheatreOpen] = useState(false);
  const [isAddScreenOpen, setIsAddScreenOpen] = useState(false);
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);
  const [isEditShowOpen, setIsEditShowOpen] = useState(false);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [seatBuilderScreen, setSeatBuilderScreen] = useState(null);

  // Forms states
  const [editingShow, setEditingShow] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);

  const [theatreForm, setTheatreForm] = useState({
    theatre_name: '', address: '', city_id: CITIES[0]?.id || '',
    facilities: 'Parking, Food Court, Dolby Atmos',
    phone: '', email: '', latitude: '19.076090', longitude: '72.877726',
    description: '', amenities: ['Parking', 'Food Court'], status: 'Open'
  });

  const [screenForm, setScreenForm] = useState({
    screen_name: '', capacity: '120', rows_count: '10', cols_count: '12',
    projection_type: 'Laser Projection', sound_system: 'Dolby Atmos',
    status: 'Active', photo_url: ''
  });

  const [showForm, setShowForm] = useState({
    movie_id: '', screen_id: '', show_date: '', start_time: '', end_time: '',
    language: 'English', format: '2D', price: '200', cleaning_time: '15', interval_time: '15'
  });

  const [movieForm, setMovieForm] = useState({
    title: '', description: '', poster: '', banner: '', language: 'English',
    genre: 'Action, Thriller', duration: '120', age_rating: 'UA', release_date: '',
    status: 'now_showing', trailer_url: ''
  });

  // Enterprise Feature Mock States
  const [theatreStatus, setTheatreStatus] = useState('Open'); // Open, Closed, Maintenance, Holiday, Emergency
  const [selectedSeatType, setSelectedSeatType] = useState('normal');
  const [seatPricing, setSeatPricing] = useState({
    normal: 150, vip: 350, recliner: 250, couple: 400, wheelchair: 120, blocked: 0, reserved: 150
  });
  const [visualLayout, setVisualLayout] = useState({}); // Stores coordinates 'Row-Col' -> { type, price }
  const [editorRows, setEditorRows] = useState(10);
  const [editorCols, setEditorCols] = useState(12);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [clipboardRowLayout, setClipboardRowLayout] = useState(null);
  const [isAudiencePreview, setIsAudiencePreview] = useState(false);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all'); // all, 5, 4plus, 3minus
  const [reviewSortOrder, setReviewSortOrder] = useState('newest'); // newest, oldest, positive, negative

  // Booking operations state
  const [checkinCode, setCheckinCode] = useState('');
  const [searchBookingQuery, setSearchBookingQuery] = useState('');

  // Food & Beverage Menu State
  const [fnBItems, setFnBItems] = useState([
    { id: '1', name: 'Caramel Popcorn (L)', category: 'Popcorn', price: 290, stock: 45, status: 'Available' },
    { id: '2', name: 'Salted Popcorn (M)', category: 'Popcorn', price: 220, stock: 60, status: 'Available' },
    { id: '3', name: 'Pepsi Duo Combo', category: 'Combos', price: 420, stock: 120, status: 'Available' },
    { id: '4', name: 'Nachos with Cheese', category: 'Snacks', price: 260, stock: 18, status: 'Available' },
    { id: '5', name: 'Coca Cola (L)', category: 'Drinks', price: 180, stock: 150, status: 'Available' }
  ]);
  const [isAddFnBOpen, setIsAddFnBOpen] = useState(false);
  const [fnbForm, setFnbForm] = useState({ name: '', category: 'Popcorn', price: '', stock: '' });

  // Employee/Staff State
  const [employees, setEmployees] = useState([
    { id: '1', name: 'Amit Sharma', role: 'Manager', email: 'amit@ticketshow.com', phone: '9876543210', permissions: ['Manage Theatres', 'Manage Shows', 'View Financials'] },
    { id: '2', name: 'Sunita Roy', role: 'Cashier', email: 'sunita@ticketshow.com', phone: '9876543211', permissions: ['Book Tickets', 'F&B Sales'] },
    { id: '3', name: 'Vikram Singh', role: 'Ticket Checker', email: 'vikram@ticketshow.com', phone: '9876543212', permissions: ['Scan Tickets'] }
  ]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', role: 'Cashier', email: '', phone: '', permissions: [] });

  // Campaigns & Pricing Rules State
  const [campaigns, setCampaigns] = useState([
    { id: '1', name: 'Weekend Blockbuster Fest', type: 'Weekend Rules', discount: '10% MarkUp', code: 'N/A', active: true },
    { id: '2', name: 'Student Wednesday Pass', type: 'Student Discount', discount: '₹50 OFF', code: 'STUDENT50', active: true },
    { id: '3', name: 'HDFC Card Special discount', type: 'Bank Offer', discount: '15% Flat OFF', code: 'HDFCCINEMA', active: false }
  ]);
  const [pricingRules, setPricingRules] = useState({
    weekendMultiplier: 1.15,
    holidayMultiplier: 1.25,
    morningDiscount: 30, // Rs flat off
    nightMarkup: 20 // Rs flat extra
  });

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState([
    { id: '1', action: 'Show Created', details: 'Show scheduled for Interstellar on Screen 1', user: 'Amit (Manager)', timestamp: '2026-07-20 18:45:10' },
    { id: '2', action: 'Seats Blocked', details: 'Blocked Row H (8 seats) on Screen 2 for VIP maintenance', user: 'Amit (Manager)', timestamp: '2026-07-20 16:30:00' },
    { id: '3', action: 'Pricing Rule Changed', details: 'Weekend markup rules updated to 1.15x', user: 'John (Owner)', timestamp: '2026-07-20 14:15:22' },
    { id: '4', action: 'F&B Stock Refilled', description: 'Added 50 Large Popcorn packs', user: 'Sunita (Cashier)', timestamp: '2026-07-20 11:05:40' }
  ]);

  // Customer Reviews State
  const [reviews, setReviews] = useState([
    { id: '1', customerName: 'Rohan Patil', rating: 5, reviewText: 'Amazing sound system and recliners! Loved the experience.', movieName: 'Interstellar', date: '2026-07-19', hidden: false, reply: '', pinned: true, abuse: false, helpfulCount: 24 },
    { id: '2', customerName: 'Nisha Mehra', rating: 4, reviewText: 'Good screens, food is a bit expensive but clean halls.', movieName: 'Avatar: Way of Water', date: '2026-07-18', hidden: false, reply: 'Thank you Nisha! We appreciate the feedback.', pinned: false, abuse: false, helpfulCount: 15 },
    { id: '3', customerName: 'Aman Varma', rating: 5, reviewText: 'The VIP screen is mind-blowing! Super plush recliners and service.', movieName: 'Interstellar', date: '2026-07-20', hidden: false, reply: '', pinned: false, abuse: false, helpfulCount: 42 },
    { id: '4', customerName: 'Bad Boy 99', rating: 1, reviewText: 'This theatre is absolute garbage! Very bad screen resolution and stale popcorn.', movieName: 'Spider-Man', date: '2026-07-17', hidden: true, reply: '', pinned: false, abuse: true, helpfulCount: 2 }
  ]);

  // Analytics mock data sets
  const analyticsData = [
    { name: 'Mon', revenue: 42000, occupancy: 45, utilization: 60 },
    { name: 'Tue', revenue: 38000, occupancy: 40, utilization: 55 },
    { name: 'Wed', revenue: 49000, occupancy: 52, utilization: 70 },
    { name: 'Thu', revenue: 41000, occupancy: 44, utilization: 58 },
    { name: 'Fri', revenue: 85000, occupancy: 80, utilization: 90 },
    { name: 'Sat', revenue: 125000, occupancy: 95, utilization: 98 },
    { name: 'Sun', revenue: 110000, occupancy: 88, utilization: 94 }
  ];

  const screenRevenueData = [
    { name: 'Screen 1 (IMAX)', value: 240000 },
    { name: 'Screen 2 (VIP)', value: 180000 },
    { name: 'Screen 3 (4DX)', value: 140000 },
    { name: 'Screen 4 (2D)', value: 95000 }
  ];

  const COLORS = ['#F59E0B', '#10B981', '#6366F1', '#EC4899'];

  const getRowLetter = (rIndex) => {
    let letter = '';
    let temp = rIndex;
    while (temp >= 0) {
      letter = String.fromCharCode(65 + (temp % 26)) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  const handleAddRow = () => {
    const nextRowLetter = getRowLetter(editorRows);
    const updatedGrid = { ...visualLayout };
    for (let c = 1; c <= editorCols; c++) {
      updatedGrid[`${nextRowLetter}-${c}`] = { type: 'normal', price: seatPricing.normal };
    }
    setVisualLayout(updatedGrid);
    setEditorRows(prev => prev + 1);
    toast.success(`Row ${nextRowLetter} added at bottom.`);
  };

  const handleDeleteRow = () => {
    if (editorRows <= 1) return toast.error("Must have at least 1 row.");
    const lastRowLetter = getRowLetter(editorRows - 1);
    const updatedGrid = { ...visualLayout };
    for (let c = 1; c <= editorCols; c++) {
      delete updatedGrid[`${lastRowLetter}-${c}`];
    }
    setVisualLayout(updatedGrid);
    setEditorRows(prev => prev - 1);
    toast.success(`Deleted row ${lastRowLetter}.`);
  };

  const handleAddColumn = () => {
    const nextCol = editorCols + 1;
    const updatedGrid = { ...visualLayout };
    for (let r = 0; r < editorRows; r++) {
      const rowLetter = getRowLetter(r);
      updatedGrid[`${rowLetter}-${nextCol}`] = { type: 'normal', price: seatPricing.normal };
    }
    setVisualLayout(updatedGrid);
    setEditorCols(nextCol);
    toast.success(`Column ${nextCol} added on right.`);
  };

  const handleDeleteColumn = () => {
    if (editorCols <= 1) return toast.error("Must have at least 1 column.");
    const colToDelete = editorCols;
    const updatedGrid = { ...visualLayout };
    for (let r = 0; r < editorRows; r++) {
      const rowLetter = getRowLetter(r);
      delete updatedGrid[`${rowLetter}-${colToDelete}`];
    }
    setVisualLayout(updatedGrid);
    setEditorCols(prev => prev - 1);
    toast.success(`Deleted column ${colToDelete}.`);
  };

  const handleInsertRowAbove = (targetR) => {
    const updatedGrid = {};
    for (let r = editorRows - 1; r >= targetR; r--) {
      const oldLetter = getRowLetter(r);
      const newLetter = getRowLetter(r + 1);
      for (let c = 1; c <= editorCols; c++) {
        updatedGrid[`${newLetter}-${c}`] = visualLayout[`${oldLetter}-${c}`] || { type: 'empty', price: 0 };
      }
    }
    for (let r = 0; r < targetR; r++) {
      const rowLetter = getRowLetter(r);
      for (let c = 1; c <= editorCols; c++) {
        updatedGrid[`${rowLetter}-${c}`] = visualLayout[`${rowLetter}-${c}`] || { type: 'empty', price: 0 };
      }
    }
    const insertLetter = getRowLetter(targetR);
    for (let c = 1; c <= editorCols; c++) {
      updatedGrid[`${insertLetter}-${c}`] = { type: 'normal', price: seatPricing.normal };
    }
    setVisualLayout(updatedGrid);
    setEditorRows(prev => prev + 1);
    toast.success(`Inserted new row at position ${insertLetter}.`);
  };

  const handleInsertRowBelow = (targetR) => {
    handleInsertRowAbove(targetR + 1);
  };

  const handleDuplicateRow = (srcR) => {
    if (srcR === editorRows - 1) {
      const srcLetter = getRowLetter(srcR);
      const destLetter = getRowLetter(srcR + 1);
      const updatedGrid = { ...visualLayout };
      for (let c = 1; c <= editorCols; c++) {
        updatedGrid[`${destLetter}-${c}`] = { ...visualLayout[`${srcLetter}-${c}`] };
      }
      setVisualLayout(updatedGrid);
      setEditorRows(prev => prev + 1);
      toast.success(`Duplicated row ${srcLetter} at bottom.`);
    } else {
      const srcLetter = getRowLetter(srcR);
      const destLetter = getRowLetter(srcR + 1);
      const updatedGrid = { ...visualLayout };
      for (let c = 1; c <= editorCols; c++) {
        updatedGrid[`${destLetter}-${c}`] = { ...visualLayout[`${srcLetter}-${c}`] };
      }
      setVisualLayout(updatedGrid);
      toast.success(`Copied row ${srcLetter} layout to row ${destLetter}.`);
    }
  };

  const copyRowLayout = (rowIndex) => {
    const rowLetter = getRowLetter(rowIndex);
    const layout = [];
    for (let c = 1; c <= editorCols; c++) {
      layout.push({ ...(visualLayout[`${rowLetter}-${c}`] || { type: 'empty', price: 0 }) });
    }
    setClipboardRowLayout(layout);
    toast.success(`Copied layout of row ${rowLetter}.`);
  };

  const pasteRowLayout = (rowIndex) => {
    if (!clipboardRowLayout) return toast.error("Clipboard empty! Copy a row layout first.");
    const rowLetter = getRowLetter(rowIndex);
    const updatedGrid = { ...visualLayout };
    for (let c = 1; c <= editorCols; c++) {
      if (clipboardRowLayout[c - 1]) {
        updatedGrid[`${rowLetter}-${c}`] = { ...clipboardRowLayout[c - 1] };
      }
    }
    setVisualLayout(updatedGrid);
    toast.success(`Pasted layout to row ${rowLetter}.`);
  };

  const paintCell = (rIndex, cIndex) => {
    const rowLetter = getRowLetter(rIndex);
    const key = `${rowLetter}-${cIndex}`;
    const price = seatPricing[selectedSeatType] || 0;
    setVisualLayout(prev => ({
      ...prev,
      [key]: { type: selectedSeatType, price }
    }));
  };

  const getStats = () => {
    let total = 0;
    let vip = 0;
    let recliner = 0;
    let couple = 0;
    let wheelchair = 0;
    let blocked = 0;
    let reserved = 0;
    let normal = 0;

    Object.values(visualLayout).forEach(s => {
      if (!s || s.type === 'empty') return;
      total++;
      if (s.type === 'vip') vip++;
      else if (s.type === 'recliner') recliner++;
      else if (s.type === 'couple') couple++;
      else if (s.type === 'wheelchair') wheelchair++;
      else if (s.type === 'blocked') blocked++;
      else if (s.type === 'reserved') reserved++;
      else normal++;
    });

    const capacity = total - blocked - reserved;

    return { total, vip, recliner, couple, wheelchair, blocked, reserved, normal, capacity };
  };

  const stats = getStats();

  // Core API loader
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Get theatres
      const theatresRes = await getTheatres();
      const list = Array.isArray(theatresRes) ? theatresRes : [];
      setTheatres(list);
      if (list.length > 0) {
        setSelectedTheatreId(list[0].id);
      }

      // 2. Get Movies
      const moviesRes = await getMovies();
      setMovies(Array.isArray(moviesRes) ? moviesRes : []);

      // 3. Get Bookings mock/api
      try {
        const bookingsRes = await api.get('/bookings/owner/all');
        setBookings(bookingsRes.data?.data?.bookings || []);
      } catch (err) {
        // Fallback mock bookings
        setBookings([
          { id: 'b1', booking_number: 'BK-998811', user: { full_name: 'Rahul K.' }, total_amount: 540, booking_status: 'confirmed', booking_date: '2026-07-20', show: { movie: { title: 'Interstellar' }, show_date: '2026-07-20', start_time: '18:00' } },
          { id: 'b2', booking_number: 'BK-552244', user: { full_name: 'Pooja Sen' }, total_amount: 880, booking_status: 'confirmed', booking_date: '2026-07-20', show: { movie: { title: 'Avatar: Way of Water' }, show_date: '2026-07-20', start_time: '20:15' } },
          { id: 'b3', booking_number: 'BK-110022', user: { full_name: 'Dev D.' }, total_amount: 320, booking_status: 'cancelled', booking_date: '2026-07-19', show: { movie: { title: 'Spider-Man' }, show_date: '2026-07-19', start_time: '14:30' } }
        ]);
      }
    } catch (err) {
      toast.error('Failed to load portal databases');
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
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadScreensAndShows();
  }, [selectedTheatreId]);

  // CRUD API Submissions
  const handleTheatreSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTheatre(theatreForm);
      toast.success('Theatre listing created successfully!');
      setIsAddTheatreOpen(false);
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to create theatre');
    }
  };

  const handleScreenSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTheatreId) return toast.error('Please register a theatre first');
    try {
      await createScreen(selectedTheatreId, {
        screen_name: screenForm.screen_name,
        capacity: parseInt(screenForm.capacity, 10),
        rows: parseInt(screenForm.rows_count, 10),
        columns: parseInt(screenForm.cols_count, 10)
      });
      toast.success('Screen registered successfully!');
      setIsAddScreenOpen(false);
      loadScreensAndShows();
      // Audit Log
      setAuditLogs([
        { id: Date.now().toString(), action: 'Screen Created', details: `Screen ${screenForm.screen_name} added to Theatre`, user: 'John (Owner)', timestamp: new Date().toLocaleString() },
        ...auditLogs
      ]);
    } catch (err) {
      toast.error('Failed to register screen');
    }
  };

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalDescription = JSON.stringify({
        text: movieForm.description || '',
        thumbnail: movieForm.thumbnail || '',
        gallery: movieForm.gallery || []
      });

      const payload = {
        ...movieForm,
        description: finalDescription,
        duration: parseInt(movieForm.duration, 10) || 120
      };

      if (editingMovie) {
        await updateMovie(editingMovie.id, payload);
        toast.success('Movie updated successfully!');
      } else {
        await createMovie(payload);
        toast.success('Movie listed successfully on platform!');
      }
      setIsMovieModalOpen(false);
      setEditingMovie(null);
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to listing movie');
    }
  };

  // Showtime overlap checks & Scheduler
  const handleShowSubmit = async (e) => {
    e.preventDefault();
    
    // Validations: overlap check
    const newShowDate = showForm.show_date;
    const newStart = showForm.start_time;
    const newEnd = showForm.end_time;
    
    const overlap = shows.some(s => {
      if (editingShow && s.id === editingShow.id) return false;
      if (s.screen_id === showForm.screen_id && s.show_date === newShowDate) {
        // Calculate minutes
        const [sh, sm] = s.start_time.split(':').map(Number);
        const [eh, em] = s.end_time.split(':').map(Number);
        const sStart = sh * 60 + sm;
        const sEnd = eh * 60 + em;

        const [nsh, nsm] = newStart.split(':').map(Number);
        const [neh, nem] = newEnd.split(':').map(Number);
        const nStart = nsh * 60 + nsm;
        const nEnd = neh * 60 + nem;

        // check overlaps
        return (nStart < sEnd && nEnd > sStart);
      }
      return false;
    });

    if (overlap) {
      return toast.error('CONFLICT ERROR: Overlapping showtime scheduled on this screen. Change timings!');
    }

    try {
      const payload = {
        movie_id: showForm.movie_id,
        screen_id: showForm.screen_id,
        show_date: showForm.show_date,
        start_time: showForm.start_time,
        end_time: showForm.end_time,
        language: showForm.language,
        format: showForm.format,
        price: parseFloat(showForm.price)
      };

      if (editingShow) {
        await updateShow(editingShow.id, payload);
        toast.success('Showtime updated successfully!');
        setIsEditShowOpen(false);
      } else {
        await createShow(payload);
        toast.success('Show scheduled successfully!');
        setIsAddShowOpen(false);
      }
      setEditingShow(null);
      loadScreensAndShows();
    } catch (err) {
      toast.error(editingShow ? 'Failed to update showtime' : 'Failed to schedule showtime');
    }
  };

  // Check-in Ticket manual check-in
  const handleManualCheckIn = () => {
    const b = bookings.find(item => item.booking_number === checkinCode);
    if (!b) return toast.error('Ticket record not found!');
    if (b.booking_status === 'checked-in') return toast.warning('Already checked in!');
    
    // Update booking status locally
    setBookings(bookings.map(item => item.booking_number === checkinCode ? { ...item, booking_status: 'checked-in' } : item));
    toast.success(`Check-in successful for booking: ${checkinCode}!`);
    setCheckinCode('');
  };

  // F&B add Combo combo pricing
  const handleAddFnb = (e) => {
    e.preventDefault();
    const item = {
      id: Date.now().toString(),
      name: fnbForm.name,
      category: fnbForm.category,
      price: parseFloat(fnbForm.price),
      stock: parseInt(fnbForm.stock, 10),
      status: 'Available'
    };
    setFnBItems([...fnBItems, item]);
    setIsAddFnBOpen(false);
    toast.success('F&B Item registered in inventory!');
  };

  // Staff add Employee
  const handleAddStaff = (e) => {
    e.preventDefault();
    const item = {
      id: Date.now().toString(),
      name: staffForm.name,
      role: staffForm.role,
      email: staffForm.email,
      phone: staffForm.phone,
      permissions: staffForm.permissions
    };
    setEmployees([...employees, item]);
    setIsAddStaffOpen(false);
    toast.success('Employee staff registered successfully!');
  };

  return (
    <div className="flex-grow p-6 bg-gray-50 text-left space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs max-w-full overflow-hidden">
        <div>
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Cinema Partner Portal</span>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Theatre CMS Dashboard</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">Manage screens, showtimes, tickets bookings, pricing tiers, and audit logs.</p>
        </div>

        {/* Global Select & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <div className="flex flex-col flex-1 sm:flex-none">
            <span className="text-[9px] font-black text-gray-400 uppercase mb-1">Current Active Theatre</span>
            <select
              value={selectedTheatreId}
              onChange={e => setSelectedTheatreId(e.target.value)}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-xs font-black rounded-xl border border-gray-200 bg-gray-50 focus:outline-none cursor-pointer truncate"
              aria-label="Select Active Theatre"
            >
              {theatres.map(t => (
                <option key={t.id} value={t.id}>{t.theatre_name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col flex-1 sm:flex-none">
            <span className="text-[9px] font-black text-gray-400 uppercase mb-1">Theatre Mode Status</span>
            <select
              value={theatreStatus}
              onChange={e => {
                setTheatreStatus(e.target.value);
                toast.success(`Theatre Mode switched to: ${e.target.value}`);
              }}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-xs font-black rounded-xl border border-gray-200 bg-amber-400 text-gray-900 focus:outline-none cursor-pointer truncate"
              aria-label="Select Theatre Operating Mode"
            >
              <option value="Open">🟢 Open Mode</option>
              <option value="Closed">🔴 Closed Mode</option>
              <option value="Maintenance">🔧 Maintenance</option>
              <option value="Holiday">🏖️ Holiday Mode</option>
              <option value="Emergency">⚠️ Emergency Closure</option>
            </select>
          </div>
        </div>
      </div>

      {/* CORE PAGES RENDER */}

      {/* TABS 1: Analytics / Overview */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Cinemas', value: theatres.length, icon: FiPlusSquare, color: 'text-amber-500' },
              { label: 'Active Screens', value: screens.length || '4', icon: FiLayout, color: 'text-blue-500' },
              { label: 'Today\'s Shows', value: shows.length || '12', icon: FiCalendar, color: 'text-purple-500' },
              { label: 'Tickets Sold Today', value: '450', icon: FiCreditCard, color: 'text-green-500' },
              { label: 'Today\'s Revenue', value: '₹1,58,400', icon: FiDollarSign, color: 'text-green-600' },
              { label: 'Monthly Occupancy', value: '72%', icon: FiActivity, color: 'text-teal-500' },
              { label: 'Audits logged', value: auditLogs.length, icon: FiActivity, color: 'text-gray-500' },
              { label: 'Pending Approvals', value: '0', icon: FiCheck, color: 'text-amber-600' }
            ].map((metric, idx) => (
              <Card key={idx} className="p-5 border border-gray-200 bg-white rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{metric.label}</span>
                  <h3 className="text-xl font-black text-gray-800 mt-1">{metric.value}</h3>
                </div>
                <div className={`p-3 bg-gray-50 rounded-xl ${metric.color}`}>
                  <metric.icon size={20} />
                </div>
              </Card>
            ))}
          </div>

          {/* Graphical Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs">
              <h3 className="text-base font-black text-gray-900 mb-4 uppercase tracking-wider">Weekly Revenue Analytics</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs">
              <h3 className="text-base font-black text-gray-900 mb-4 uppercase tracking-wider">Show Occupancy & Screen Utilization</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#10B981" strokeWidth={2} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="utilization" name="Utilization %" stroke="#6366F1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Recent Bookings activity */}
          <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs">
            <h3 className="text-base font-black text-gray-900 mb-4 uppercase tracking-wider">Recent Ticket Bookings</h3>
            <Table
              headers={['Booking ID', 'Customer', 'Show / Movie', 'Date', 'Price Paid', 'Status']}
              data={bookings.slice(0, 5)}
              renderRow={(b, idx) => (
                <tr key={b.id || idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-xs font-black text-slate-800">{b.booking_number}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-semibold">{b.user?.full_name || 'Guest User'}</td>
                  <td className="px-6 py-4 text-xs text-gray-805 font-black">{b.show?.movie?.title || 'Interstellar'}</td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-semibold">{b.booking_date}</td>
                  <td className="px-6 py-4 text-xs text-green-600 font-black">₹{b.total_amount}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      b.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>{b.booking_status}</span>
                  </td>
                </tr>
              )}
            />
          </Card>
        </div>
      )}

      {/* TABS 2: Theatres Management */}
      {activeTab === 'theatres' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-xs">
            <h2 className="text-lg font-black text-gray-900">Manage Cinema Outlets</h2>
            <Button variant="primary" className="bg-amber-400 text-gray-900 py-2 px-4 rounded-xl flex items-center gap-1 text-xs font-black" onClick={() => setIsAddTheatreOpen(true)}>
              <FiPlus /> Add Theatre
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {theatres.map(t => (
              <Card key={t.id} className="border border-gray-200 bg-white rounded-3xl overflow-hidden shadow-xs relative">
                {/* Cover Header Banner */}
                <div className="h-32 bg-slate-900 flex items-center justify-center relative">
                  <span className="text-gray-400 font-extrabold text-sm uppercase tracking-widest">Cinema Hall Banner Picture</span>
                  <div className="absolute bottom-3 left-4 flex gap-2">
                    {t.facilities?.split(',').map((f, i) => (
                      <span key={i} className="text-[9px] font-black bg-black/60 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">{f.trim()}</span>
                    ))}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{t.theatre_name}</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1"><FiMapPin /> {t.address}</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full text-[9px] font-black uppercase">Open</span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed font-semibold">{t.description || 'Modern cinema screen equipped with premium recliners, food courts, and surround sound configurations.'}</p>
                  
                  <div className="border-t border-gray-100 pt-4 flex gap-3 text-xs font-bold text-gray-500">
                    <p className="flex items-center gap-1.5"><FiPhone /> {t.phone || '+91 99887 76655'}</p>
                    <p className="flex items-center gap-1.5"><FiMail /> {t.email || 'cinema@partner.com'}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Add Theatre Modal */}
          <Modal isOpen={isAddTheatreOpen} onClose={() => setIsAddTheatreOpen(false)} title="Register Cinema Theatre" size="md">
            <form onSubmit={handleTheatreSubmit} className="space-y-4 text-left p-4">
              <Input label="Theatre Name" value={theatreForm.theatre_name} onChange={e => setTheatreForm({...theatreForm, theatre_name: e.target.value})} required />
              <Input label="Address" value={theatreForm.address} onChange={e => setTheatreForm({...theatreForm, address: e.target.value})} required />
              
              <div className="flex flex-col">
                <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">City</label>
                <select 
                  value={theatreForm.city_id}
                  onChange={e => setTheatreForm({...theatreForm, city_id: e.target.value})}
                  className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold"
                >
                  {CITIES.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Contact Number" value={theatreForm.phone} onChange={e => setTheatreForm({...theatreForm, phone: e.target.value})} required />
                <Input label="Business Email" type="email" value={theatreForm.email} onChange={e => setTheatreForm({...theatreForm, email: e.target.value})} required />
              </div>

              <Input label="Amenities checklist (comma separated)" value={theatreForm.facilities} onChange={e => setTheatreForm({...theatreForm, facilities: e.target.value})} />
              <Input label="Description" value={theatreForm.description} onChange={e => setTheatreForm({...theatreForm, description: e.target.value})} />
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setIsAddTheatreOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-amber-400 text-gray-900 font-black rounded-2xl px-6">Submit Theatre</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* TABS 3: Screens Management & Visual Seat Builder */}
      {activeTab === 'screens' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-xs">
            <h2 className="text-lg font-black text-gray-900">Configure Screen Tiers</h2>
            <Button variant="primary" className="bg-amber-400 text-gray-900 py-2 px-4 rounded-xl flex items-center gap-1 text-xs font-black" onClick={() => setIsAddScreenOpen(true)}>
              <FiPlus /> Add Screen
            </Button>
          </div>

          {screens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {screens.map(s => {
                const activeShow = shows.find(show => show.screen_id === s.id && show.status !== 'cancelled');
                const bookedCount = bookings.filter(b => b.show_id === activeShow?.id && b.booking_status === 'confirmed').length * 2;
                const availableSeatsCount = activeShow ? Math.max(0, s.capacity - bookedCount) : s.capacity;
                const soundSystem = s.sound_system || 'Dolby Atmos Surround';
                const projectionType = s.projection_type || 'Laser IMAX Projection';

                return (
                  <Card key={s.id} className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs relative flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-black text-gray-900">{s.screen_name}</h3>
                          <p className="text-[10px] text-gray-400 font-black uppercase mt-1">Screen Type: {projectionType} • {soundSystem}</p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full text-[9px] font-black uppercase">Active</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-600 bg-gray-50 p-4 rounded-2xl">
                        <div>
                          <p className="text-gray-400 text-[9px] font-black uppercase">Total Capacity</p>
                          <p className="font-black text-gray-800 mt-0.5">{s.capacity} Seats ({s.rows || 10}R x {s.columns || 12}C)</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[9px] font-black uppercase">Available Seats</p>
                          <p className="font-black text-green-600 mt-0.5">{availableSeatsCount} Left</p>
                        </div>
                        <div className="col-span-2 border-t border-gray-200/60 pt-2.5">
                          <p className="text-gray-400 text-[9px] font-black uppercase">Current Movie & Showtime</p>
                          {activeShow ? (
                            <div>
                              <p className="font-black text-gray-950 mt-0.5">{activeShow.movie?.title}</p>
                              <p className="text-[10px] text-amber-500 font-extrabold mt-0.5">{activeShow.start_time} - {activeShow.end_time} ({activeShow.format})</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic mt-0.5">No movie scheduled currently</p>
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="flex gap-3 mt-2">
                    <Button 
                      variant="primary" 
                      className="flex-grow py-3 bg-amber-400 text-gray-900 rounded-2xl text-xs font-black"
                      onClick={async () => {
                        setSeatBuilderScreen(s);
                        setEditorRows(s.rows || 10);
                        setEditorCols(s.columns || 12);
                        try {
                          const res = await getScreenDetails(s.id);
                          const scr = res.data?.screen || res.screen || res;
                          const grid = {};
                          
                          if (scr.seats && scr.seats.length > 0) {
                            scr.seats.forEach(seat => {
                              grid[seat.seat_number] = {
                                type: seat.seat_type.toLowerCase(),
                                price: seat.price
                              };
                            });
                          }
                          
                          const maxR = scr.rows || s.rows || 10;
                          const maxC = scr.columns || s.columns || 12;
                          for (let r = 0; r < maxR; r++) {
                            const rowLetter = getRowLetter(r);
                            for (let c = 1; c <= maxC; c++) {
                              const seatNo = `${rowLetter}-${c}`;
                              if (!grid[seatNo]) {
                                grid[seatNo] = { type: 'empty', price: 0 };
                              }
                            }
                          }
                          setVisualLayout(grid);
                        } catch (err) {
                          const grid = {};
                          for (let r = 0; r < (s.rows || 10); r++) {
                            const rowLetter = getRowLetter(r);
                            for (let c = 1; c <= (s.columns || 12); c++) {
                              grid[`${rowLetter}-${c}`] = { type: 'normal', price: seatPricing.normal };
                            }
                          }
                          setVisualLayout(grid);
                        }
                      }}
                    >
                      Configure Visual Seat Layout
                    </Button>
                    
                    <Button variant="danger" size="sm" className="p-3 border border-red-100 hover:bg-red-50 text-red-500 rounded-2xl focus:outline-none">
                      <FiTrash2 size={16} />
                    </Button>
                  </div>
                </Card>
              )})}
            </div>
          ) : (
            <EmptyState title="No Screens Configured" description="Begin by adding screens to this cinema outlet hall." />
          )}

          {/* Add Screen Modal */}
          <Modal isOpen={isAddScreenOpen} onClose={() => setIsAddScreenOpen(false)} title="Add Cinema Screen" size="md">
            <form onSubmit={handleScreenSubmit} className="space-y-4 text-left p-4">
              <Input label="Screen Name (e.g. Audi 1 - Dolby Atmos)" value={screenForm.screen_name} onChange={e => setScreenForm({...screenForm, screen_name: e.target.value})} required />
              
              <div className="grid grid-cols-3 gap-4">
                <Input label="Rows Count" type="number" value={screenForm.rows_count} onChange={e => setScreenForm({...screenForm, rows_count: e.target.value})} required />
                <Input label="Columns Count" type="number" value={screenForm.cols_count} onChange={e => setScreenForm({...screenForm, cols_count: e.target.value})} required />
                <Input label="Capacity" type="number" value={screenForm.capacity} onChange={e => setScreenForm({...screenForm, capacity: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Projection System</label>
                  <select 
                    value={screenForm.projection_type}
                    onChange={e => setScreenForm({...screenForm, projection_type: e.target.value})}
                    className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                  >
                    <option value="Laser Projection">Laser Projection</option>
                    <option value="4DX System">4DX Cinema System</option>
                    <option value="IMAX Screen">IMAX 3D Screen</option>
                    <option value="2D Standard">Standard 2D</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Sound System</label>
                  <select 
                    value={screenForm.sound_system}
                    onChange={e => setScreenForm({...screenForm, sound_system: e.target.value})}
                    className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                  >
                    <option value="Dolby Atmos">Dolby Atmos Surround</option>
                    <option value="Dolby 7.1">Dolby 7.1 Setup</option>
                    <option value="IMAX Sound">IMAX Sound Engine</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setIsAddScreenOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-amber-400 text-gray-900 font-black rounded-2xl px-6">Submit Screen</Button>
              </div>
            </form>
          </Modal>

          {/* Custom Visual Seat Layout Editor Modal */}
          {seatBuilderScreen && (
            <Modal isOpen={!!seatBuilderScreen} onClose={() => setSeatBuilderScreen(null)} title={`CMS Layout Editor: ${seatBuilderScreen.screen_name}`} size="lg">
              <div 
                className="p-6 space-y-6 text-left"
                onMouseUp={() => setIsMouseDown(false)}
                onMouseLeave={() => setIsMouseDown(false)}
              >
                {/* Advanced Grid Size and Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black uppercase text-amber-400">Layout Dimensions:</span>
                    <div className="flex items-center gap-2 text-xs font-bold bg-slate-800 border border-slate-700 rounded-xl p-1.5">
                      <span>Rows: {editorRows}</span>
                      <button type="button" onClick={handleAddRow} className="p-1 hover:bg-slate-700 bg-slate-900 border border-slate-700 rounded cursor-pointer text-green-400 font-extrabold">+</button>
                      <button type="button" onClick={handleDeleteRow} className="p-1 hover:bg-slate-700 bg-slate-900 border border-slate-700 rounded cursor-pointer text-red-400 font-extrabold">-</button>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold bg-slate-800 border border-slate-700 rounded-xl p-1.5">
                      <span>Columns: {editorCols}</span>
                      <button type="button" onClick={handleAddColumn} className="p-1 hover:bg-slate-700 bg-slate-900 border border-slate-700 rounded cursor-pointer text-green-400 font-extrabold">+</button>
                      <button type="button" onClick={handleDeleteColumn} className="p-1 hover:bg-slate-700 bg-slate-900 border border-slate-700 rounded cursor-pointer text-red-400 font-extrabold">-</button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="secondary" className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs py-1.5 px-3 rounded-xl" onClick={() => setIsAudiencePreview(!isAudiencePreview)}>
                      {isAudiencePreview ? 'Show Builder Grid' : 'Preview Audience View'}
                    </Button>
                    <Button variant="danger" className="text-xs py-1.5 px-3 rounded-xl bg-red-950 border border-red-800 hover:bg-red-900 text-red-200" onClick={() => {
                      if (window.confirm('Reset layout? All seats will become available.')) {
                        const grid = {};
                        for (let r = 0; r < editorRows; r++) {
                          const rowLetter = getRowLetter(r);
                          for (let c = 1; c <= editorCols; c++) {
                            grid[`${rowLetter}-${c}`] = { type: 'normal', price: seatPricing.normal };
                          }
                        }
                        setVisualLayout(grid);
                        toast.success('Layout reset successfully!');
                      }
                    }}>
                      Reset Layout
                    </Button>
                  </div>
                </div>

                {/* Paint Brush Tool Selection */}
                {!isAudiencePreview && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">Brush Select Type (Drag to paint grid cells):</span>
                    <div className="flex flex-wrap gap-1.5 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                      {Object.keys(SEAT_COLORS).map(typeKey => (
                        <button
                          key={typeKey}
                          type="button"
                          onClick={() => setSelectedSeatType(typeKey)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border flex items-center gap-1.5 focus:outline-none cursor-pointer ${
                            selectedSeatType === typeKey ? 'ring-2 ring-amber-400 border-transparent bg-slate-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{
                            backgroundColor: typeKey === 'normal' ? '#10B981' : typeKey === 'vip' ? '#3B82F6' : typeKey === 'recliner' ? '#8B5CF6' : typeKey === 'couple' ? '#F59E0B' : typeKey === 'wheelchair' ? '#14B8A6' : typeKey === 'blocked' ? '#9CA3AF' : typeKey === 'reserved' ? '#EF4444' : '#E2E8F0'
                          }}></span>
                          {typeKey}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Pricing Configuration */}
                {!isAudiencePreview && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-bold text-gray-700 bg-gray-50/50 p-4 border border-gray-100 rounded-2xl">
                    {Object.keys(seatPricing).map(typeKey => (
                      typeKey !== 'blocked' && (
                        <div key={typeKey} className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-gray-400 mb-1">{typeKey} Price (₹)</span>
                          <input
                            type="number"
                            value={seatPricing[typeKey]}
                            onChange={e => {
                              const newPrice = parseInt(e.target.value, 10) || 0;
                              setSeatPricing(prev => ({ ...prev, [typeKey]: newPrice }));
                              // Also dynamically update active seats in visualLayout with new price
                              const updated = { ...visualLayout };
                              Object.keys(updated).forEach(k => {
                                if (updated[k]?.type === typeKey) {
                                  updated[k].price = newPrice;
                                }
                              });
                              setVisualLayout(updated);
                            }}
                            className="px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none bg-white font-black text-slate-800"
                          />
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Screen Orientation Ribbon */}
                <div className="w-full bg-slate-300 h-1.5 rounded-full relative my-8">
                  <span className="absolute left-1/2 -translate-x-1/2 -top-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] bg-white px-4">Cinema Screen Center</span>
                </div>

                {/* Interactive Dynamic Grid Scrollable Pane */}
                <div className="space-y-2 overflow-auto max-h-96 pb-4 border border-gray-200/60 p-4 rounded-3xl bg-slate-900/5 select-none">
                  {Array.from({ length: editorRows }).map((_, r) => {
                    const rowLetter = getRowLetter(r);
                    return (
                      <div key={rowLetter} className="flex justify-start items-center gap-4 min-w-max">
                        {/* Left Row Label */}
                        <span className="w-6 font-black text-xs text-slate-400 text-center">{rowLetter}</span>

                        {/* Cells Columns map */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: editorCols }).map((_, c) => {
                            const colIdx = c + 1;
                            const key = `${rowLetter}-${colIdx}`;
                            const seatObj = visualLayout[key] || { type: 'normal', price: seatPricing.normal };
                            const cellType = seatObj.type || 'normal';

                            let classes = SEAT_COLORS[cellType];
                            if (isAudiencePreview) {
                              classes = cellType === 'empty' 
                                ? 'bg-transparent text-transparent border-transparent pointer-events-none opacity-0' 
                                : cellType === 'blocked' 
                                  ? 'bg-transparent text-transparent border-transparent opacity-10 pointer-events-none'
                                  : 'bg-green-500 text-white border-green-600';
                            }

                            return (
                              <button
                                key={colIdx}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  if (isAudiencePreview) return;
                                  setIsMouseDown(true);
                                  paintCell(r, colIdx);
                                }}
                                onMouseEnter={() => {
                                  if (isAudiencePreview) return;
                                  if (isMouseDown) paintCell(r, colIdx);
                                }}
                                onMouseUp={() => setIsMouseDown(false)}
                                className={`w-8 h-8 rounded-lg text-[9px] font-black flex items-center justify-center transition-all focus:outline-none border shadow-2xs ${classes}`}
                                title={`${rowLetter}-${colIdx} (${cellType}) - ₹${seatObj.price || 0}`}
                              >
                                {cellType === 'empty' ? '' : colIdx}
                              </button>
                            );
                          })}
                        </div>

                        {/* Duplication & Shift controls for the Row */}
                        {!isAudiencePreview && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(r)}
                              className="px-2 py-1 bg-gray-100 hover:bg-amber-100 text-[8px] font-black rounded-lg transition-colors border border-gray-200 text-gray-500 focus:outline-none cursor-pointer"
                              title="Duplicate row layout to below"
                            >
                              Copy 下
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertRowAbove(r)}
                              className="px-2 py-1 bg-gray-100 hover:bg-blue-100 text-[8px] font-black rounded-lg transition-colors border border-gray-200 text-gray-500 focus:outline-none cursor-pointer"
                              title="Insert new row above"
                            >
                              + 上
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertRowBelow(r)}
                              className="px-2 py-1 bg-gray-100 hover:bg-blue-100 text-[8px] font-black rounded-lg transition-colors border border-gray-200 text-gray-500 focus:outline-none cursor-pointer"
                              title="Insert new row below"
                            >
                              + 下
                            </button>
                            <button
                              type="button"
                              onClick={() => copyRowLayout(r)}
                              className="px-2 py-1 bg-gray-100 hover:bg-purple-100 text-[8px] font-black rounded-lg border border-gray-200 text-gray-500 focus:outline-none cursor-pointer"
                              title="Copy Row Layout"
                            >
                              Copy
                            </button>
                            <button
                              type="button"
                              onClick={() => pasteRowLayout(r)}
                              className="px-2 py-1 bg-gray-100 hover:bg-purple-100 text-[8px] font-black rounded-lg border border-gray-200 text-gray-500 focus:outline-none cursor-pointer"
                              title="Paste Row Layout"
                            >
                              Paste
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Auto Calculated Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center bg-slate-50 p-4 border border-gray-100 rounded-3xl">
                  <div>
                    <h5 className="text-[9px] uppercase font-black text-gray-400">Total Seats</h5>
                    <p className="text-base font-black text-slate-800">{stats.total}</p>
                  </div>
                  <div>
                    <h5 className="text-[9px] uppercase font-black text-gray-400 text-blue-500">VIP Seats</h5>
                    <p className="text-base font-black text-blue-600">{stats.vip}</p>
                  </div>
                  <div>
                    <h5 className="text-[9px] uppercase font-black text-gray-400 text-purple-500">Recliners</h5>
                    <p className="text-base font-black text-purple-600">{stats.recliner}</p>
                  </div>
                  <div>
                    <h5 className="text-[9px] uppercase font-black text-gray-400 text-amber-500">Couples</h5>
                    <p className="text-base font-black text-amber-600">{stats.couple}</p>
                  </div>
                  <div>
                    <h5 className="text-[9px] uppercase font-black text-gray-400 text-teal-500">Wheelchairs</h5>
                    <p className="text-base font-black text-teal-600">{stats.wheelchair}</p>
                  </div>
                  <div>
                    <h5 className="text-[9px] uppercase font-black text-gray-400 text-green-500">Available Cap</h5>
                    <p className="text-base font-black text-green-600">{stats.capacity}</p>
                  </div>
                </div>

                {/* Save/Cancel Controls */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <Button variant="secondary" onClick={() => setSeatBuilderScreen(null)}>Cancel</Button>
                  <Button 
                    variant="primary" 
                    className="bg-amber-400 text-gray-900 font-black rounded-2xl px-6 py-2.5 cursor-pointer"
                    onClick={async () => {
                      const customSeatsList = [];
                      Object.keys(visualLayout).forEach(key => {
                        const seat = visualLayout[key];
                        if (seat && seat.type !== 'empty') {
                          customSeatsList.push({
                            seat_number: key,
                            seat_type: seat.type.toUpperCase(),
                            price: seat.price
                          });
                        }
                      });
                      try {
                        await updateScreen(seatBuilderScreen.id, {
                          custom_seats: customSeatsList
                        });
                        toast.success('Cinema screen seat layout updated and saved!');
                        setSeatBuilderScreen(null);
                        loadDashboardData();
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Failed to update seat layout.');
                      }
                    }}
                  >
                    Save Seating Layout
                  </Button>
                </div>

              </div>
            </Modal>
          )}

        </div>
      )}

      {/* TABS 4: Movies Management */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-xs">
            <h2 className="text-lg font-black text-gray-900">Movies Database</h2>
            <Button variant="primary" className="bg-amber-400 text-gray-900 py-2 px-4 rounded-xl flex items-center gap-1 text-xs font-black" onClick={() => {
              setEditingMovie(null);
              setMovieForm({
                title: '', description: '', poster: '', banner: '', language: 'English',
                genre: 'Action, Thriller', duration: '120', age_rating: 'UA', release_date: '',
                status: 'now_showing', trailer_url: ''
              });
              setIsMovieModalOpen(true);
            }}>
              <FiPlus /> Add Movie
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map(m => {
              const showCount = shows.filter(s => s.movie_id === m.id).length;
              const movieBookings = bookings.filter(b => b.show?.movie?.title === m.title);
              const ticketCount = movieBookings.filter(b => b.booking_status === 'confirmed').length * 2;
              const revenue = movieBookings.filter(b => b.booking_status === 'confirmed').reduce((acc, b) => acc + (b.total_amount || 0), 0);
              const parsed = parseDescription(m.description);

              return (
                <Card key={m.id} className="border border-gray-200 bg-white rounded-3xl overflow-hidden shadow-xs relative flex flex-col justify-between">
                  <div>
                    <div className="h-64 bg-slate-900 overflow-hidden relative group">
                      {m.poster ? (
                        <img src={m.poster} alt={m.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-extrabold uppercase tracking-wider text-xs">No Poster Image</div>
                      )}
                      
                      {/* Banner Backdrop overlay representation */}
                      {m.banner && (
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-left">
                          <p className="text-[9px] uppercase font-black text-amber-400">Backdrop Banner</p>
                          <img src={m.banner} alt="Backdrop" className="w-full h-16 object-cover rounded-lg border border-white/20 mt-1" />
                        </div>
                      )}

                      <span className="absolute top-3 right-3 bg-amber-400 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        {m.age_rating || 'UA'}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-black text-base text-gray-900 leading-snug line-clamp-1">{m.title}</h3>
                      <p className="text-[10px] text-amber-500 font-black uppercase tracking-wider">{m.genre}</p>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-gray-600 bg-gray-50 py-2.5 px-1.5 rounded-xl border border-gray-100/50">
                        <div>
                          <p className="text-gray-400 text-[8px] uppercase">Shows</p>
                          <p className="font-black text-slate-800">{showCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[8px] uppercase">Tickets</p>
                          <p className="font-black text-slate-800">{ticketCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[8px] uppercase">Revenue</p>
                          <p className="font-black text-green-600">₹{revenue}</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 font-semibold">{m.language} • {m.duration} Mins</p>
                      <p className="text-xs text-gray-600 font-semibold line-clamp-2 mt-2">{parsed.text || 'No description provided.'}</p>
                    </div>
                  </div>

                  <div className="p-5 border-t border-gray-50 flex flex-wrap gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-grow py-2 rounded-xl text-xs font-bold border border-gray-200 flex items-center justify-center gap-1"
                      onClick={() => {
                        const parsedDesc = parseDescription(m.description);
                        setEditingMovie(m);
                        setMovieForm({
                          title: m.title || '',
                          description: parsedDesc.text || '',
                          poster: m.poster || '',
                          banner: m.banner || '',
                          language: m.language || 'English',
                          genre: m.genre || '',
                          duration: m.duration ? String(m.duration) : '120',
                          age_rating: m.age_rating || 'UA',
                          release_date: m.release_date || '',
                          status: m.status || 'now_showing',
                          trailer_url: m.trailer_url || '',
                          thumbnail: parsedDesc.thumbnail || '',
                          gallery: parsedDesc.gallery || []
                        });
                        setIsMovieModalOpen(true);
                      }}
                    >
                      <FiEdit size={12} /> Edit
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="px-2 border border-gray-200 hover:bg-slate-50 text-slate-600 rounded-xl"
                      title="Duplicate Listing"
                      onClick={async () => {
                        try {
                          const parsedDesc = parseDescription(m.description);
                          await createMovie({
                            title: `${m.title} (Copy)`,
                            description: JSON.stringify(parsedDesc),
                            poster: m.poster,
                            banner: m.banner,
                            language: m.language,
                            genre: m.genre,
                            duration: m.duration,
                            age_rating: m.age_rating,
                            release_date: m.release_date,
                            status: m.status,
                            trailer_url: m.trailer_url
                          });
                          toast.success('Movie listed duplicated!');
                          loadDashboardData();
                        } catch (err) {
                          toast.error('Failed to duplicate movie listing');
                        }
                      }}
                    >
                      Copy
                    </Button>

                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="px-2 border border-yellow-200 hover:bg-yellow-50 text-yellow-600 rounded-xl"
                      title="Archive Movie"
                      onClick={async () => {
                        try {
                          await updateMovie(m.id, { ...m, status: 'ended' });
                          toast.success('Movie listing archived!');
                          loadDashboardData();
                        } catch (err) {
                          toast.error('Failed to archive movie');
                        }
                      }}
                    >
                      Archive
                    </Button>

                    <Button variant="danger" size="sm" className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl focus:outline-none" onClick={async () => {
                      if (window.confirm('Delete this movie listing?')) {
                        try {
                          await deleteMovie(m.id);
                          toast.success('Movie deleted');
                          loadDashboardData();
                        } catch (err) {
                          toast.error('Failed to delete movie');
                        }
                      }
                    }}>
                      <FiTrash2 size={14} />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Add/Edit Movie Modal */}
          <Modal isOpen={isMovieModalOpen} onClose={() => setIsMovieModalOpen(false)} title={editingMovie ? 'Edit Movie Details' : 'Add Movie to Database'} size="lg">
            <form onSubmit={handleMovieSubmit} className="space-y-4 text-left p-6 max-h-[80vh] overflow-y-auto">
              <Input label="Movie Title" value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
              <Input label="Genre (comma separated)" value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Language" value={movieForm.language} onChange={e => setMovieForm({...movieForm, language: e.target.value})} required />
                <Input label="Duration (minutes)" type="number" value={movieForm.duration} onChange={e => setMovieForm({...movieForm, duration: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Age Rating</label>
                  <select 
                    value={movieForm.age_rating}
                    onChange={e => setMovieForm({...movieForm, age_rating: e.target.value})}
                    className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA">UA (Parental Guidance)</option>
                    <option value="A">A (Adults Only)</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Status</label>
                  <select 
                    value={movieForm.status}
                    onChange={e => setMovieForm({...movieForm, status: e.target.value})}
                    className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>

              <Input label="Release Date (YYYY-MM-DD)" type="date" value={movieForm.release_date} onChange={e => setMovieForm({...movieForm, release_date: e.target.value})} />
              <Input label="Trailer YouTube URL" value={movieForm.trailer_url} onChange={e => setMovieForm({...movieForm, trailer_url: e.target.value})} />

              {/* Image Upload Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageUploadField 
                  label="Movie Poster File" 
                  value={movieForm.poster} 
                  onChange={url => setMovieForm({ ...movieForm, poster: url })} 
                  type="poster" 
                />
                <ImageUploadField 
                  label="Movie Banner File" 
                  value={movieForm.banner} 
                  onChange={url => setMovieForm({ ...movieForm, banner: url })} 
                  type="banner" 
                />
                <ImageUploadField 
                  label="Thumbnail File" 
                  value={movieForm.thumbnail} 
                  onChange={url => setMovieForm({ ...movieForm, thumbnail: url })} 
                  type="thumbnail" 
                />
              </div>

              <GalleryUploader 
                label="Movie Backdrop/Gallery Showcase Files" 
                value={movieForm.gallery} 
                onChange={urls => setMovieForm({ ...movieForm, gallery: urls })} 
              />

              <Input label="Description" value={movieForm.description} onChange={e => setMovieForm({...movieForm, description: e.target.value})} />
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setIsMovieModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-amber-400 text-gray-900 font-black rounded-2xl px-6">Submit Movie</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* TABS 5: Showtimes Management Scheduler */}
      {activeTab === 'shows' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-xs">
            <h2 className="text-lg font-black text-gray-900">Show Scheduler Timeline</h2>
            <Button variant="primary" className="bg-amber-400 text-gray-900 py-2 px-4 rounded-xl flex items-center gap-1 text-xs font-black" onClick={() => {
              if (movies.length === 0 || screens.length === 0) {
                return toast.error('List movies and screens before scheduling showtimes!');
              }
              setShowForm({
                movie_id: movies[0]?.id || '',
                screen_id: screens[0]?.id || '',
                show_date: '',
                start_time: '',
                end_time: '',
                language: 'English',
                format: '2D',
                price: '200',
                cleaning_time: '15',
                interval_time: '15'
              });
              setIsAddShowOpen(true);
            }}>
              <FiPlus /> Schedule Show
            </Button>
          </div>

          {shows.length > 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
              <h3 className="text-base font-black text-gray-900 mb-6 uppercase tracking-wider">Scheduled Screen Timelines</h3>
              <div className="space-y-6">
                {screens.map(screen => {
                  const screenShows = shows.filter(s => s.screen_id === screen.id);
                  return (
                    <div key={screen.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 flex flex-col md:flex-row md:items-center gap-4 text-left">
                      <div className="w-48 flex-shrink-0">
                        <h4 className="font-black text-sm text-gray-900 leading-snug">{screen.screen_name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Laser IMAX Projection</p>
                      </div>

                      {/* Timeline Slots */}
                      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {screenShows.length > 0 ? (
                          screenShows.map(show => {
                            const showBookings = bookings.filter(b => b.show_id === show.id);
                            const confirmedBookingsCount = showBookings.filter(b => b.booking_status === 'confirmed').length;
                            const ticketSold = confirmedBookingsCount * 2;
                            const seatsLeft = Math.max(0, screen.capacity - ticketSold);
                            const posterImg = show.movie?.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=150';
                            const showStatus = show.status || 'Active';

                            return (
                              <div key={show.id} className="p-4 border border-gray-200 bg-white hover:border-amber-300 rounded-3xl flex gap-3 shadow-2xs transition-all relative group text-left">
                                <img src={posterImg} alt={show.movie?.title} className="w-14 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0 bg-slate-950" />
                                <div className="flex-grow space-y-1">
                                  <h5 className="font-black text-xs text-gray-900 leading-snug line-clamp-1">{show.movie?.title}</h5>
                                  <p className="text-[9px] text-amber-500 font-extrabold uppercase tracking-wider">{show.format} • {show.language}</p>
                                  <p className="text-xs text-slate-800 font-black">{show.start_time} - {show.end_time}</p>
                                  
                                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[9px] font-bold text-gray-500 border-t border-gray-100 mt-1">
                                    <div>
                                      <span className="text-gray-400">Price:</span> <span className="font-extrabold text-slate-800">₹{show.price}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Bookings:</span> <span className="font-extrabold text-slate-800">{showBookings.length}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Left:</span> <span className="font-extrabold text-green-600">{seatsLeft} seats</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Status:</span> <span className="font-extrabold text-blue-600 uppercase">{showStatus}</span>
                                    </div>
                                  </div>

                                  <div className="flex gap-3 pt-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingShow(show);
                                        setShowForm({
                                          movie_id: show.movie_id,
                                          screen_id: show.screen_id,
                                          show_date: show.show_date,
                                          start_time: show.start_time,
                                          end_time: show.end_time,
                                          language: show.language || 'English',
                                          format: show.format || '2D',
                                          price: String(show.price || '200'),
                                          cleaning_time: String(show.cleaning_time || '15'),
                                          interval_time: String(show.interval_time || '15')
                                        });
                                        setIsEditShowOpen(true);
                                      }}
                                      className="text-[9px] font-black text-blue-500 hover:text-blue-600 focus:outline-none cursor-pointer"
                                    >
                                      Edit Details
                                    </button>

                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm('Delete this showtime slot?')) {
                                          try {
                                            await deleteShow(show.id);
                                            toast.success('Show deleted');
                                            loadScreensAndShows();
                                          } catch (err) {
                                            toast.error('Failed to delete show');
                                          }
                                        }
                                      }}
                                      className="text-[9px] font-black text-red-500 hover:text-red-600 focus:outline-none cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-xs text-gray-400 italic">No show scheduled for this screen.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState title="No Showtimes Scheduled" description="Configure movie screenings using the schedule show wizard." />
          )}

          {/* Add Show Modal */}
          <Modal isOpen={isAddShowOpen} onClose={() => setIsAddShowOpen(false)} title="Schedule Show" size="md">
            <form onSubmit={handleShowSubmit} className="space-y-4 text-left p-4">
              <div className="flex flex-col">
                <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Select Movie</label>
                <select 
                  value={showForm.movie_id}
                  onChange={e => setShowForm({...showForm, movie_id: e.target.value})}
                  className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold"
                  required
                >
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Select Target Screen</label>
                <select 
                  value={showForm.screen_id}
                  onChange={e => setShowForm({...showForm, screen_id: e.target.value})}
                  className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold"
                  required
                >
                  {screens.map(s => <option key={s.id} value={s.id}>{s.screen_name}</option>)}
                </select>
              </div>

              <Input label="Show Date" type="date" value={showForm.show_date} onChange={e => setShowForm({...showForm, show_date: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time (HH:MM)" type="time" value={showForm.start_time} onChange={e => setShowForm({...showForm, start_time: e.target.value})} required />
                <Input label="End Time (HH:MM)" type="time" value={showForm.end_time} onChange={e => setShowForm({...showForm, end_time: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <Input label="Interval Gap (mins)" type="number" value={showForm.interval_time} onChange={e => setShowForm({...showForm, interval_time: e.target.value})} />
                <Input label="Cleaning Gap (mins)" type="number" value={showForm.cleaning_time} onChange={e => setShowForm({...showForm, cleaning_time: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Language Mode</label>
                  <select 
                    value={showForm.language}
                    onChange={e => setShowForm({...showForm, language: e.target.value})}
                    className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Display Format</label>
                  <select 
                    value={showForm.format}
                    onChange={e => setShowForm({...showForm, format: e.target.value})}
                    className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                  >
                    <option value="2D">Standard 2D</option>
                    <option value="3D">Standard 3D</option>
                    <option value="IMAX 2D">IMAX 2D</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                  </select>
                </div>
              </div>

              <Input label="Base Ticket Price (₹)" type="number" value={showForm.price} onChange={e => setShowForm({...showForm, price: e.target.value})} required />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setIsAddShowOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-amber-400 text-gray-900 font-black rounded-2xl px-6">Schedule Showtime</Button>
              </div>
            </form>
          </Modal>

          {/* Edit Show Modal */}
          <Modal isOpen={isEditShowOpen} onClose={() => setIsEditShowOpen(false)} title="Edit Scheduled Show" size="md">
            <form onSubmit={handleShowSubmit} className="space-y-4 text-left p-4">
              <div className="flex flex-col">
                <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Select Movie</label>
                <select 
                  value={showForm.movie_id}
                  onChange={e => setShowForm({...showForm, movie_id: e.target.value})}
                  className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold"
                  required
                >
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Select Target Screen</label>
                <select 
                  value={showForm.screen_id}
                  onChange={e => setShowForm({...showForm, screen_id: e.target.value})}
                  className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white text-sm font-semibold"
                  required
                >
                  {screens.map(s => <option key={s.id} value={s.id}>{s.screen_name}</option>)}
                </select>
              </div>

              <Input label="Show Date" type="date" value={showForm.show_date} onChange={e => setShowForm({...showForm, show_date: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time (HH:MM)" type="time" value={showForm.start_time} onChange={e => setShowForm({...showForm, start_time: e.target.value})} required />
                <Input label="End Time (HH:MM)" type="time" value={showForm.end_time} onChange={e => setShowForm({...showForm, end_time: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Language Mode</label>
                  <select 
                    value={showForm.language}
                    onChange={e => setShowForm({...showForm, language: e.target.value})}
                    className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Display Format</label>
                  <select 
                    value={showForm.format}
                    onChange={e => setShowForm({...showForm, format: e.target.value})}
                    className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                  >
                    <option value="2D">Standard 2D</option>
                    <option value="3D">Standard 3D</option>
                    <option value="IMAX 2D">IMAX 2D</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="4DX">4DX Motion</option>
                  </select>
                </div>
              </div>

              <Input label="Base Ticket Price (₹)" type="number" value={showForm.price} onChange={e => setShowForm({...showForm, price: e.target.value})} required />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setIsEditShowOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-amber-400 text-gray-900 font-black rounded-2xl px-6">Save Changes</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* TABS 6: Bookings & Check-in Ticket scans */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Quick checkin terminal */}
            <Card className="p-6 md:col-span-1 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-gray-900">Check-in Terminal</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Ticket scanner & confirmation</p>
              </div>

              <div className="space-y-4 pt-2">
                <Input 
                  label="Enter Booking code (e.g. BK-998811)" 
                  value={checkinCode} 
                  onChange={e => setCheckinCode(e.target.value)} 
                  placeholder="BK-XXXXXX"
                />
                
                <div className="flex gap-2">
                  <Button 
                    variant="primary" 
                    className="flex-grow py-3 bg-amber-400 text-gray-900 text-xs font-black rounded-2xl"
                    onClick={handleManualCheckIn}
                  >
                    Scan / Check-in
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="p-3 border border-gray-200 rounded-2xl flex items-center justify-center"
                    title="Manual checkin reprint"
                    onClick={() => {
                      if (!checkinCode) return toast.error('Enter a code first!');
                      toast.success(`Reprint ticket receipt command sent for: ${checkinCode}!`);
                    }}
                  >
                    <FiPrinter size={16} />
                  </Button>
                </div>
              </div>
            </Card>

            {/* List and searches */}
            <Card className="p-6 md:col-span-2 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-base text-gray-900 uppercase tracking-wider">Bookings List Database</h3>
                
                <div className="relative max-w-xs">
                  <input
                    type="text"
                    placeholder="Search Booking code..."
                    value={searchBookingQuery}
                    onChange={e => setSearchBookingQuery(e.target.value)}
                    className="text-xs font-semibold px-4 py-2 border border-gray-200 rounded-xl focus:outline-none w-48"
                  />
                </div>
              </div>

              <Table
                headers={['Booking Ref', 'Customer', 'Movie / Format', 'Price Paid', 'Status', 'Actions']}
                data={bookings.filter(b => b.booking_number?.toLowerCase().includes(searchBookingQuery.toLowerCase()))}
                renderRow={(b, idx) => (
                  <tr key={b.id || idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-xs font-black text-slate-800">{b.booking_number}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-semibold">{b.user?.full_name || 'Guest User'}</td>
                    <td className="px-6 py-4 text-xs text-gray-800 font-black">
                      {b.show?.movie?.title || 'Spider-Man'} ({b.show?.format || '2D'})
                    </td>
                    <td className="px-6 py-4 text-xs text-green-600 font-black">₹{b.total_amount}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        b.booking_status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                        b.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>{b.booking_status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex gap-2">
                        <button onClick={() => {
                          toast.success(`Ticket confirmation email resent to customer for: ${b.booking_number}`);
                        }} className="text-[10px] text-amber-500 font-extrabold hover:underline">Resend Notify</button>
                        {b.booking_status === 'confirmed' && (
                          <button onClick={() => {
                            if (window.confirm('Cancel and initiate refund?')) {
                              setBookings(bookings.map(item => item.id === b.id ? { ...item, booking_status: 'cancelled' } : item));
                              toast.success('Ticket cancelled and refund initiated.');
                            }
                          }} className="text-[10px] text-red-500 font-extrabold hover:underline">Cancel/Refund</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              />
            </Card>
          </div>
        </div>
      )}

      {/* TABS 7: Food & Beverage Inventory Menu */}
      {activeTab === 'food-beverage' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-xs">
            <h2 className="text-lg font-black text-gray-900">Food & Beverages Inventory</h2>
            <Button variant="primary" className="bg-amber-400 text-gray-900 py-2 px-4 rounded-xl flex items-center gap-1 text-xs font-black" onClick={() => setIsAddFnBOpen(true)}>
              <FiPlus /> Register F&B Combo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fnBItems.map(item => (
              <Card key={item.id} className="p-5 border border-gray-200 bg-white rounded-3xl shadow-xs relative flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">{item.category}</span>
                      <h3 className="text-base font-black text-gray-900 mt-2">{item.name}</h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${
                      item.stock > 20 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.stock > 0 ? `${item.stock} in Stock` : 'Out of Stock'}
                    </span>
                  </div>

                  <p className="text-lg font-black text-gray-900">₹{item.price}</p>
                </div>

                <div className="flex gap-2 border-t border-gray-50 mt-4 pt-3 text-xs font-bold text-gray-500">
                  <button 
                    onClick={() => {
                      setFnBItems(fnBItems.map(f => f.id === item.id ? { ...f, stock: f.stock + 10 } : f));
                      toast.success('Stock added successfully!');
                    }}
                    className="flex-grow py-2 text-center border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none"
                  >
                    Refill 10 Items
                  </button>
                  
                  <button 
                    onClick={() => {
                      setFnBItems(fnBItems.filter(f => f.id !== item.id));
                      toast.success('F&B Item removed');
                    }}
                    className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl focus:outline-none"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Add F&B Modal */}
          <Modal isOpen={isAddFnBOpen} onClose={() => setIsAddFnBOpen(false)} title="Register F&B Item" size="md">
            <form onSubmit={handleAddFnb} className="space-y-4 text-left p-4">
              <Input label="Item Name" value={fnbForm.name} onChange={e => setFnbForm({ ...fnbForm, name: e.target.value })} required />
              
              <div className="flex flex-col">
                <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Category</label>
                <select
                  value={fnbForm.category}
                  onChange={e => setFnbForm({ ...fnbForm, category: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                >
                  <option value="Popcorn">Popcorn</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Combos">Combos & Bundles</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (INR)" type="number" value={fnbForm.price} onChange={e => setFnbForm({ ...fnbForm, price: e.target.value })} required />
                <Input label="Initial Stock" type="number" value={fnbForm.stock} onChange={e => setFnbForm({ ...fnbForm, stock: e.target.value })} required />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setIsAddFnBOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-amber-400 text-gray-900 font-black rounded-2xl px-6">Add F&B Combo</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* TABS 8: Staff/Employee Management */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-xs">
            <h2 className="text-lg font-black text-gray-900">Manage Staff / Employees</h2>
            <Button variant="primary" className="bg-amber-400 text-gray-900 py-2 px-4 rounded-xl flex items-center gap-1 text-xs font-black" onClick={() => setIsAddStaffOpen(true)}>
              <FiPlus /> Add Staff Member
            </Button>
          </div>

          <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs">
            <Table
              headers={['Staff Member', 'Role', 'Credentials', 'Toggled Permissions', 'Actions']}
              data={employees}
              renderRow={(emp, idx) => (
                <tr key={emp.id || idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center font-black text-xs uppercase">{emp.name.slice(0,2)}</div>
                      <div>
                        <h4 className="font-black text-sm text-gray-900">{emp.name}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold">{emp.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-black rounded-md uppercase">{emp.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 font-semibold">{emp.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {emp.permissions.map((p, i) => (
                        <span key={i} className="text-[9px] font-bold bg-amber-50 border border-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setEmployees(employees.filter(e => e.id !== emp.id));
                        toast.success('Staff credentials deleted');
                      }}
                      className="text-xs text-red-500 hover:underline font-black cursor-pointer focus:outline-none"
                    >
                      Remove Staff
                    </button>
                  </td>
                </tr>
              )}
            />
          </Card>

          {/* Add Staff Modal */}
          <Modal isOpen={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)} title="Add Staff Employee" size="md">
            <form onSubmit={handleAddStaff} className="space-y-4 text-left p-4">
              <Input label="Full Name" value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} required />
              <Input label="Email address" type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} required />
              <Input label="Contact Mobile" value={staffForm.phone} onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} required />
              
              <div className="flex flex-col">
                <label className="text-xs font-extrabold text-gray-500 uppercase mb-2">Staff Role</label>
                <select
                  value={staffForm.role}
                  onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none"
                >
                  <option value="Manager">Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Ticket Checker">Ticket Checker</option>
                  <option value="Operator">Projection Operator</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="bg-amber-400 text-gray-900 font-black rounded-2xl px-6">Submit Employee</Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* TABS 9: Promotions & Pricing Tiers */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pricing Markup Rules */}
            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-6">
              <div>
                <h3 className="font-black text-base text-gray-900">Pricing Rules Engine</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Configure weekend & holiday pricing markups</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Weekend Markup (x)</span>
                  <input
                    type="number" step="0.05"
                    value={pricingRules.weekendMultiplier}
                    onChange={e => {
                      setPricingRules({ ...pricingRules, weekendMultiplier: parseFloat(e.target.value) });
                      toast.success('Weekend pricing updated!');
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Holiday Multiplier (x)</span>
                  <input
                    type="number" step="0.05"
                    value={pricingRules.holidayMultiplier}
                    onChange={e => {
                      setPricingRules({ ...pricingRules, holidayMultiplier: parseFloat(e.target.value) });
                      toast.success('Holiday pricing updated!');
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Morning Discount (₹)</span>
                  <input
                    type="number"
                    value={pricingRules.morningDiscount}
                    onChange={e => {
                      setPricingRules({ ...pricingRules, morningDiscount: parseInt(e.target.value, 10) });
                      toast.success('Morning discount updated!');
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Night Show Markup (₹)</span>
                  <input
                    type="number"
                    value={pricingRules.nightMarkup}
                    onChange={e => {
                      setPricingRules({ ...pricingRules, nightMarkup: parseInt(e.target.value, 10) });
                      toast.success('Night show pricing updated!');
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </Card>

            {/* Campaign Manager */}
            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-gray-900">Campaign Manager</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Manage bank deals, credit card discount promos</p>
              </div>

              <div className="space-y-3 pt-2">
                {campaigns.map(c => (
                  <div key={c.id} className="p-4 border border-gray-200 bg-gray-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-xs text-gray-900 leading-snug">{c.name}</h4>
                      <p className="text-[9px] text-amber-500 font-black uppercase mt-1">{c.type} • {c.discount}</p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setCampaigns(campaigns.map(item => item.id === c.id ? { ...item, active: !item.active } : item));
                        toast.success(`Campaign ${c.name} toggled!`);
                      }}
                      className={`px-3 py-1 text-[9px] font-black uppercase rounded-full cursor-pointer ${
                        c.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {c.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TABS 10: Reports & Revenue Export */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-xs">
            <h2 className="text-lg font-black text-gray-900">Audit Reports & Financial Spreadsheets</h2>
            
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="py-2 px-4 rounded-xl text-xs font-bold border border-gray-200"
                onClick={() => toast.success('Spreadsheet data compiled. Downloading Excel sheet!')}
              >
                Download Excel Report
              </Button>
              <Button 
                variant="primary" 
                className="bg-amber-400 text-gray-900 py-2 px-4 rounded-xl text-xs font-black"
                onClick={() => toast.success('Audits PDF compiled. Downloading document!')}
              >
                Download PDF Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Occupancy Heatmap Area */}
            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-gray-900">Daily Occupancy Heatmaps</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Showtimes occupancy performance chart</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip />
                    <Area type="monotone" dataKey="occupancy" stroke="#10B981" fill="#D1FAE5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Occupancy by Screen PIE */}
            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-gray-900">Revenue Breakdown by Screen Tiers</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Summary of screen performance</p>
              </div>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={screenRevenueData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                      {screenRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TABS 11: Audit Logs Actions Tracker */}
      {activeTab === 'audit-logs' && (
        <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
          <div>
            <h3 className="font-black text-base text-gray-900">Audit Logs (Partner CMS Action History)</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Track every change log and employee checkin</p>
          </div>

          <Table
            headers={['Event / Action', 'Details', 'Operator Name', 'Timestamp']}
            data={auditLogs}
            renderRow={(log, idx) => (
              <tr key={log.id || idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <span className="font-black text-xs text-slate-800 uppercase bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">{log.action}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-gray-600">{log.details || 'F&B Refilled / Show scheduled'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-gray-800">{log.user}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-gray-400 font-semibold">{log.timestamp}</span>
                </td>
              </tr>
            )}
          />
        </Card>
      )}

      {/* TABS 12: Customer Reviews & Ratings */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-black text-base text-gray-900">Reviews & Ratings Database</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Moderate customer feedback and review visibility</p>
              </div>

              {/* Filtering and Search Controls */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={reviewSearchQuery}
                  onChange={e => setReviewSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none text-xs font-semibold w-full md:w-48 bg-gray-50/50"
                />

                <select
                  value={reviewRatingFilter}
                  onChange={e => setReviewRatingFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs font-semibold focus:outline-none"
                >
                  <option value="all">⭐ All Ratings</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars Only</option>
                  <option value="4plus">⭐⭐⭐⭐ 4+ Stars</option>
                  <option value="3minus">⭐⭐ 3 Stars or less</option>
                </select>

                <select
                  value={reviewSortOrder}
                  onChange={e => setReviewSortOrder(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-xs font-semibold focus:outline-none"
                >
                  <option value="newest">📅 Newest First</option>
                  <option value="oldest">📅 Oldest First</option>
                  <option value="positive">📈 Positive First</option>
                  <option value="negative">📉 Negative First</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {(() => {
                const filteredAndSortedReviews = reviews
                  .filter(rev => {
                    const query = reviewSearchQuery.toLowerCase();
                    const nameMatch = rev.customerName.toLowerCase().includes(query);
                    const movieMatch = rev.movieName.toLowerCase().includes(query);
                    const textMatch = rev.reviewText.toLowerCase().includes(query);
                    if (!nameMatch && !movieMatch && !textMatch) return false;

                    if (reviewRatingFilter === '5') return rev.rating === 5;
                    if (reviewRatingFilter === '4plus') return rev.rating >= 4;
                    if (reviewRatingFilter === '3minus') return rev.rating <= 3;
                    return true;
                  })
                  .sort((a, b) => {
                    // Pinned reviews float to the top
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;

                    if (reviewSortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
                    if (reviewSortOrder === 'positive') return b.rating - a.rating;
                    if (reviewSortOrder === 'negative') return a.rating - b.rating;
                    return new Date(b.date) - new Date(a.date); // newest
                  });

                if (filteredAndSortedReviews.length === 0) {
                  return <p className="text-xs text-gray-400 italic py-6 text-center">No reviews found matching active filters.</p>;
                }

                return filteredAndSortedReviews.map(rev => {
                  const initials = rev.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
                  return (
                    <div 
                      key={rev.id} 
                      className={`p-5 border rounded-3xl space-y-3 relative transition-all ${
                        rev.pinned 
                          ? 'bg-amber-50/30 border-amber-300 ring-1 ring-amber-100' 
                          : rev.hidden 
                            ? 'bg-red-50/20 border-red-200' 
                            : 'bg-gray-50/50 border-gray-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-sm text-gray-900">{rev.customerName}</h4>
                              {rev.pinned && <span className="text-[8px] bg-amber-400 text-gray-900 px-1.5 py-0.5 rounded font-black uppercase">Pinned</span>}
                              {rev.abuse && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black uppercase">Reported</span>}
                            </div>
                            <p className="text-[10px] text-amber-500 font-extrabold uppercase mt-0.5">Movie: {rev.movieName}</p>
                          </div>
                        </div>

                        {/* Top action row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setReviews(reviews.map(r => r.id === rev.id ? { ...r, pinned: !r.pinned } : r));
                              toast.success(rev.pinned ? 'Review unpinned' : 'Review pinned to top');
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase cursor-pointer border ${
                              rev.pinned ? 'bg-amber-400 text-gray-900 border-transparent' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                            }`}
                          >
                            {rev.pinned ? 'Unpin' : 'Pin Review'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReviews(reviews.map(r => r.id === rev.id ? { ...r, hidden: !r.hidden } : r));
                              toast.success(rev.hidden ? 'Review public visibility restored' : 'Abusive review hidden from public');
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase cursor-pointer border ${
                              rev.hidden ? 'bg-red-600 text-white border-transparent' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                            }`}
                          >
                            {rev.hidden ? 'Show Review' : 'Hide Review'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReviews(reviews.map(r => r.id === rev.id ? { ...r, abuse: !r.abuse } : r));
                              toast.success(rev.abuse ? 'Abuse report cleared' : 'Abuse reported successfully');
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase cursor-pointer border ${
                              rev.abuse ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                            }`}
                          >
                            Report Abuse
                          </button>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} size={13} fill={i < rev.rating ? '#FBBF24' : 'transparent'} className="text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">{rev.date}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] text-gray-400 font-bold">Helpful count: {rev.helpfulCount || 0}</span>
                      </div>

                      <p className="text-xs text-gray-700 font-semibold leading-relaxed pl-1">{rev.reviewText}</p>

                      {/* Owner Reply Block */}
                      {rev.reply ? (
                        <div className="bg-white p-3.5 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700 relative">
                          <p className="text-[9px] font-black text-amber-500 uppercase">Cinema Owner Reply</p>
                          <p className="mt-1">{rev.reply}</p>
                          <button 
                            type="button"
                            onClick={() => setReviews(reviews.map(r => r.id === rev.id ? { ...r, reply: '' } : r))}
                            className="absolute top-2 right-2 text-[9px] text-red-500 font-black uppercase hover:underline"
                          >
                            Delete Reply
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 max-w-md pt-1">
                          <input
                            type="text"
                            placeholder="Type inline owner response and press Enter..."
                            className="px-3 py-2 text-xs font-semibold border border-gray-200 bg-white rounded-xl focus:outline-none flex-grow"
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                setReviews(reviews.map(r => r.id === rev.id ? { ...r, reply: e.target.value } : r));
                                toast.success('Reply posted successfully!');
                                e.target.value = '';
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </Card>
        </div>
      )}

      {/* TABS 13: Theatre Owner Profile & Business Settings */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          {/* Profile Header Banner */}
          <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-amber-400 text-amber-400 flex items-center justify-center font-black text-3xl shadow-md overflow-hidden">
                  {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TO'}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase cursor-pointer pointer-events-none">
                  Change Avatar
                </div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-gray-900">{user?.full_name || 'Rex Theatre Owner'}</h2>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black uppercase tracking-wider">
                    Verified Theatre Partner
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  {user?.email || 'owner@ticketbooking.com'} • Registered Partner Account
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-gray-600 font-bold flex-wrap">
                  <span>🏢 Business: PVR Rex Multiplex</span>
                  <span>📍 City: Mumbai, MH</span>
                  <span>🆔 GST: 27AAAAA0000A1Z5</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Personal Information */}
            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-gray-900">Personal Information</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Primary contact & personal credentials</p>
              </div>

              <div className="space-y-4">
                <Input label="Full Name" defaultValue={user?.full_name || 'Rex Theatre Owner'} placeholder="John Doe" />
                <Input label="Email Address" type="email" defaultValue={user?.email || 'owner@ticketbooking.com'} placeholder="owner@cinema.com" />
                <Input label="Phone Number" defaultValue={user?.phone || '+91 9876543210'} placeholder="+91 9876543210" />
                
                <div className="flex flex-col text-left">
                  <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1">City Location</label>
                  <select
                    defaultValue={CITIES[0]?.id || ''}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {CITIES.map(c => (
                      <option key={c.id} value={c.id}>{c.city_name} ({c.state})</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => toast.success('Personal info reset to saved values')}>Cancel</Button>
                  <Button variant="primary" className="bg-amber-400 text-gray-900 font-black px-6 py-2.5 rounded-2xl text-xs cursor-pointer" onClick={() => toast.success('Personal profile updated successfully!')}>
                    Save Personal Info
                  </Button>
                </div>
              </div>
            </Card>

            {/* 2. Business & Cinema Information */}
            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-gray-900">Business & Cinema Credentials</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Government registration & banking profile</p>
              </div>

              <div className="space-y-4">
                <Input label="Primary Theatre Name" defaultValue="Rex Cinemas Bandra" placeholder="Multiplex Name" />
                <Input label="Registered Business Name" defaultValue="Rex Cinemas Private Limited" placeholder="Company Name" />
                <Input label="GST Identification Number (GSTIN)" defaultValue="27AAAAA0000A1Z5" placeholder="GST Number" />
                <Input label="PAN Number" defaultValue="AABCU9603R" placeholder="PAN Number" />
                <Input label="Business License Reference" defaultValue="BL-2026-90482" placeholder="License Code" />
                <Input label="Registered Address" defaultValue="Bandra West, Mumbai, Maharashtra 400050" placeholder="Address" />

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Bank Account Number" defaultValue="************9090" placeholder="Account Number" />
                  <Input label="IFSC Code" defaultValue="HDFC0000123" placeholder="IFSC Code" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => toast.success('Business info reset')}>Cancel</Button>
                  <Button variant="primary" className="bg-amber-400 text-gray-900 font-black px-6 py-2.5 rounded-2xl text-xs cursor-pointer" onClick={() => toast.success('Business credentials saved!')}>
                    Save Business Credentials
                  </Button>
                </div>
              </div>
            </Card>

            {/* 3. Change Password Security */}
            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-gray-900">Security & Password</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Update account login password</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); toast.success('Password updated successfully!'); }} className="space-y-4">
                <Input label="Current Password" type="password" placeholder="••••••••" required />
                <Input label="New Password" type="password" placeholder="••••••••" required />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" required />

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600 space-y-1">
                  <p className="font-bold text-[11px] uppercase text-gray-500">Password Policy:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    <li>Minimum 8 characters long</li>
                    <li>At least one uppercase and one lowercase letter</li>
                    <li>At least one number and one special character (@$!%*?&)</li>
                  </ul>
                </div>

                <Button type="submit" variant="primary" className="w-full bg-amber-400 text-gray-900 font-black py-3 rounded-2xl text-xs cursor-pointer">
                  Update Password
                </Button>
              </form>
            </Card>

            {/* 4. Media Assets & Custom Templates */}
            <Card className="p-6 border border-gray-200 bg-white rounded-3xl shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-gray-900">Media Assets & SMS Layouts</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">Logos, banners, and confirmation messaging</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <ImageUploadField label="Profile Photo" value="" onChange={() => toast.success('Profile photo uploaded!')} type="poster" />
                  <ImageUploadField label="Theatre Logo" value="" onChange={() => toast.success('Theatre logo uploaded!')} type="banner" />
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase mb-1">Ticket Confirmation SMS Layout</span>
                  <textarea
                    defaultValue="Hi {customer_name}, your booking for {movie_title} (Seat: {seats}) is confirmed at Rex Cinemas. Show date: {date}."
                    rows="2"
                    className="p-3 border border-gray-200 rounded-xl focus:outline-none font-semibold text-xs bg-gray-50/50"
                  />
                </div>

                <Button variant="secondary" className="w-full border border-gray-200 py-3 rounded-2xl text-xs font-black cursor-pointer" onClick={() => toast.success('Media assets and templates configured!')}>
                  Save Media & SMS Layouts
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
};

export default TheatreOwnerDashboard;
