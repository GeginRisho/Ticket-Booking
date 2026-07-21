import React, { useState } from 'react';
import { FiTerminal, FiDownload, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const mockLogsData = [
  { id: 'l1', cat: 'Backend', level: 'INFO', time: '2026-07-21 10:22:01', msg: '[HTTP 200] GET /api/v1/movies/now-showing completed in 18ms' },
  { id: 'l2', cat: 'Payment', level: 'INFO', time: '2026-07-21 10:21:44', msg: '[Razorpay Webhook] Received payment.captured event for order_Nzs8839042' },
  { id: 'l3', cat: 'Auth', level: 'INFO', time: '2026-07-21 10:20:12', msg: '[AuthContext] Super Admin session authenticated from IP 182.73.94.12' },
  { id: 'l4', cat: 'Error', level: 'ERROR', time: '2026-07-21 10:18:30', msg: '[PostgreSQL] Slow query detected (480ms): SELECT * FROM seats WHERE show_id = 9024' },
  { id: 'l5', cat: 'Database', level: 'WARN', time: '2026-07-21 10:15:00', msg: '[Redis] Connection pool usage reached 78% capacity on primary node' },
  { id: 'l6', cat: 'Frontend', level: 'INFO', time: '2026-07-21 10:10:05', msg: '[Vite Dev Client] Hot Module Replacement (HMR) reloaded DashboardLayout.jsx' }
];

const SystemLogViewer = () => {
  const [logs, setLogs] = useState(mockLogsData);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [search, setSearch] = useState('');

  const categories = ['ALL', 'Frontend', 'Backend', 'Database', 'Payment', 'Auth', 'Error'];
  const levels = ['ALL', 'INFO', 'WARN', 'ERROR'];

  const filteredLogs = logs.filter(l => {
    const matchesCat = selectedCat === 'ALL' || l.cat === selectedCat;
    const matchesLevel = selectedLevel === 'ALL' || l.level === selectedLevel;
    const matchesSearch = l.msg.toLowerCase().includes(search.toLowerCase()) || l.time.includes(search);
    return matchesCat && matchesLevel && matchesSearch;
  });

  const handleDownloadLogs = () => {
    const text = filteredLogs.map(l => `[${l.time}] [${l.level}] [${l.cat}] ${l.msg}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticketshow_system_logs_${selectedCat.toLowerCase()}.log`;
    a.click();
    toast.success('Log export file downloaded!');
  };

  const handleClearLogs = () => {
    setLogs([]);
    toast.success('Logs console cleared');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <FiTerminal size={22} className="text-primary" />
            <span>Real-time System Logs Console</span>
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Unified live log stream across Frontend, Backend, Database, Payment Webhooks, and Security Events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleClearLogs} className="flex items-center gap-1.5">
            <FiTrash2 size={16} />
            <span>Clear Console</span>
          </Button>
          <Button onClick={handleDownloadLogs} className="flex items-center gap-1.5">
            <FiDownload size={16} />
            <span>Download Logs (.log)</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white border border-border rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={16} className="absolute left-3 top-3 text-text-secondary" />
          <input
            type="text"
            placeholder="Search log messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-hover-bg/30 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold">
          <span className="text-text-secondary mr-1">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedCat === cat ? 'bg-primary text-text-primary border-primary font-black' : 'bg-white text-text-secondary hover:border-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold">
          <span className="text-text-secondary mr-1">Level:</span>
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedLevel === lvl ? 'bg-gray-900 text-white border-gray-900 font-black' : 'bg-white text-text-secondary hover:border-text-primary'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal View Container */}
      <div className="bg-slate-950 text-emerald-400 p-6 rounded-3xl font-mono text-xs shadow-2xl border border-slate-800 space-y-2 max-h-[460px] overflow-y-auto">
        <div className="text-slate-500 border-b border-slate-800 pb-2 mb-4 text-[11px] font-bold">
          -- TicketShow Enterprise Production Log Stream [Tail Log Stream] --
        </div>
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 hover:bg-slate-900/80 p-1.5 rounded-lg transition-colors leading-relaxed">
              <span className="text-slate-500 shrink-0 font-bold">{log.time}</span>
              <span className={`px-1.5 py-0.2 rounded font-black text-[10px] uppercase shrink-0 ${
                log.level === 'ERROR' ? 'bg-red-900 text-red-300' :
                log.level === 'WARN' ? 'bg-amber-900 text-amber-300' : 'bg-slate-800 text-cyan-300'
              }`}>
                {log.level}
              </span>
              <span className="text-slate-400 shrink-0 font-bold">[{log.cat}]</span>
              <span className="text-slate-200 font-semibold">{log.msg}</span>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-500 font-semibold">
            No system log entries matching current search filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogViewer;
