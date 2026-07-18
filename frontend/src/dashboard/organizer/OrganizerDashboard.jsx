import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, FiUsers, FiDollarSign, FiPlusCircle, 
  FiTrash2, FiMapPin, FiActivity
} from 'react-icons/fi';
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
  const [activeTab, setActiveTab] = useState('events');
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

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">Event Organizer Center</h1>
          <p className="text-sm text-text-secondary mt-1">Configure ticket packages, track attendees, and list schedules.</p>
        </div>
        <Button onClick={() => setIsAddEventOpen(true)} className="flex items-center gap-1.5">
          <FiPlusCircle size={16} />
          <span>Publish Event</span>
        </Button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
            <FiCalendar size={24} />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total Events</p>
            <p className="text-2xl font-black text-text-primary mt-1">{totalEvents}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-green-50 text-green-600">
            <FiActivity size={24} />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Active Events</p>
            <p className="text-2xl font-black text-text-primary mt-1">{activeEvents}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Ticket Registrations</p>
            <p className="text-2xl font-black text-text-primary mt-1">Now Live</p>
          </div>
        </Card>
      </div>

      {/* Events Grid */}
      <Card>
        <h3 className="font-bold text-lg text-text-primary mb-6">Published Events Catalog</h3>
        {events.length > 0 ? (
          <Table
            headers={['Banner', 'Event Title', 'Venue', 'Start Date', 'Status', 'Actions']}
            data={events}
            renderRow={(e) => (
              <tr key={e.id}>
                <td className="px-6 py-4">
                  <img src={e.poster || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'} alt={e.title} className="w-14 h-10 object-cover rounded-lg border border-border" />
                </td>
                <td className="px-6 py-4 font-bold text-sm">{e.title}</td>
                <td className="px-6 py-4 text-sm text-text-secondary flex items-center gap-1 mt-3">
                  <FiMapPin size={14} />
                  <span>{e.venue}</span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{e.start_date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
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
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id}>{c.city_name}</option>
              ))}
            </select>
          </div>
          <Input label="Venue Name" value={eventForm.venue} onChange={e => setEventForm({...eventForm, venue: e.target.value})} required />
          <Input label="Start Date (YYYY-MM-DD)" type="date" value={eventForm.start_date} onChange={e => setEventForm({...eventForm, start_date: e.target.value})} required />
          <Input label="Start Time (e.g. 18:00)" type="time" value={eventForm.start_time} onChange={e => setEventForm({...eventForm, start_time: e.target.value})} required />
          <div className="col-span-1 md:col-span-2">
            <Input label="Event Address" value={eventForm.address} onChange={e => setEventForm({...eventForm, address: e.target.value})} required />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input label="Event Description" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} required />
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
