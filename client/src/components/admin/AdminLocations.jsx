import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AdminLocations() {
    const { t } = useTranslation();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        mapUrl: '',
        phone: '',
        workingHours: '09:00 - 20:00',
        isActive: true
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await api.get('/locations/admin');
            setLocations(res.data.data);
        } catch (error) {
            toast.error('Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLocation) {
                await api.put(`/locations/${editingLocation._id}`, formData);
                toast.success('Location updated');
            } else {
                await api.post('/locations', formData);
                toast.success('Location added');
            }
            setIsModalOpen(false);
            setEditingLocation(null);
            fetchLocations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save location');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this location?')) return;
        try {
            await api.delete(`/locations/${id}`);
            toast.success('Location deleted');
            fetchLocations();
        } catch (error) {
            toast.error('Failed to delete location');
        }
    };

    const openModal = (location = null) => {
        if (location) {
            setEditingLocation(location);
            setFormData({
                name: location.name,
                address: location.address,
                mapUrl: location.mapUrl || '',
                phone: location.phone || '',
                workingHours: location.workingHours || '09:00 - 20:00',
                isActive: location.isActive
            });
        } else {
            setEditingLocation(null);
            setFormData({
                name: '',
                address: '',
                mapUrl: '',
                phone: '',
                workingHours: '09:00 - 20:00',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="text-primary" /> Store Locations
                </h2>
                <button
                    onClick={() => openModal()}
                    className="btn-primary px-4 py-2 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Location
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map(loc => (
                    <div key={loc._id} className="card p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold">{loc.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded ${loc.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {loc.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openModal(loc)}
                                    className="p-2 hover:bg-primary/20 rounded transition"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(loc._id)}
                                    className="p-2 hover:bg-red-500/20 text-red-500 rounded transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-text-secondary">
                            <p><strong>Address:</strong> {loc.address}</p>
                            <p><strong>Phone:</strong> {loc.phone || '-'}</p>
                            <p><strong>Hours:</strong> {loc.workingHours}</p>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-card rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl p-6">
                        <h3 className="text-xl font-bold mb-4">
                            {editingLocation ? 'Edit Location' : 'Add Location'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Map URL (Google Maps embed link)</label>
                                <input
                                    type="url"
                                    value={formData.mapUrl}
                                    onChange={e => setFormData({ ...formData, mapUrl: e.target.value })}
                                    className="input-field"
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Working Hours</label>
                                    <input
                                        type="text"
                                        value={formData.workingHours}
                                        onChange={e => setFormData({ ...formData, workingHours: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-primary focus:ring-primary rounded border-gray-600 bg-dark-secondary"
                                />
                                <span>Active Location</span>
                            </label>

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary px-4 py-2 text-sm">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
