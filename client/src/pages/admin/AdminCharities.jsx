import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', url: '', featured: false });
  const [formError, setFormError] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const { data } = await api.get('/api/charities');
      setCharities(data.charities);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editing) {
        await api.put(`/api/charities/${editing._id}`, formData);
      } else {
        await api.post('/api/charities', formData);
      }
      setEditing(null);
      setFormData({ name: '', description: '', url: '', featured: false });
      fetchCharities();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed.');
    }
  };

  const startEdit = (charity) => {
    setEditing(charity);
    setFormData({
      name: charity.name,
      description: charity.description,
      url: charity.url || '',
      featured: charity.featured,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setFormData({ name: '', description: '', url: '', featured: false });
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this charity?')) return;
    try {
      await api.delete(`/api/charities/${id}`);
      fetchCharities();
    } catch (err) {
      alert('Delete failed.');
    }
  };
  
  const handleFeatureToggle = async (charity) => {
    try {
      await api.put(`/api/charities/${charity._id}`, { ...charity, featured: !charity.featured });
      fetchCharities();
    } catch (err) {
      alert('Toggle failed.');
    }
  };

  const handleUploadImage = async (charityId, file) => {
    if (!file) return;
    setUploadingId(charityId);
    const fd = new FormData();
    fd.append('image', file);

    try {
      await api.post(`/api/charities/${charityId}/image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchCharities();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Charities Management</h1>
      <p className="text-slate-400 mb-8">Add, edit, upload images, and feature charities on the platform.</p>

      {/* Form */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Charity' : 'Add New Charity'}</h3>
        
        {formError && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Charity Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Website URL</label>
              <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-100/50 border border-white/10 rounded-xl px-4 py-2 text-white" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="rounded bg-surface-200 border-white/10 text-brand-500" />
              Featured (Show on Homepage)
            </label>
            <div className="flex gap-2">
              {editing && <button type="button" onClick={cancelEdit} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>}
              <button type="submit" className="px-5 py-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition">
                {editing ? 'Save Changes' : 'Create Charity'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center text-slate-400">Loading...</div>
        ) : charities.map(charity => (
          <div key={charity._id} className="glass rounded-2xl overflow-hidden flex flex-col relative group">
            {charity.featured && (
              <div className="absolute top-2 right-2 z-10 bg-warning text-warning-950 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                FEATURED
              </div>
            )}
            
            <div className="h-40 bg-surface-200 relative">
              {charity.images && charity.images.length > 0 ? (
                <img src={charity.images[0].url} alt={charity.name} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No Image</div>
              )}
              
              {/* Image Upload Overlay */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingId === charity._id ? (
                  <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <button 
                    onClick={() => {
                      fileInputRef.current.setAttribute('data-charity-id', charity._id);
                      fileInputRef.current.click();
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white text-xs font-semibold backdrop-blur"
                  >
                    Upload Image
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-white text-lg mb-1">{charity.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1">{charity.description}</p>
              
              <div className="flex gap-2 justify-between items-center border-t border-white/5 pt-3 mt-auto">
                <button 
                  onClick={() => handleFeatureToggle(charity)} 
                  className={`text-xs font-bold transition-colors ${charity.featured ? 'text-warning hover:text-warning/70' : 'text-slate-500 hover:text-white'}`}
                >
                  {charity.featured ? '★ Unfeature' : '☆ Feature'}
                </button>
                <div className="flex gap-3 text-xs font-semibold text-slate-300">
                  <button onClick={() => startEdit(charity)} className="hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(charity._id)} className="text-danger hover:text-danger/70">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={e => {
          const file = e.target.files[0];
          const cId = e.target.getAttribute('data-charity-id');
          if (file && cId) handleUploadImage(cId, file);
          e.target.value = '';
        }} 
      />
    </div>
  );
}
