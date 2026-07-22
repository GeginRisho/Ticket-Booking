import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiCalendar, FiUsers, FiDollarSign, FiPlusCircle, FiCopy, FiCheckSquare,
  FiTrash2, FiMapPin, FiActivity, FiPercent, FiSettings, FiUser, FiInfo, 
  FiTag, FiGrid, FiDownload, FiCheck, FiX, FiRefreshCw, FiSearch, FiSliders
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { getEvents, createEvent, updateEvent, deleteEvent, getEventCategories } from '../../services/eventService';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../../services/venueService';
import { getOrganizerAnalytics, getOrganizerBookings, checkInParticipant, cancelParticipantRegistration } from '../../services/organizerService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const COLORS = ['#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#00BCD4', '#795548', '#607D8B'];

const OrganizerDashboard = () => {
  const { user, switchRole, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPathname = () => {
    const path = location.pathname;
    if (path.includes('/events')) return 'events';
    if (path.includes('/venues')) return 'venues';
    if (path.includes('/ticket-pricing')) return 'ticket-pricing';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/participants')) return 'participants';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/settings')) return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPathname());

  useEffect(() => {
    setActiveTab(getTabFromPathname());
  }, [location.pathname]);

  const [loading, setLoading] = useState(true);

  // Core Data Lists
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [checkinFilter, setCheckinFilter] = useState('ALL'); // ALL, checked_in, pending

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);

  // Form States
  const [editingEvent, setEditingEvent] = useState(null);
  const [showSeatVisualizer, setShowSeatVisualizer] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', poster: '', banner: '', category_id: '',
    city_id: CITIES[0]?.id || '', venue: '', address: '', start_date: '',
    end_date: '', start_time: '', status: 'draft', capacity: 100,
    time: '18:00', age_restriction: 'All Ages', languages: 'English, Hindi',
    tags: 'concert, live, symphony', gallery_images: '', venue_id: '',
    has_reserved_seating: false,
    seating_layout: {
      sections: [
        { name: 'VIP Zone', rowStart: 'A', rowEnd: 'B', seatsPerRow: 10, price: 1499 },
        { name: 'Premium Zone', rowStart: 'C', rowEnd: 'E', seatsPerRow: 10, price: 999 },
        { name: 'General Zone', rowStart: 'F', rowEnd: 'J', seatsPerRow: 10, price: 499 }
      ],
      blockedSeats: []
    },
    media_links: {
      banner: '',
      poster: '',
      gallery: [],
      videos: [],
      sponsors: []
    },
    refund_policy_details: {
      cancellation_deadline: 24,
      refund_percentage: 100,
      non_refundable: false,
      automatic_refund: true
    },
    tickets: [
      { ticket_type: 'General', price: 499, available_quantity: 80, booking_limit: 10, sales_window_start: '', sales_window_end: '', refund_policy: 'Refundable up to 24h prior' }
    ]
  });

  const [editingVenue, setEditingVenue] = useState(null);
  const [venueForm, setVenueForm] = useState({
    name: '', address: '', city_id: CITIES[0]?.id || '', seating_capacity: 500,
    maps_location: '', parking_information: 'Available', contact_number: '', gallery_images: ''
  });

  // Profile Edit fields
  const [profileForm, setProfileForm] = useState({
    fullName: user?.full_name || '',
    companyName: user?.company_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    businessDetails: user?.business_details || '',
    bankDetails: user?.bank_account || '',
    gstNumber: user?.gst_number || '',
    panNumber: user?.pan_number || '',
    businessLicense: user?.business_license || '',
    companyLogo: user?.company_logo || '',
    organizerPhoto: user?.organizer_photo || '',
    socialMediaLinks: user?.social_media_links || ''
  });

  const handleDragOver = (e) => e.preventDefault();

  const handleDropMedia = (e, field) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const mockUrl = URL.createObjectURL(files[0]);
      toast.success(`${files[0].name} uploaded successfully!`);
      if (field === 'banner' || field === 'poster') {
        setEventForm(prev => ({
          ...prev,
          [field]: mockUrl,
          media_links: { ...prev.media_links, [field]: mockUrl }
        }));
      } else {
        setEventForm(prev => ({
          ...prev,
          media_links: {
            ...prev.media_links,
            [field]: [...(prev.media_links[field] || []), mockUrl]
          }
        }));
      }
    }
  };

  const handleRemoveGalleryMedia = (field, idx) => {
    setEventForm(prev => {
      const list = [...(prev.media_links[field] || [])];
      list.splice(idx, 1);
      return {
        ...prev,
        media_links: { ...prev.media_links, [field]: list }
      };
    });
    toast.success('Media file removed');
  };

  const toggleBlockSeat = (seatId) => {
    setEventForm(prev => {
      const isBlocked = prev.seating_layout.blockedSeats.includes(seatId);
      const blockedSeats = isBlocked
        ? prev.seating_layout.blockedSeats.filter(s => s !== seatId)
        : [...prev.seating_layout.blockedSeats, seatId];
      return {
        ...prev,
        seating_layout: { ...prev.seating_layout, blockedSeats }
      };
    });
  };

  const updateSeatingSection = (idx, field, value) => {
    setEventForm(prev => {
      const sections = prev.seating_layout.sections.map((sec, i) => {
        if (i === idx) {
          return { ...sec, [field]: value };
        }
        return sec;
      });
      return {
        ...prev,
        seating_layout: { ...prev.seating_layout, sections }
      };
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData, venuesData, bookingsData, catsData, statsData] = await Promise.all([
        getEvents({ status: 'all' }).catch(() => []),
        getVenues().catch(() => []),
        getOrganizerBookings().catch(() => []),
        getEventCategories().catch(() => []),
        getOrganizerAnalytics().catch(() => null)
      ]);

      // Filter events to only owned events (fallback if backend didn't filter strictly)
      const ownedEvents = eventsData.filter(e => e.organizer_id === user.id || e.organizer?.id === user.id);
      setEvents(ownedEvents);
      setVenues(venuesData);
      setBookings(bookingsData);
      setCategories(catsData);
      setAnalytics(statsData);

      // Prepopulate form defaults
      if (catsData.length > 0) {
        setEventForm(prev => ({ ...prev, category_id: catsData[0].id }));
      }
      if (venuesData.length > 0) {
        setEventForm(prev => ({ ...prev, venue_id: venuesData[0].id }));
      }
    } catch (err) {
      toast.error('Failed to reload dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Event handlers
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const ticketsArray = eventForm.tickets.map(t => ({
        ...t,
        price: parseFloat(t.price),
        available_quantity: parseInt(t.available_quantity, 10),
        booking_limit: parseInt(t.booking_limit, 10) || 10,
        sales_window_start: t.sales_window_start || null,
        sales_window_end: t.sales_window_end || null
      }));

      const payload = {
        ...eventForm,
        capacity: parseInt(eventForm.capacity, 10) || 100,
        languages: typeof eventForm.languages === 'string' ? eventForm.languages.split(',').map(l => l.trim()) : eventForm.languages,
        tags: typeof eventForm.tags === 'string' ? eventForm.tags.split(',').map(t => t.trim()) : eventForm.tags,
        gallery_images: typeof eventForm.gallery_images === 'string' ? eventForm.gallery_images.split(',').map(g => g.trim()).filter(Boolean) : eventForm.gallery_images,
        tickets: ticketsArray
      };

      // Set venue name based on selected venue_id
      const targetVenue = venues.find(v => v.id === eventForm.venue_id);
      if (targetVenue) {
        payload.venue = targetVenue.name;
        payload.address = targetVenue.address;
        payload.city_id = targetVenue.city_id;
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        toast.success('Event updated successfully');
      } else {
        await createEvent(payload);
        toast.success('Event created in draft successfully');
      }

      setIsEventModalOpen(false);
      setEditingEvent(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit event request');
    }
  };

  const handleDuplicateEvent = (evt) => {
    const copy = {
      ...evt,
      title: `Copy of ${evt.title}`,
      status: 'draft',
      venue_id: evt.venue_id || '',
      tickets: evt.tickets?.map(t => ({
        ticket_type: t.ticket_type,
        price: t.price,
        available_quantity: t.available_quantity,
        booking_limit: t.booking_limit || 10,
        sales_window_start: t.sales_window_start || '',
        sales_window_end: t.sales_window_end || '',
        refund_policy: t.refund_policy || ''
      })) || []
    };
    
    // Auto populate form
    setEventForm({
      title: copy.title,
      description: copy.description || '',
      poster: copy.poster || '',
      banner: copy.banner || '',
      category_id: copy.category_id || '',
      city_id: copy.city_id || '',
      venue: copy.venue || '',
      address: copy.address || '',
      start_date: copy.start_date ? new Date(copy.start_date).toISOString().split('T')[0] : '',
      end_date: copy.end_date ? new Date(copy.end_date).toISOString().split('T')[0] : '',
      start_time: copy.time || '18:00',
      time: copy.time || '18:00',
      capacity: copy.capacity || 100,
      age_restriction: copy.age_restriction || 'All Ages',
      languages: Array.isArray(copy.languages) ? copy.languages.join(', ') : (copy.languages || ''),
      tags: Array.isArray(copy.tags) ? copy.tags.join(', ') : (copy.tags || ''),
      gallery_images: Array.isArray(copy.gallery_images) ? copy.gallery_images.join(', ') : '',
      venue_id: copy.venue_id,
      tickets: copy.tickets,
      status: 'draft',
      has_reserved_seating: copy.has_reserved_seating || false,
      seating_layout: copy.seating_layout || {
        sections: [
          { name: 'VIP Zone', rowStart: 'A', rowEnd: 'B', seatsPerRow: 10, price: 1499 },
          { name: 'Premium Zone', rowStart: 'C', rowEnd: 'E', seatsPerRow: 10, price: 999 },
          { name: 'General Zone', rowStart: 'F', rowEnd: 'J', seatsPerRow: 10, price: 499 }
        ],
        blockedSeats: []
      },
      media_links: copy.media_links || {
        banner: '',
        poster: '',
        gallery: [],
        videos: [],
        sponsors: []
      },
      refund_policy_details: copy.refund_policy_details || {
        cancellation_deadline: 24,
        refund_percentage: 100,
        non_refundable: false,
        automatic_refund: true
      }
    });

    setEditingEvent(null);
    setIsEventModalOpen(true);
    toast.success('Event properties duplicated! Review and save.');
  };

  const handleArchiveEvent = async (id) => {
    try {
      await updateEvent(id, { status: 'archived' });
      toast.success('Event archived successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to archive event');
    }
  };

  const handleSubmitForApproval = async (evt) => {
    try {
      await updateEvent(evt.id, { status: 'pending_approval' });
      toast.success('Submitted event to Admin for verification and approval');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit event approval request');
    }
  };

  const handleDeleteEventClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      loadData();
    } catch (err) {
      toast.error('Cannot delete event: active seat bookings exist');
    }
  };

  // Venue CRUD handlers
  const handleSaveVenue = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...venueForm,
        seating_capacity: parseInt(venueForm.seating_capacity, 10) || 500,
        gallery_images: venueForm.gallery_images.split(',').map(g => g.trim()).filter(Boolean)
      };

      if (editingVenue) {
        await updateVenue(editingVenue.id, payload);
        toast.success('Venue updated');
      } else {
        await createVenue(payload);
        toast.success('Venue created successfully');
      }

      setIsVenueModalOpen(false);
      setEditingVenue(null);
      loadData();
    } catch (err) {
      toast.error('Failed to save venue details');
    }
  };

  const handleDeleteVenue = async (id) => {
    if (!window.confirm('Delete this venue?')) return;
    try {
      await deleteVenue(id);
      toast.success('Venue deleted');
      loadData();
    } catch (err) {
      toast.error('Cannot delete venue associated with active events');
    }
  };

  // Booking Checkin/Cancel handlers
  const handleCheckIn = async (bookingId) => {
    try {
      const res = await checkInParticipant(bookingId);
      toast.success(res.message);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle check-in');
    }
  };

  const handleCancelRegistration = async (bookingId) => {
    if (!window.confirm('Cancel this customer booking and issue automatic refund?')) return;
    try {
      await cancelParticipantRegistration(bookingId);
      toast.success('Booking cancelled and refund processed successfully!');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  // Update Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const { updateProfile } = require('../../services/authService');
      const updated = await updateProfile({
        full_name: profileForm.fullName,
        company_name: profileForm.companyName,
        address: profileForm.address,
        business_details: profileForm.businessDetails,
        bank_account: profileForm.bankDetails,
        gst_number: profileForm.gstNumber,
        pan_number: profileForm.panNumber,
        business_license: profileForm.businessLicense,
        company_logo: profileForm.companyLogo,
        organizer_photo: profileForm.organizerPhoto,
        social_media_links: profileForm.socialMediaLinks
      });
      
      updateUser(updated.data?.user || updated.user || updated);
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error('Failed to update representative profile');
    }
  };

  // Exporters (PDF, CSV, Excel)
  const exportToCSV = (reportType) => {
    let headers = [];
    let data = [];
    let filename = `${reportType}_Report.csv`;

    if (reportType === 'revenue') {
      headers = ['Booking No', 'Event Title', 'Ticket Category', 'Qty', 'Paid Amount', 'Discount', 'Payment Status'];
      data = bookings.map(b => [b.booking_number, b.event?.title, b.ticket_type, b.quantity, `INR ${b.total_amount}`, `INR ${b.discount}`, b.payment_status]);
    } else if (reportType === 'bookings') {
      headers = ['Booking No', 'Customer Name', 'Email', 'Phone', 'Booking Date', 'Status'];
      data = bookings.map(b => [b.booking_number, b.user?.full_name, b.user?.email, b.user?.phone, b.booking_date, b.booking_status]);
    } else if (reportType === 'attendance') {
      headers = ['Customer Name', 'Event Title', 'Check-In Status', 'Checked-In At'];
      data = bookings.map(b => [b.user?.full_name, b.event?.title, b.checked_in ? 'Checked In' : 'Absent', b.checked_in_at || 'N/A']);
    } else if (reportType === 'refunds') {
      headers = ['Booking No', 'Customer Name', 'Refundable Amount', 'Payment Status', 'Booking Status'];
      data = bookings.filter(b => b.booking_status === 'cancelled').map(b => [b.booking_number, b.user?.full_name, `INR ${b.total_amount}`, b.payment_status, b.booking_status]);
    } else {
      headers = ['Event Title', 'Venue', 'Capacity Limit', 'Tickets Sold', 'Revenue Earned'];
      data = events.map(e => {
        const perf = analytics?.charts?.topEvents?.find(t => t.title === e.title) || { revenue: 0, ticketsSold: 0 };
        return [e.title, e.venue, e.capacity, perf.ticketsSold, `INR ${perf.revenue}`];
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...data.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename} successfully!`);
  };

  const exportToExcel = (reportType) => {
    // Generate a basic HTML Table structured XLS file
    let filename = `${reportType}_Report.xls`;
    let tableHtml = '<table border="1"><thead><tr>';
    
    let headers = [];
    let data = [];

    if (reportType === 'revenue') {
      headers = ['Booking No', 'Event Title', 'Ticket Category', 'Qty', 'Paid Amount', 'Discount', 'Payment Status'];
      data = bookings.map(b => [b.booking_number, b.event?.title, b.ticket_type, b.quantity, b.total_amount, b.discount, b.payment_status]);
    } else if (reportType === 'bookings') {
      headers = ['Booking No', 'Customer Name', 'Email', 'Phone', 'Booking Date', 'Status'];
      data = bookings.map(b => [b.booking_number, b.user?.full_name, b.user?.email, b.user?.phone, b.booking_date, b.booking_status]);
    } else if (reportType === 'attendance') {
      headers = ['Customer Name', 'Event Title', 'Check-In Status', 'Checked-In At'];
      data = bookings.map(b => [b.user?.full_name, b.event?.title, b.checked_in ? 'Checked In' : 'Absent', b.checked_in_at || 'N/A']);
    } else if (reportType === 'refunds') {
      headers = ['Booking No', 'Customer Name', 'Refundable Amount', 'Payment Status', 'Booking Status'];
      data = bookings.filter(b => b.booking_status === 'cancelled').map(b => [b.booking_number, b.user?.full_name, b.total_amount, b.payment_status, b.booking_status]);
    } else {
      headers = ['Event Title', 'Venue', 'Capacity Limit', 'Tickets Sold', 'Revenue Earned'];
      data = events.map(e => {
        const perf = analytics?.charts?.topEvents?.find(t => t.title === e.title) || { revenue: 0, ticketsSold: 0 };
        return [e.title, e.venue, e.capacity, perf.ticketsSold, perf.revenue];
      });
    }

    headers.forEach(h => { tableHtml += `<th>${h}</th>`; });
    tableHtml += '</tr></thead><tbody>';
    data.forEach(row => {
      tableHtml += '<tr>';
      row.forEach(cell => { tableHtml += `<td>${cell}</td>`; });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename} successfully!`);
  };

  const exportToPDF = (reportType) => {
    // Basic browser printable window layout
    const printWindow = window.open('', '_blank');
    let content = `
      <html>
        <head>
          <title>${reportType.toUpperCase()} REPORT</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h1 { text-align: center; color: #f59e0b; margin-bottom: 30px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f9fafb; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #888; }
          </style>
        </head>
        <body>
          <h1>TicketShow Event Organizer ${reportType} Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Organizer Name: ${user?.full_name} | Company: ${user?.company_name || 'N/A'}</p>
          <table>
            <thead>
              <tr>
    `;

    let headers = [];
    let data = [];

    if (reportType === 'revenue') {
      headers = ['Booking No', 'Event Title', 'Ticket Category', 'Qty', 'Paid Amount', 'Discount', 'Payment Status'];
      data = bookings.map(b => [b.booking_number, b.event?.title, b.ticket_type, b.quantity, `INR ${b.total_amount}`, `INR ${b.discount}`, b.payment_status]);
    } else if (reportType === 'bookings') {
      headers = ['Booking No', 'Customer Name', 'Email', 'Phone', 'Booking Date', 'Status'];
      data = bookings.map(b => [b.booking_number, b.user?.full_name, b.user?.email, b.user?.phone, b.booking_date, b.booking_status]);
    } else if (reportType === 'attendance') {
      headers = ['Customer Name', 'Event Title', 'Check-In Status', 'Checked-In At'];
      data = bookings.map(b => [b.user?.full_name, b.event?.title, b.checked_in ? 'Checked In' : 'Absent', b.checked_in_at || 'N/A']);
    } else if (reportType === 'refunds') {
      headers = ['Booking No', 'Customer Name', 'Refundable Amount', 'Payment Status', 'Booking Status'];
      data = bookings.filter(b => b.booking_status === 'cancelled').map(b => [b.booking_number, b.user?.full_name, `INR ${b.total_amount}`, b.payment_status, b.booking_status]);
    } else {
      headers = ['Event Title', 'Venue', 'Capacity Limit', 'Tickets Sold', 'Revenue Earned'];
      data = events.map(e => {
        const perf = analytics?.charts?.topEvents?.find(t => t.title === e.title) || { revenue: 0, ticketsSold: 0 };
        return [e.title, e.venue, e.capacity, perf.ticketsSold, `INR ${perf.revenue}`];
      });
    }

    headers.forEach(h => { content += `<th>${h}</th>`; });
    content += '</tr></thead><tbody>';
    data.forEach(row => {
      content += '<tr>';
      row.forEach(cell => { content += `<td>${cell}</td>`; });
      content += '</tr>';
    });
    content += `
            </tbody>
          </table>
          <div class="footer">TicketShow Platform Governance - Confidential Report</div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  // Ticket Categories dynamic form inputs
  const addTicketRow = () => {
    setEventForm({
      ...eventForm,
      tickets: [
        ...eventForm.tickets,
        { ticket_type: 'VIP', price: 999, available_quantity: 50, booking_limit: 10, sales_window_start: '', sales_window_end: '', refund_policy: 'Refundable' }
      ]
    });
  };

  const removeTicketRow = (idx) => {
    const updated = eventForm.tickets.filter((_, i) => i !== idx);
    setEventForm({ ...eventForm, tickets: updated });
  };

  const updateTicketRow = (idx, field, value) => {
    const updated = eventForm.tickets.map((t, i) => {
      if (i === idx) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setEventForm({ ...eventForm, tickets: updated });
  };

  // Participant list calculations
  const filteredBookings = bookings.filter(b => {
    const matchesEvent = selectedEventId ? (b.event?.id === selectedEventId) : true;
    const matchesSearch = searchQuery ? (
      (b.booking_number && b.booking_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.user && b.user.full_name && b.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.user && b.user.email && b.user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : true;
    const matchesCheckin = checkinFilter === 'ALL' ? true : (
      checkinFilter === 'checked_in' ? b.checked_in : !b.checked_in
    );
    return matchesEvent && matchesSearch && matchesCheckin;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader type="chart" />
      </div>
    );
  }

  // Quick statistics widgets
  const kpis = analytics?.kpis || {
    totalEvents: events.length,
    upcomingEvents: 0,
    liveEvents: 0,
    completedEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    pendingRefunds: 0,
    newBookings: 0,
    checkInsToday: 0,
    averageRating: 0
  };

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Event Organizer Portal</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">Manage venues, configure ticket prices, track participants, and download analytics reports.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => {
            setEditingEvent(null);
            setEventForm({
              title: '', description: '', poster: '', banner: '', category_id: categories[0]?.id || '',
              city_id: CITIES[0]?.id || '', venue: '', address: '', start_date: '',
              end_date: '', start_time: '', status: 'draft', capacity: 100,
              time: '18:00', age_restriction: 'All Ages', languages: 'English, Hindi',
              tags: 'concert, live, symphony', gallery_images: '', venue_id: venues[0]?.id || '',
              has_reserved_seating: false,
              seating_layout: {
                sections: [
                  { name: 'VIP Zone', rowStart: 'A', rowEnd: 'B', seatsPerRow: 10, price: 1499 },
                  { name: 'Premium Zone', rowStart: 'C', rowEnd: 'E', seatsPerRow: 10, price: 999 },
                  { name: 'General Zone', rowStart: 'F', rowEnd: 'J', seatsPerRow: 10, price: 499 }
                ],
                blockedSeats: []
              },
              media_links: {
                banner: '',
                poster: '',
                gallery: [],
                videos: [],
                sponsors: []
              },
              refund_policy_details: {
                cancellation_deadline: 24,
                refund_percentage: 100,
                non_refundable: false,
                automatic_refund: true
              },
              tickets: [{ ticket_type: 'General', price: 499, available_quantity: 80, booking_limit: 10, sales_window_start: '', sales_window_end: '', refund_policy: 'Refundable' }]
            });
            setIsEventModalOpen(true);
          }} className="flex items-center justify-center gap-1.5 font-bold text-xs bg-amber-400 text-gray-900 rounded-xl px-4 py-2.5 shadow-xs w-full sm:w-auto">
            <FiPlusCircle />
            <span>Create Event</span>
          </Button>
          <Button onClick={() => {
            setEditingVenue(null);
            setVenueForm({
              name: '', address: '', city_id: CITIES[0]?.id || '', seating_capacity: 500,
              maps_location: '', parking_information: 'Available', contact_number: '', gallery_images: ''
            });
            setIsVenueModalOpen(true);
          }} className="flex items-center justify-center gap-1.5 font-bold text-xs border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 w-full sm:w-auto">
            <FiMapPin />
            <span>Create Venue</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 hide-scrollbar py-1">
        {[
          { id: 'overview', label: 'Dashboard', icon: FiGrid },
          { id: 'events', label: 'Events Catalog', icon: FiCalendar },
          { id: 'venues', label: 'Venues', icon: FiMapPin },
          { id: 'participants', label: 'Participants', icon: FiUsers },
          { id: 'reports', label: 'Exports & Reports', icon: FiDownload },
          { id: 'profile', label: 'Organizer Profile', icon: FiUser },
          { id: 'settings', label: 'Workspace Settings', icon: FiSettings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              navigate(tab.id === 'overview' ? '/organizer/dashboard' : `/organizer/${tab.id}`);
            }}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap min-h-[44px] focus-visible:ring-2 focus-visible:ring-amber-500 ${
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
        
        {/* TAB 1: OVERVIEW & KPI METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: 'Total Events', value: kpis.totalEvents, desc: 'Created events', color: 'bg-amber-50 text-amber-600' },
                { title: 'Live Events', value: kpis.liveEvents, desc: 'Currently Selling', color: 'bg-green-50 text-green-600' },
                { title: 'Tickets Sold', value: kpis.totalTicketsSold, desc: 'Confirmed entries', color: 'bg-blue-50 text-blue-600' },
                { title: 'Gross Revenue', value: `₹${kpis.totalRevenue}`, desc: 'Total sales', color: 'bg-emerald-50 text-emerald-600' },
                { title: 'Average Rating', value: `${kpis.averageRating} ★`, desc: 'From feedback reviews', color: 'bg-indigo-50 text-indigo-600' }
              ].map((kpi, idx) => (
                <Card key={idx} className="p-5 border border-gray-100 flex flex-col justify-between rounded-2xl bg-white shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.title}</p>
                  <p className="text-3xl font-black text-gray-900 mt-2">{kpi.value}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-3 self-start ${kpi.color}`}>
                    {kpi.desc}
                  </span>
                </Card>
              ))}
            </div>

            {/* Sub KPI grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { title: 'Upcoming Events', value: kpis.upcomingEvents, type: 'Upcoming' },
                { title: 'Completed Events', value: kpis.completedEvents, type: 'Completed' },
                { title: 'Pending Refunds', value: kpis.pendingRefunds, type: 'Refunds pending' },
                { title: 'Check-ins Today', value: kpis.checkInsToday, type: 'Today entries' }
              ].map((sub, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-gray-500">{sub.title}</p>
                    <p className="text-lg font-black text-gray-900 mt-1">{sub.value}</p>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{sub.type}</span>
                </div>
              ))}
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Sales Chart */}
              <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                <h3 className="font-black text-base text-gray-900 mb-6 uppercase tracking-wider">Weekly Tickets Booking Trend</h3>
                <div className="h-72">
                  {analytics?.charts?.dailySales && analytics.charts.dailySales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.charts.dailySales}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} fontWeight={700} />
                        <YAxis stroke="#9CA3AF" fontSize={10} fontWeight={700} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#F59E0B" fill="#FEF3C7" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400">No sales transactions logged</div>
                  )}
                </div>
              </Card>

              {/* Monthly Revenue Chart */}
              <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                <h3 className="font-black text-base text-gray-900 mb-6 uppercase tracking-wider">Monthly Sales Income (INR)</h3>
                <div className="h-72">
                  {analytics?.charts?.monthlyRevenue && analytics.charts.monthlyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.charts.monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} fontWeight={700} />
                        <YAxis stroke="#9CA3AF" fontSize={10} fontWeight={700} />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#FFC107" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400">No monthly revenue history</div>
                  )}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category distribution */}
              <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                <h3 className="font-black text-base text-gray-900 mb-4 uppercase tracking-wider">Pass Distribution</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-48 w-48">
                    {analytics?.charts?.ticketCategoryDistribution && analytics.charts.ticketCategoryDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.charts.ticketCategoryDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="quantity"
                          >
                            {analytics.charts.ticketCategoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400">No ticket sales</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    {analytics?.charts?.ticketCategoryDistribution?.map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-bold border-b border-gray-50 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-gray-700">{cat.category}</span>
                        </div>
                        <span className="text-gray-900 font-extrabold">{cat.quantity} sold (₹{cat.revenue})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Top performing events */}
              <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
                <h3 className="font-black text-base text-gray-900 mb-6 uppercase tracking-wider">Top Performing Events</h3>
                <div className="space-y-4">
                  {analytics?.charts?.topEvents && analytics.charts.topEvents.length > 0 ? (
                    analytics.charts.topEvents.map((evt, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                        <div>
                          <p className="text-xs font-black text-gray-800">{evt.title}</p>
                          <p className="text-[10px] font-semibold text-gray-400">{evt.ticketsSold} passes reserved</p>
                        </div>
                        <span className="text-sm font-black text-amber-500">₹{evt.revenue}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-xs font-bold text-gray-400">No events performance statistics logged</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS CATALOG */}
        {activeTab === 'events' && (
          <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">Your Published Events</h3>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{events.length} Events total</span>
            </div>
            
            {events.length > 0 ? (
              <Table
                headers={['Preview', 'Event Title & Category', 'Venue & Timeline', 'Approval Status', 'Actions']}
                data={events}
                renderRow={(e) => (
                  <tr key={e.id}>
                    <td className="px-6 py-4">
                      <img src={e.poster || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200'} alt={e.title} className="w-14 h-10 object-cover rounded-xl border border-gray-200" />
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-gray-900">
                      <p className="font-extrabold">{e.title}</p>
                      <p className="text-[10px] text-amber-500 font-black mt-0.5">{e.category?.category_name || 'Concert'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                      <p className="flex items-center gap-1 font-bold"><FiMapPin size={12} className="text-amber-500" /> {e.venue}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(e.start_date).toLocaleDateString()} | {e.time || '18:00'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                        e.status === 'published' || e.status === 'active' ? 'bg-green-100 text-green-700' :
                        e.status === 'pending_approval' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                        e.status === 'approved' ? 'bg-amber-100 text-amber-700' :
                        e.status === 'archived' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                      }`}>
                        {e.status === 'active' ? 'PUBLISHED' : e.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-1.5 items-center">
                      <Button variant="secondary" size="sm" onClick={() => setPreviewEvent(e)} title="Preview Details">
                        <FiInfo size={14} />
                      </Button>
                      
                      {e.status === 'draft' && (
                        <Button variant="primary" size="sm" onClick={() => handleSubmitForApproval(e)} title="Submit to Admin for Approval">
                          <FiCheckSquare size={14} />
                        </Button>
                      )}

                      {e.status === 'approved' && (
                        <Button variant="success" size="sm" onClick={async () => {
                          try {
                            await updateEvent(e.id, { status: 'published' });
                            toast.success('Event published! Tickets are live.');
                            loadData();
                          } catch (err) {
                            toast.error('Failed to publish approved event');
                          }
                        }} title="Publish Live">
                          <FiPlusCircle size={14} />
                        </Button>
                      )}

                      <Button variant="secondary" size="sm" onClick={() => handleDuplicateEvent(e)} title="Duplicate Properties">
                        <FiCopy size={14} />
                      </Button>

                      {e.status !== 'archived' && (
                        <Button variant="secondary" size="sm" onClick={() => handleArchiveEvent(e.id)} title="Archive Event">
                          <FiSliders size={14} />
                        </Button>
                      )}

                      <Button variant="danger" size="sm" onClick={() => handleDeleteEventClick(e.id)} title="Delete Event">
                        <FiTrash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                )}
              />
            ) : (
              <EmptyState
                title="No events listed yet"
                description="Create your first event, configure entry pricing, and submit it for validation."
                actionLabel="Create Event"
                onActionClick={() => setIsEventModalOpen(true)}
              />
            )}
          </Card>
        )}

        {/* TAB 3: VENUES MANAGEMENT */}
        {activeTab === 'venues' && (
          <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">Registered Venues</h3>
              <Button onClick={() => {
                setEditingVenue(null);
                setVenueForm({
                  name: '', address: '', city_id: CITIES[0]?.id || '', seating_capacity: 500,
                  maps_location: '', parking_information: 'Available', contact_number: '', gallery_images: ''
                });
                setIsVenueModalOpen(true);
              }} size="sm" className="font-bold text-xs bg-amber-400 text-gray-900 rounded-xl px-4 py-2">
                Create Venue
              </Button>
            </div>

            {venues.length > 0 ? (
              <Table
                headers={['Venue Name', 'Capacity', 'Address', 'Contact No', 'Actions']}
                data={venues}
                renderRow={(v) => (
                  <tr key={v.id}>
                    <td className="px-6 py-4 font-extrabold text-sm text-gray-800">{v.name}</td>
                    <td className="px-6 py-4 text-xs font-black text-amber-500">{v.seating_capacity} seats</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                      <p>{v.address}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{v.city?.city_name || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">{v.contact_number || 'N/A'}</td>
                    <td className="px-6 py-4 flex gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => {
                        setEditingVenue(v);
                        setVenueForm({
                          name: v.name,
                          address: v.address,
                          city_id: v.city_id,
                          seating_capacity: v.seating_capacity,
                          maps_location: v.maps_location || '',
                          parking_information: v.parking_information || 'Available',
                          contact_number: v.contact_number || '',
                          gallery_images: Array.isArray(v.gallery_images) ? v.gallery_images.join(', ') : ''
                        });
                        setIsVenueModalOpen(true);
                      }}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteVenue(v.id)}>
                        <FiTrash2 size={12} />
                      </Button>
                    </td>
                  </tr>
                )}
              />
            ) : (
              <EmptyState
                title="No venues registered yet"
                description="Organizers must register event venues before configuring shows."
                actionLabel="Create Venue"
                onActionClick={() => setIsVenueModalOpen(true)}
              />
            )}
          </Card>
        )}

        {/* TAB 4: PARTICIPANTS LOGS */}
        {activeTab === 'participants' && (
          <div className="space-y-6">
            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-gray-200 p-4 rounded-3xl shadow-sm">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search Booking ID / Customer..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
                >
                  <option value="">All Events</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={checkinFilter}
                  onChange={e => setCheckinFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="checked_in">Checked In Only</option>
                  <option value="pending">Absent Only</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end items-center">
                <span className="text-xs font-bold text-gray-400">{filteredBookings.length} bookings matched</span>
              </div>
            </div>

            {/* List */}
            <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">Registered Participants</h3>
                <Button size="sm" onClick={() => exportToCSV('bookings')} className="flex items-center gap-1.5 font-bold text-xs bg-amber-400 text-gray-900 rounded-xl px-4 py-2.5">
                  <FiDownload size={14} />
                  <span>Download Attendee List</span>
                </Button>
              </div>

              {filteredBookings.length > 0 ? (
                <Table
                  headers={['Booking No', 'Customer Name & Email', 'Selected Event', 'Category & Qty', 'Attendance status', 'Actions']}
                  data={filteredBookings}
                  renderRow={(b) => (
                    <tr key={b.id}>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-gray-700">{b.booking_number}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-900">
                        <p>{b.user?.full_name}</p>
                        <p className="text-gray-400 font-semibold mt-0.5">{b.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-800">
                        <p>{b.event?.title}</p>
                        <p className="text-gray-400 font-semibold text-[10px] mt-0.5">{b.event?.venue}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                        <p className="font-extrabold text-amber-500 uppercase tracking-wide">{b.ticket_type}</p>
                        <p className="text-gray-400 text-[10px] mt-0.5">Qty: {b.quantity}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                          b.checked_in ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {b.checked_in ? 'Checked In' : 'Absent'}
                        </span>
                        {b.checked_in_at && (
                          <p className="text-[9px] text-gray-400 mt-1">{new Date(b.checked_in_at).toLocaleTimeString()}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-1.5">
                        {b.booking_status === 'confirmed' && (
                          <Button 
                            variant={b.checked_in ? 'secondary' : 'success'} 
                            size="sm" 
                            onClick={() => handleCheckIn(b.id)}
                            className="font-bold text-[10px]"
                          >
                            {b.checked_in ? 'Undo Checkin' : 'Check-In'}
                          </Button>
                        )}
                        {b.booking_status !== 'cancelled' && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleCancelRegistration(b.id)}
                            className="font-bold text-[10px]"
                          >
                            Cancel & Refund
                          </Button>
                        )}
                        {b.booking_status === 'cancelled' && (
                          <span className="text-xs text-red-500 font-black uppercase">REFUNDED</span>
                        )}
                      </td>
                    </tr>
                  )}
                />
              ) : (
                <EmptyState
                  title="No participant registrations logged"
                  description="Use filters above to view booked attendees roster listings."
                />
              )}
            </Card>
          </div>
        )}

        {/* TAB 5: REPORTS & EXPORTS */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'revenue', title: 'Revenue Breakdown Report', desc: 'Earnings per ticket package, convenience charge summaries, taxes, and margins.' },
              { id: 'bookings', title: 'Customer Booking Log Report', desc: 'Roster of registration dates, order numbers, contact details, and payment modes.' },
              { id: 'attendance', title: 'Event Attendance Audit', desc: 'Check-in counts, timestamps list, and no-shows ratio analyses.' },
              { id: 'refunds', title: 'Refunds & Cancellations Ledger', desc: 'Reimbursed ticket packages log, processing dates, and original checkout references.' },
              { id: 'performance', title: 'Event Performance Statistics', desc: 'Aggregate data of capacity utilization, tickets margins, and average rating.' }
            ].map(rep => (
              <Card key={rep.id} className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between gap-6">
                <div>
                  <h4 className="font-black text-base text-gray-900">{rep.title}</h4>
                  <p className="text-xs font-semibold text-gray-500 mt-2">{rep.desc}</p>
                </div>
                <div className="flex gap-2 border-t border-gray-100 pt-4 mt-auto">
                  <Button variant="secondary" size="sm" onClick={() => exportToPDF(rep.id)} className="flex-1 text-[11px] font-black">
                    Print PDF
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => exportToCSV(rep.id)} className="flex-1 text-[11px] font-black">
                    Export CSV
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => exportToExcel(rep.id)} className="flex-1 text-[11px] font-black">
                    Excel Sheet
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 6: ORGANIZER PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            {/* Logo/Photo preview cards */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex flex-col items-center text-center">
                <img 
                  src={profileForm.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'} 
                  alt="Company Logo" 
                  className="w-24 h-24 object-cover rounded-full border-4 border-amber-400/20 bg-gray-50 mb-4" 
                />
                <h4 className="font-black text-lg text-gray-900">{profileForm.companyName || 'Enter Company Name'}</h4>
                <p className="text-xs text-gray-400 font-bold mt-1">Entertainment & Onboarding Partner</p>
              </Card>

              <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex flex-col items-center text-center">
                <img 
                  src={profileForm.organizerPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'} 
                  alt="Representative Photo" 
                  className="w-24 h-24 object-cover rounded-2xl border-4 border-gray-100 bg-gray-50 mb-4" 
                />
                <h4 className="font-black text-lg text-gray-900">{profileForm.fullName || 'Enter Representative Name'}</h4>
                <p className="text-xs text-gray-400 font-bold mt-1">Authorized Contact Agent</p>
              </Card>
            </div>

            {/* Profile fields card */}
            <Card className="lg:col-span-2 bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight pb-3 border-b border-gray-100">Representative Profile Settings</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Authorized Name" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} required />
                <Input label="Company Name" value={profileForm.companyName} onChange={e => setProfileForm({...profileForm, companyName: e.target.value})} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Official Email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} disabled />
                <Input label="Contact Number" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="GST IN" value={profileForm.gstNumber} onChange={e => setProfileForm({...profileForm, gstNumber: e.target.value})} required />
                <Input label="PAN Card" value={profileForm.panNumber} onChange={e => setProfileForm({...profileForm, panNumber: e.target.value})} required />
                <Input label="License Number" value={profileForm.businessLicense} onChange={e => setProfileForm({...profileForm, businessLicense: e.target.value})} required />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1">Company Description</label>
                <textarea
                  rows="3"
                  value={profileForm.businessDetails}
                  onChange={e => setProfileForm({...profileForm, businessDetails: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white resize-none"
                />
              </div>

              <div>
                <Input label="Registered Office Address" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company Logo URL" value={profileForm.companyLogo} onChange={e => setProfileForm({...profileForm, companyLogo: e.target.value})} />
                <Input label="Authorized Photo URL" value={profileForm.organizerPhoto} onChange={e => setProfileForm({...profileForm, organizerPhoto: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Bank Account details" value={profileForm.bankDetails} onChange={e => setProfileForm({...profileForm, bankDetails: e.target.value})} placeholder="Account No, IFSC code" />
                <Input label="Social Media handles" value={profileForm.socialMediaLinks} onChange={e => setProfileForm({...profileForm, socialMediaLinks: e.target.value})} placeholder="LinkedIn, Twitter link" />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" className="font-bold text-xs bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-xl px-6 py-3">
                  Save Representative Profile
                </Button>
              </div>
            </Card>
          </form>
        )}

        {/* TAB 7: SETTINGS & DEVELOPER OVERRIDE */}
        {activeTab === 'settings' && (
          <Card className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm space-y-6">
            <div>
              <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">Workspace Preferences</h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">Configure alerts and manage developer utility options.</p>
            </div>
            
            <div className="divide-y divide-gray-100 font-semibold text-gray-600 text-sm">
              <div className="flex justify-between items-center py-4">
                <div>
                  <p className="text-gray-800 font-bold">New Booking Push Notifications</p>
                  <p className="text-xs text-gray-400 mt-0.5">Receive immediate alerts when customer seats are booked.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-500" />
              </div>

              <div className="flex justify-between items-center py-4">
                <div>
                  <p className="text-gray-800 font-bold">Event Approval Email Reminders</p>
                  <p className="text-xs text-gray-400 mt-0.5">Receive reminders when draft events require approvals.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-500" />
              </div>

              <div className="flex justify-between items-center py-4">
                <div>
                  <p className="text-gray-800 font-bold">Refund Cancellation Audits</p>
                  <p className="text-xs text-gray-400 mt-0.5">Forward reports logs to compliance officer emails.</p>
                </div>
                <input type="checkbox" className="w-4 h-4 accent-amber-500" />
              </div>

              {/* Developer switch role override */}
              <div className="pt-6 mt-6">
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
                      className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all ${
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
        )}

      </div>

      {/* EVENT MANAGEMENT CREATION & EDIT MODAL */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title={editingEvent ? "Edit Event Properties" : "Create New Event (Draft)"} size="lg">
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Event Title" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required />
            <div className="flex flex-col text-left">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1">Category</label>
              <select
                value={eventForm.category_id}
                onChange={e => setEventForm({...eventForm, category_id: e.target.value})}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
                required
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.category_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col text-left">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1">Select Venue Location</label>
              <select
                value={eventForm.venue_id}
                onChange={e => setEventForm({...eventForm, venue_id: e.target.value})}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
                required
              >
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.address})</option>
                ))}
              </select>
            </div>
            <Input label="Capacity Limit" type="number" value={eventForm.capacity} onChange={e => setEventForm({...eventForm, capacity: e.target.value})} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Start Date" type="date" value={eventForm.start_date} onChange={e => setEventForm({...eventForm, start_date: e.target.value})} required />
            <Input label="End Date" type="date" value={eventForm.end_date} onChange={e => setEventForm({...eventForm, end_date: e.target.value})} required />
            <Input label="Show Time (e.g. 19:30)" value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value, start_time: e.target.value})} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Age Restriction" value={eventForm.age_restriction} onChange={e => setEventForm({...eventForm, age_restriction: e.target.value})} placeholder="e.g. 18+, Family Allowed" />
            <Input label="Languages (comma separated)" value={eventForm.languages} onChange={e => setEventForm({...eventForm, languages: e.target.value})} placeholder="English, Hindi" />
            <Input label="Search tags (comma separated)" value={eventForm.tags} onChange={e => setEventForm({...eventForm, tags: e.target.value})} placeholder="concert, festival" />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1">Short Description</label>
            <textarea
              rows="2"
              value={eventForm.description}
              onChange={e => setEventForm({...eventForm, description: e.target.value})}
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white resize-none"
              required
            />
          </div>

          {/* Drag and Drop Media uploaders */}
          <div className="border-t border-gray-100 pt-4 space-y-4 text-left">
            <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Event Media Uploads</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Banner Dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropMedia(e, 'banner')}
                className="border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[120px]"
              >
                <span className="text-xs text-gray-500 font-bold">Drag & Drop Event Banner</span>
                <span className="text-[10px] text-gray-400 mt-1">Or click to select file</span>
                {eventForm.banner && (
                  <div className="mt-3 relative">
                    <img src={eventForm.banner} alt="Banner Preview" className="h-12 w-28 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={() => setEventForm(prev => ({ ...prev, banner: '', media_links: { ...prev.media_links, banner: '' } }))} className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 cursor-pointer">
                      <FiX size={10} />
                    </button>
                  </div>
                )}
              </div>

              {/* Poster Dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropMedia(e, 'poster')}
                className="border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[120px]"
              >
                <span className="text-xs text-gray-500 font-bold">Drag & Drop Event Poster</span>
                <span className="text-[10px] text-gray-400 mt-1">Or click to select file</span>
                {eventForm.poster && (
                  <div className="mt-3 relative">
                    <img src={eventForm.poster} alt="Poster Preview" className="h-12 w-10 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={() => setEventForm(prev => ({ ...prev, poster: '', media_links: { ...prev.media_links, poster: '' } }))} className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 cursor-pointer">
                      <FiX size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery, Videos, and Sponsors Dropzones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Gallery dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropMedia(e, 'gallery')}
                className="border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-2xl p-3 text-center cursor-pointer bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[100px]"
              >
                <span className="text-[11px] text-gray-500 font-bold">Add Gallery Images</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Drag files here</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {eventForm.media_links?.gallery?.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} className="w-8 h-8 object-cover rounded-md border border-gray-200" />
                      <button type="button" onClick={() => handleRemoveGalleryMedia('gallery', i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-px cursor-pointer">
                        <FiX size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropMedia(e, 'videos')}
                className="border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-2xl p-3 text-center cursor-pointer bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[100px]"
              >
                <span className="text-[11px] text-gray-500 font-bold">Add Promo Videos</span>
                <span className="text-[9px] text-gray-400 mt-0.5">MP4 file drop zone</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {eventForm.media_links?.videos?.map((vid, i) => (
                    <div key={i} className="relative bg-gray-200 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold max-w-[80px] truncate">
                      <span>Video {i + 1}</span>
                      <button type="button" onClick={() => handleRemoveGalleryMedia('videos', i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-px cursor-pointer">
                        <FiX size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sponsors dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropMedia(e, 'sponsors')}
                className="border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-2xl p-3 text-center cursor-pointer bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[100px]"
              >
                <span className="text-[11px] text-gray-500 font-bold">Add Sponsor Logos</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Drag brand assets</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {eventForm.media_links?.sponsors?.map((spon, i) => (
                    <div key={i} className="relative">
                      <img src={spon} className="w-8 h-8 object-cover rounded-md border border-gray-200" />
                      <button type="button" onClick={() => handleRemoveGalleryMedia('sponsors', i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-px cursor-pointer">
                        <FiX size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Seating Layout configuration builder */}
          <div className="border-t border-gray-100 pt-4 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Reserved Seating & Layout</span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 font-bold">Enable Seating Layout Map</label>
                <input 
                  type="checkbox" 
                  checked={eventForm.has_reserved_seating} 
                  onChange={e => setEventForm({ ...eventForm, has_reserved_seating: e.target.checked })} 
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {eventForm.has_reserved_seating && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                <p className="text-[11px] text-gray-500 font-bold">Configure rows and seating sections. Available zones: VIP Zone, Premium Zone, General Zone.</p>
                
                <div className="space-y-3">
                  {eventForm.seating_layout.sections.map((sec, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end border-b border-gray-200 pb-2 text-xs">
                      <div className="flex flex-col text-left">
                        <label className="block text-[10px] text-gray-400 font-black mb-1">Zone</label>
                        <input type="text" value={sec.name} readOnly className="px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-200 font-bold" />
                      </div>
                      <div className="flex flex-col text-left">
                        <label className="block text-[10px] text-gray-400 font-black mb-1">Row Start</label>
                        <input type="text" value={sec.rowStart} onChange={e => updateSeatingSection(idx, 'rowStart', e.target.value.toUpperCase())} className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none" />
                      </div>
                      <div className="flex flex-col text-left">
                        <label className="block text-[10px] text-gray-400 font-black mb-1">Row End</label>
                        <input type="text" value={sec.rowEnd} onChange={e => updateSeatingSection(idx, 'rowEnd', e.target.value.toUpperCase())} className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none" />
                      </div>
                      <div className="flex flex-col text-left">
                        <label className="block text-[10px] text-gray-400 font-black mb-1">Seats/Row</label>
                        <input type="number" value={sec.seatsPerRow} onChange={e => updateSeatingSection(idx, 'seatsPerRow', parseInt(e.target.value, 10))} className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none" />
                      </div>
                      <div className="flex flex-col text-left">
                        <label className="block text-[10px] text-gray-400 font-black mb-1">Price (₹)</label>
                        <input type="number" value={sec.price} onChange={e => updateSeatingSection(idx, 'price', parseFloat(e.target.value))} className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Button type="button" size="sm" onClick={() => setShowSeatVisualizer(!showSeatVisualizer)} className="text-[10px] font-black bg-white border border-gray-200">
                    {showSeatVisualizer ? 'Hide Seat Map Layout' : 'Visualize & Block Seats Map'}
                  </Button>
                  <span className="text-[10px] font-bold text-gray-400">{eventForm.seating_layout.blockedSeats.length} seats blocked</span>
                </div>

                {showSeatVisualizer && (
                  <div className="p-4 bg-white border border-gray-200 rounded-xl max-h-[300px] overflow-auto space-y-4">
                    {eventForm.seating_layout.sections.map((section, sIdx) => {
                      const startCode = section.rowStart.charCodeAt(0) || 65;
                      const endCode = section.rowEnd.charCodeAt(0) || 66;
                      const rows = [];
                      for (let i = startCode; i <= endCode; i++) {
                        rows.push(String.fromCharCode(i));
                      }

                      return (
                        <div key={sIdx} className="space-y-2">
                          <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">{section.name} (₹{section.price})</span>
                          <div className="space-y-1">
                            {rows.map(row => (
                              <div key={row} className="flex items-center gap-1.5">
                                <span className="w-5 text-[10px] font-black text-gray-400">{row}</span>
                                <div className="flex flex-wrap gap-1">
                                  {Array.from({ length: section.seatsPerRow || 1 }).map((_, cIdx) => {
                                    const col = cIdx + 1;
                                    const seatId = `${section.name}-${row}-${col}`;
                                    const isBlocked = eventForm.seating_layout.blockedSeats.includes(seatId);
                                    
                                    return (
                                      <button
                                        type="button"
                                        key={col}
                                        onClick={() => toggleBlockSeat(seatId)}
                                        className={`w-6 h-6 rounded-md text-[8px] font-bold border transition-all flex items-center justify-center cursor-pointer ${
                                          isBlocked 
                                            ? 'bg-gray-800 text-white border-gray-800 line-through' 
                                            : section.name === 'VIP Zone' 
                                              ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                                              : section.name === 'Premium Zone'
                                                ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                                                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                                        }`}
                                        title={isBlocked ? `${seatId} (Blocked)` : `${seatId}`}
                                      >
                                        {col}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Refund Policy details */}
          <div className="border-t border-gray-100 pt-4 space-y-3 text-left">
            <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider block">Cancellation & Refund Policy</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col text-left">
                <label className="block text-[10px] text-gray-400 font-black mb-1">Cancellation Deadline (hours before)</label>
                <input 
                  type="number" 
                  value={eventForm.refund_policy_details?.cancellation_deadline ?? 24} 
                  onChange={e => setEventForm(prev => ({ 
                    ...prev, 
                    refund_policy_details: { ...(prev.refund_policy_details || {}), cancellation_deadline: parseInt(e.target.value, 10) } 
                  }))}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white" 
                  required 
                />
              </div>
              <div className="flex flex-col text-left">
                <label className="block text-[10px] text-gray-400 font-black mb-1">Refund Percentage (%)</label>
                <input 
                  type="number" 
                  value={eventForm.refund_policy_details?.refund_percentage ?? 100} 
                  onChange={e => setEventForm(prev => ({ 
                    ...prev, 
                    refund_policy_details: { ...(prev.refund_policy_details || {}), refund_percentage: parseInt(e.target.value, 10) } 
                  }))}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white" 
                  required 
                />
              </div>
              <div className="flex flex-col text-left justify-end">
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox" 
                    checked={eventForm.refund_policy_details?.non_refundable ?? false} 
                    onChange={e => setEventForm(prev => ({ 
                      ...prev, 
                      refund_policy_details: { ...(prev.refund_policy_details || {}), non_refundable: e.target.checked } 
                    }))}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                  <label className="font-bold text-gray-700 text-xs">Non-Refundable Tickets</label>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Ticket Configurations */}
          <div className="border-t border-gray-100 pt-4 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Configure Ticket Categories</span>
              <Button type="button" size="sm" onClick={addTicketRow} className="text-[10px] font-black bg-amber-50 text-amber-500 border border-amber-100">
                + Add Ticket Category
              </Button>
            </div>
            
            <div className="space-y-4">
              {eventForm.tickets.map((ticket, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Category #{idx + 1}</span>
                    {eventForm.tickets.length > 1 && (
                      <button type="button" onClick={() => removeTicketRow(idx)} className="text-red-500 hover:text-red-700 text-xs font-black cursor-pointer">
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="flex flex-col text-left">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category Name</label>
                      <select 
                        value={ticket.ticket_type} 
                        onChange={e => updateTicketRow(idx, 'ticket_type', e.target.value)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none"
                      >
                        {['VIP', 'Premium', 'Gold', 'Silver', 'General', 'Student', 'Corporate', 'Early Bird', 'VIP Zone', 'Premium Zone', 'General Zone'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col text-left">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price (INR)</label>
                      <input 
                        type="number" 
                        value={ticket.price} 
                        onChange={e => updateTicketRow(idx, 'price', e.target.value)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none" 
                        required
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Quantity</label>
                      <input 
                        type="number" 
                        value={ticket.available_quantity} 
                        onChange={e => updateTicketRow(idx, 'available_quantity', e.target.value)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none" 
                        required
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Booking Limit / Order</label>
                      <input 
                        type="number" 
                        value={ticket.booking_limit || 10} 
                        onChange={e => updateTicketRow(idx, 'booking_limit', e.target.value)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none" 
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex flex-col text-left">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sales Start</label>
                      <input 
                        type="date" 
                        value={ticket.sales_window_start ? ticket.sales_window_start.split('T')[0] : ''} 
                        onChange={e => updateTicketRow(idx, 'sales_window_start', e.target.value)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none" 
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sales End</label>
                      <input 
                        type="date" 
                        value={ticket.sales_window_end ? ticket.sales_window_end.split('T')[0] : ''} 
                        onChange={e => updateTicketRow(idx, 'sales_window_end', e.target.value)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none" 
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Refund Policy</label>
                      <input 
                        type="text" 
                        value={ticket.refund_policy || ''} 
                        onChange={e => updateTicketRow(idx, 'refund_policy', e.target.value)}
                        className="px-2 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none" 
                        placeholder="Non-refundable"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsEventModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Event (Draft)</Button>
          </div>
        </form>
      </Modal>

      {/* VENUE CREATION & EDIT MODAL */}
      <Modal isOpen={isVenueModalOpen} onClose={() => setIsVenueModalOpen(false)} title={editingVenue ? "Edit Venue Details" : "Create New Physical Venue"} size="md">
        <form onSubmit={handleSaveVenue} className="space-y-4">
          <Input label="Venue Name" value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} required />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col text-left">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1">City Location</label>
              <select
                value={venueForm.city_id}
                onChange={e => setVenueForm({...venueForm, city_id: e.target.value})}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                required
              >
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.city_name}</option>
                ))}
              </select>
            </div>
            <Input label="Seating capacity" type="number" value={venueForm.seating_capacity} onChange={e => setVenueForm({...venueForm, seating_capacity: e.target.value})} required />
          </div>

          <Input label="Address Details" value={venueForm.address} onChange={e => setVenueForm({...venueForm, address: e.target.value})} required />
          <Input label="Google Maps Location URL" value={venueForm.maps_location} onChange={e => setVenueForm({...venueForm, maps_location: e.target.value})} placeholder="https://maps.google.com/..." />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Parking Information" value={venueForm.parking_information} onChange={e => setVenueForm({...venueForm, parking_information: e.target.value})} placeholder="Free parking available" />
            <Input label="Venue Contact number" value={venueForm.contact_number} onChange={e => setVenueForm({...venueForm, contact_number: e.target.value})} required />
          </div>

          <Input label="Gallery Images (comma-separated URLs)" value={venueForm.gallery_images} onChange={e => setVenueForm({...venueForm, gallery_images: e.target.value})} placeholder="https://image1.png, https://image2.png" />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsVenueModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Venue</Button>
          </div>
        </form>
      </Modal>

      {/* EVENT PREVIEW DETAILS MODAL */}
      <Modal isOpen={!!previewEvent} onClose={() => setPreviewEvent(null)} title="Event Specifications Preview" size="lg">
        {previewEvent && (
          <div className="space-y-6 text-left font-semibold text-gray-600 text-sm">
            <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-gray-200">
              <img src={previewEvent.banner || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'} alt={previewEvent.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div>
                  <span className="px-2 py-0.5 bg-amber-400 text-gray-900 text-[10px] font-black rounded-lg uppercase">{previewEvent.category?.category_name || 'Event'}</span>
                  <h3 className="text-white font-black text-xl mt-1">{previewEvent.title}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-[9px] text-gray-400 uppercase font-black block">Start Date</span>
                <span className="text-gray-800 text-xs font-extrabold">{new Date(previewEvent.start_date).toLocaleDateString()}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-[9px] text-gray-400 uppercase font-black block">Timing</span>
                <span className="text-gray-800 text-xs font-extrabold">{previewEvent.time || '18:00'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-[9px] text-gray-400 uppercase font-black block">Capacity</span>
                <span className="text-gray-800 text-xs font-extrabold">{previewEvent.capacity || 100} seats</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-[9px] text-gray-400 uppercase font-black block">Age Limits</span>
                <span className="text-gray-800 text-xs font-extrabold">{previewEvent.age_restriction || 'All Ages'}</span>
              </div>
            </div>

            <div>
              <h5 className="font-black text-gray-800 uppercase tracking-widest text-[10px] mb-1">Languages & Tags</h5>
              <p className="text-gray-700">Languages: {Array.isArray(previewEvent.languages) ? previewEvent.languages.join(', ') : previewEvent.languages || 'English'}</p>
              <p className="text-gray-500 text-xs mt-1">Tags: {Array.isArray(previewEvent.tags) ? previewEvent.tags.join(', ') : previewEvent.tags || 'concert'}</p>
            </div>

            <div>
              <h5 className="font-black text-gray-800 uppercase tracking-widest text-[10px] mb-1">Description</h5>
              <p className="text-gray-700 font-normal leading-relaxed">{previewEvent.description}</p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h5 className="font-black text-gray-800 uppercase tracking-widest text-[10px] mb-3">Configured Ticket Categories</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {previewEvent.tickets?.map((t, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-amber-500 uppercase tracking-wide">{t.ticket_type}</span>
                      <span className="font-black text-gray-900">₹{t.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
                      <span>Available: {t.available_quantity} passes</span>
                      <span>Limit: {t.booking_limit || 10} / order</span>
                    </div>
                    {t.refund_policy && (
                      <p className="text-[9px] text-gray-400 font-normal mt-1 border-t border-gray-100/50 pt-1">Policy: {t.refund_policy}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setPreviewEvent(null)}>Close Preview</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default OrganizerDashboard;
