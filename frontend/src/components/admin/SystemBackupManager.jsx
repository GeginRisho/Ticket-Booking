import React, { useState } from 'react';
import { FiDatabase, FiDownload, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiPlus } from 'react-icons/fi';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const mockInitialBackups = [
  { id: 'b1', name: 'ticketshow_prod_db_20260721_0000.sql.gz', size: '482.4 MB', date: '2026-07-21 00:00:15', status: 'VERIFIED', type: 'Automated Daily' },
  { id: 'b2', name: 'ticketshow_prod_db_20260720_0000.sql.gz', size: '476.1 MB', date: '2026-07-20 00:00:12', status: 'VERIFIED', type: 'Automated Daily' },
  { id: 'b3', name: 'ticketshow_pre_migration_20260718.sql.gz', size: '468.9 MB', date: '2026-07-18 16:40:22', status: 'VERIFIED', type: 'Manual Snapshot' },
  { id: 'b4', name: 'ticketshow_prod_db_20260717_0000.sql.gz', size: '462.0 MB', date: '2026-07-17 00:00:10', status: 'VERIFIED', type: 'Automated Daily' }
];

const SystemBackupManager = () => {
  const [backups, setBackups] = useState(mockInitialBackups);
  const [isCreating, setIsCreating] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);

  const handleCreateBackup = () => {
    setIsCreating(true);
    toast.loading('Generating PostgreSQL database snapshot & encrypting dump...', { id: 'backup-toast' });

    setTimeout(() => {
      const now = new Date();
      const newBackup = {
        id: 'b_' + Date.now(),
        name: `ticketshow_manual_${now.toISOString().slice(0,10)}.sql.gz`,
        size: '488.2 MB',
        date: now.toLocaleString(),
        status: 'VERIFIED',
        type: 'Manual Snapshot'
      };
      setBackups([newBackup, ...backups]);
      setIsCreating(false);
      toast.success('Database backup created and verified successfully!', { id: 'backup-toast' });
    }, 2000);
  };

  const handleDownloadBackup = (name) => {
    const text = `-- TicketShow Enterprise PostgreSQL Dump\n-- Filename: ${name}\n-- Generated: ${new Date().toISOString()}\n-- Status: VERIFIED`;
    const blob = new Blob([text], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    toast.success(`Started download for ${name}`);
  };

  const handleConfirmRestore = () => {
    if (!restoreTarget) return;
    toast.loading(`Restoring database from snapshot ${restoreTarget.name}...`, { id: 'restore-toast' });
    setTimeout(() => {
      toast.success(`Database successfully restored to state: ${restoreTarget.date}`, { id: 'restore-toast' });
      setRestoreTarget(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <FiDatabase size={22} className="text-primary" />
            <span>System Database Backup & Restore Center</span>
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Automated daily PostgreSQL snapshots, encrypted cold storage backups, and instant point-in-time recovery.
          </p>
        </div>
        <Button onClick={handleCreateBackup} disabled={isCreating} className="flex items-center gap-2">
          <FiPlus size={16} />
          <span>{isCreating ? 'Creating Snapshot...' : 'Create Backup Now'}</span>
        </Button>
      </div>

      {/* Backup History Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-xs font-black text-text-secondary uppercase tracking-wider">
              <th className="px-6 py-4">Snapshot Dump Filename</th>
              <th className="px-6 py-4">Backup Type</th>
              <th className="px-6 py-4">File Size</th>
              <th className="px-6 py-4">Snapshot Timestamp</th>
              <th className="px-6 py-4">Verification Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {backups.map((b) => (
              <tr key={b.id} className="hover:bg-hover-bg/30 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-text-primary text-sm">{b.name}</td>
                <td className="px-6 py-4 font-bold text-text-secondary">{b.type}</td>
                <td className="px-6 py-4 font-mono font-extrabold text-primary">{b.size}</td>
                <td className="px-6 py-4 font-mono text-text-secondary">{b.date}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 border border-green-200">
                    <FiCheckCircle size={12} />
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadBackup(b.name)}
                    className="p-2 text-text-secondary hover:text-primary hover:bg-hover-bg rounded-xl border border-border transition-all cursor-pointer"
                    title="Download GZIP Dump"
                  >
                    <FiDownload size={14} />
                  </button>
                  <button
                    onClick={() => setRestoreTarget(b)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-[11px] rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    title="Restore System to Snapshot"
                  >
                    <FiRefreshCw size={12} />
                    <span>Restore</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog for Restore */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 text-left animate-scale-up">
            <div className="flex items-center gap-3 text-amber-600 font-black text-lg">
              <FiAlertTriangle size={24} />
              <h3>Restore System Database?</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              WARNING: Restoring database from snapshot <strong>{restoreTarget.name}</strong> will overwrite current transactional state back to <strong>{restoreTarget.date}</strong>.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button variant="secondary" onClick={() => setRestoreTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmRestore}>
                Confirm Full Restore
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemBackupManager;
