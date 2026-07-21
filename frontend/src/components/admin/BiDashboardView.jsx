import React from 'react';
import { FiTrendingUp, FiDollarSign, FiUsers, FiPieChart, FiBarChart2, FiMapPin, FiClock, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Card from '../ui/Card';

const mockCityRevenue = [
  { city: 'Mumbai', revenue: 450000 },
  { city: 'Delhi NCR', revenue: 380000 },
  { city: 'Bangalore', revenue: 320000 },
  { city: 'Hyderabad', revenue: 260000 },
  { city: 'Chennai', revenue: 190000 },
  { city: 'Pune', revenue: 150000 }
];

const mockTopMovies = [
  { name: 'Avatar 3', value: 45, color: '#FFC107' },
  { name: 'Inception 2', value: 25, color: '#3B82F6' },
  { name: 'Jawan 2', value: 18, color: '#10B981' },
  { name: 'Others', value: 12, color: '#8B5CF6' }
];

const mockPeakDays = [
  { day: 'Mon', bookings: 1200 },
  { day: 'Tue', bookings: 1400 },
  { day: 'Wed', bookings: 1900 },
  { day: 'Thu', bookings: 1600 },
  { day: 'Fri', bookings: 4200 },
  { day: 'Sat', bookings: 7800 },
  { day: 'Sun', bookings: 6900 }
];

const BiDashboardView = () => {
  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
          <FiTrendingUp size={22} className="text-primary" />
          <span>Executive Business Intelligence (BI) Analytics</span>
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Deep-dive BI metrics across city yields, occupancy ratios, peak booking times, and cohort retention.
        </p>
      </div>

      {/* Top BI KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Avg Ticket Price (ATP)', value: '₹340.50', sub: '+4.2% YoY growth', color: 'text-green-600 bg-green-50' },
          { title: 'Avg Show Occupancy Rate', value: '74.8%', sub: 'Peak on Sat 7-10 PM', color: 'text-amber-600 bg-amber-50' },
          { title: 'Booking Cancellation Rate', value: '1.42%', sub: 'Within industry standard', color: 'text-blue-600 bg-blue-50' },
          { title: 'Payment Refund Rate', value: '0.85%', sub: '99.15% successful', color: 'text-purple-600 bg-purple-50' }
        ].map((kpi, idx) => (
          <Card key={idx} className="space-y-2">
            <p className="text-xs font-bold text-text-secondary uppercase">{kpi.title}</p>
            <p className="text-2xl font-black text-text-primary">{kpi.value}</p>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block ${kpi.color}`}>
              {kpi.sub}
            </span>
          </Card>
        ))}
      </div>

      {/* BI Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by City Bar Chart */}
        <Card>
          <h4 className="font-extrabold text-base text-text-primary mb-4 flex items-center gap-2">
            <FiMapPin size={18} className="text-primary" />
            <span>Revenue Yield by Tier-1 Metropolitan City (₹)</span>
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCityRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis dataKey="city" type="category" stroke="#6B7280" fontSize={12} width={90} />
                <Tooltip formatter={(val) => `₹${(val || 0).toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#FFC107" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Peak Booking Days Chart */}
        <Card>
          <h4 className="font-extrabold text-base text-text-primary mb-4 flex items-center gap-2">
            <FiCalendar size={18} className="text-blue-500" />
            <span>Peak Booking Volume by Day of Week</span>
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPeakDays}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Movies Occupancy Pie & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h4 className="font-extrabold text-base text-text-primary mb-4 flex items-center gap-2">
            <FiPieChart size={18} className="text-purple-500" />
            <span>Market Share by Blockbuster Movie</span>
          </h4>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockTopMovies} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {mockTopMovies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            {mockTopMovies.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="font-bold text-text-primary">{m.name} ({m.value}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top VIP Customers Table */}
        <Card className="lg:col-span-2">
          <h4 className="font-extrabold text-base text-text-primary mb-4 flex items-center gap-2">
            <FiUsers size={18} className="text-green-500" />
            <span>Top Performing VIP Customers & Spend Leaderboard</span>
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-border text-xs font-black text-text-secondary uppercase">
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Total Tickets</th>
                  <th className="px-4 py-3">Gross Lifetime Spend</th>
                  <th className="px-4 py-3">Fav City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {[
                  { name: 'Aarav Patel', tickets: '48 tickets', spend: '₹24,800', city: 'Mumbai' },
                  { name: 'Priya Sharma', tickets: '36 tickets', spend: '₹18,200', city: 'Delhi NCR' },
                  { name: 'Rohan Mehta', tickets: '32 tickets', spend: '₹16,400', city: 'Bangalore' },
                  { name: 'Sneha Kapur', tickets: '28 tickets', spend: '₹14,100', city: 'Hyderabad' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-hover-bg/30">
                    <td className="px-4 py-3 font-extrabold text-text-primary">{row.name}</td>
                    <td className="px-4 py-3 font-bold text-text-secondary">{row.tickets}</td>
                    <td className="px-4 py-3 font-black text-primary">{row.spend}</td>
                    <td className="px-4 py-3 font-semibold text-text-secondary">{row.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BiDashboardView;
