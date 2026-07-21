import React from 'react';
import { FiCpu, FiHardDrive, FiDatabase, FiServer, FiZap, FiMail, FiMessageSquare, FiClock, FiActivity, FiAlertOctagon } from 'react-icons/fi';
import Card from '../ui/Card';

const PlatformHealthGrid = () => {
  const healthMetrics = [
    { title: 'CPU Usage', value: '24.2%', status: 'Optimal', icon: FiCpu, color: 'text-green-600 bg-green-50', bar: 24 },
    { title: 'RAM Memory', value: '4.8 GB / 16 GB', status: '30% Used', icon: FiHardDrive, color: 'text-blue-600 bg-blue-50', bar: 30 },
    { title: 'PostgreSQL Database', value: 'Healthy', status: '12ms Latency', icon: FiDatabase, color: 'text-purple-600 bg-purple-50', bar: 95 },
    { title: 'Redis Cache Cluster', value: 'Operational', status: '99.4% Hit Rate', icon: FiZap, color: 'text-amber-600 bg-amber-50', bar: 99 },
    { title: 'S3 Media Storage', value: '1.2 TB / 10 TB', status: '12% Capacity', icon: FiServer, color: 'text-cyan-600 bg-cyan-50', bar: 12 },
    { title: 'API Response Time', value: '42 ms', status: 'Sub-50ms Avg', icon: FiActivity, color: 'text-emerald-600 bg-emerald-50', bar: 88 },
    { title: 'Background Jobs Queue', value: '0 Backlog', status: '1,420 Done/min', icon: FiClock, color: 'text-indigo-600 bg-indigo-50', bar: 100 },
    { title: 'Email Queue (Mailgun)', value: '12 In Queue', status: '0 Failures', icon: FiMail, color: 'text-rose-600 bg-rose-50', bar: 98 },
    { title: 'SMS Queue (Twilio)', value: '3 Pending', status: '100% Delivered', icon: FiMessageSquare, color: 'text-orange-600 bg-orange-50', bar: 100 },
    { title: 'System Uptime SLA', value: '99.98%', status: 'Last 30 Days', icon: FiAlertOctagon, color: 'text-teal-600 bg-teal-50', bar: 99.98 }
  ];

  const apiMonitorStats = [
    { endpoint: 'GET /api/v1/movies/now-showing', requests: '48,200', responseTime: '18ms', errors: '0.01%', status: 'Fast' },
    { endpoint: 'POST /api/v1/bookings/reserve-seat', requests: '14,800', responseTime: '64ms', errors: '0.04%', status: 'Normal' },
    { endpoint: 'POST /api/v1/payments/verify-razorpay', requests: '9,450', responseTime: '110ms', errors: '0.02%', status: 'Normal' },
    { endpoint: 'GET /api/v1/theatres/availability', requests: '32,100', responseTime: '28ms', errors: '0.00%', status: 'Fast' }
  ];

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
          <FiActivity size={22} className="text-primary" />
          <span>Real-time Platform Infrastructure Health</span>
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Live hardware telemetry, database connection pools, queue backlogs, and API response metrics.
        </p>
      </div>

      {/* Grid of Health Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {healthMetrics.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <Card key={idx} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <IconComp size={20} />
                </div>
                <span className="text-[10px] font-black uppercase text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  {item.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-bold">{item.title}</p>
                <p className="text-lg font-black text-text-primary mt-0.5">{item.value}</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(item.bar, 100)}%` }} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* API Performance Monitor Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-extrabold text-base text-text-primary flex items-center gap-2">
            <FiZap size={18} className="text-amber-500" />
            <span>API Gateway Latency & Throughput Monitor</span>
          </h4>
          <span className="text-xs text-text-secondary font-bold">Refreshed: Live Socket</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-xs font-black text-text-secondary uppercase">
                <th className="px-4 py-3">API Route Endpoint</th>
                <th className="px-4 py-3">24h Requests</th>
                <th className="px-4 py-3">Avg Latency</th>
                <th className="px-4 py-3">Error Rate</th>
                <th className="px-4 py-3">Performance Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {apiMonitorStats.map((api, idx) => (
                <tr key={idx} className="hover:bg-hover-bg/30">
                  <td className="px-4 py-3 font-mono font-bold text-text-primary">{api.endpoint}</td>
                  <td className="px-4 py-3 font-bold text-text-secondary">{api.requests}</td>
                  <td className="px-4 py-3 font-mono font-bold text-primary">{api.responseTime}</td>
                  <td className="px-4 py-3 font-mono text-green-700 font-bold">{api.errors}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-black rounded-full uppercase">
                      {api.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PlatformHealthGrid;
