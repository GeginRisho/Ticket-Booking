import React, { useState } from 'react';
import { FiFolder, FiFile, FiImage, FiFileText, FiTrash2, FiEdit3, FiEye, FiUpload, FiX, FiCheck } from 'react-icons/fi';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const mockInitialFiles = [
  { id: 'f1', folder: 'Posters', name: 'avatar_fire_and_ash_poster.jpg', type: 'image', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80', date: '2026-07-20' },
  { id: 'f2', folder: 'Posters', name: 'inception_resurrected_poster.jpg', type: 'image', size: '1.8 MB', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80', date: '2026-07-19' },
  { id: 'f3', folder: 'Banners', name: 'homepage_hero_banner_01.webp', type: 'image', size: '4.1 MB', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1000&q=80', date: '2026-07-21' },
  { id: 'f4', folder: 'Theatre Images', name: 'pvr_phoenix_screen1_imax.jpg', type: 'image', size: '3.2 MB', url: 'https://images.unsplash.com/photo-1586899028174-e7098604235b?w=800&q=80', date: '2026-07-18' },
  { id: 'f5', folder: 'Advertisements', name: 'popcorn_combo_promo_banner.png', type: 'image', size: '1.2 MB', url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&q=80', date: '2026-07-15' },
  { id: 'f6', folder: 'Documents', name: 'gst_compliance_audit_2026.pdf', type: 'document', size: '5.4 MB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', date: '2026-07-10' }
];

const FileManagerModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState(mockInitialFiles);
  const [activeFolder, setActiveFolder] = useState('All');
  const [previewFile, setPreviewFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

  const folders = ['All', 'Posters', 'Banners', 'Theatre Images', 'Advertisements', 'Documents'];

  const filteredFiles = activeFolder === 'All' ? files : files.filter(f => f.folder === activeFolder);

  const handleDeleteFile = (id, name) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success(`Deleted asset: ${name}`);
  };

  const handleRenameFile = (id) => {
    if (!newName.trim()) return;
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    setEditingId(null);
    setNewName('');
    toast.success('Asset renamed successfully!');
  };

  const handleUploadSimulate = () => {
    const newAsset = {
      id: 'f_' + Date.now(),
      folder: activeFolder === 'All' ? 'Posters' : activeFolder,
      name: `new_uploaded_asset_${Date.now()}.jpg`,
      type: 'image',
      size: '2.1 MB',
      url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80',
      date: new Date().toISOString().slice(0,10)
    };
    setFiles([newAsset, ...files]);
    toast.success('New media asset uploaded to S3 bucket');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-border rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-scale-up text-left">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
              <FiFolder size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-text-primary">Central Media Asset Library</h3>
              <p className="text-xs text-text-secondary">S3 Cloud Storage • Movie Posters, Banners, Ads, and KYC Documents</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleUploadSimulate} className="flex items-center gap-1.5">
              <FiUpload size={16} />
              <span>Upload New Media</span>
            </Button>
            <button onClick={onClose} className="p-2 text-text-secondary hover:bg-hover-bg rounded-xl">
              <FiX size={22} />
            </button>
          </div>
        </div>

        {/* Folder Tabs bar */}
        <div className="flex border-b border-border px-6 bg-white gap-2 overflow-x-auto text-xs font-bold py-3">
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeFolder === folder
                  ? 'bg-primary text-text-primary font-black shadow-xs'
                  : 'bg-hover-bg/50 text-text-secondary hover:text-text-primary'
              }`}
            >
              <FiFolder size={14} />
              <span>{folder}</span>
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        <div className="p-6 max-h-[480px] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="p-3 border border-border rounded-2xl bg-white hover:shadow-md transition-all space-y-3 group">
                <div className="h-36 bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <FiFileText size={48} className="text-primary" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-2 bg-white text-gray-900 rounded-full font-bold shadow-md hover:scale-110 transition-transform"
                      title="Preview Asset"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id, file.name)}
                      className="p-2 bg-red-600 text-white rounded-full font-bold shadow-md hover:scale-110 transition-transform"
                      title="Delete Asset"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  {editingId === file.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-1 border rounded text-xs font-bold text-text-primary"
                        autoFocus
                      />
                      <button onClick={() => handleRenameFile(file.id)} className="p-1 bg-green-600 text-white rounded">
                        <FiCheck size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-xs text-text-primary truncate" title={file.name}>{file.name}</p>
                      <button onClick={() => { setEditingId(file.id); setNewName(file.name); }} className="text-text-secondary hover:text-primary p-0.5">
                        <FiEdit3 size={12} />
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[10px] text-text-secondary font-semibold">
                    <span>{file.folder} • {file.size}</span>
                    <span>{file.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden p-6 space-y-4 text-left">
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="font-bold text-base text-text-primary">{previewFile.name}</h4>
                <button onClick={() => setPreviewFile(null)} className="p-1.5 rounded-lg hover:bg-hover-bg">
                  <FiX size={20} />
                </button>
              </div>
              <div className="h-80 flex items-center justify-center bg-gray-100 rounded-2xl overflow-hidden">
                {previewFile.type === 'image' ? (
                  <img src={previewFile.url} alt={previewFile.name} className="h-full object-contain" />
                ) : (
                  <iframe src={previewFile.url} className="w-full h-full" title="PDF Document" />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPreviewFile(null)}>Close Preview</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManagerModal;
