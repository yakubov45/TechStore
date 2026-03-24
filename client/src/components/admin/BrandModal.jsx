import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function BrandModal({ isOpen, onClose, onSuccess, initialData = null }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        featured: false,
        logo: null
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                featured: initialData.featured || false,
                logo: null
            });
        } else {
            setFormData({ name: '', description: '', featured: false, logo: null });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('featured', formData.featured);
            if (formData.logo) {
                data.append('logo', formData.logo);
            }

            if (initialData) {
                await api.put(`/brands/${initialData._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Brand updated successfully');
            } else {
                await api.post('/brands', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Brand created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="bg-dark-card rounded-2xl w-full max-w-md border border-gray-800 animate-fade-in p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-glow">
                        {initialData ? 'Edit Brand' : 'Add New Brand'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-dark-secondary rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('admin.form.brandName', 'Brand Name')}</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="e.g. ASUS"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('admin.form.description', 'Description')}</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field resize-none"
                            rows="3"
                            placeholder="Brand description..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('admin.form.brandLogo', 'Brand Logo')}</label>
                        {initialData?.logo && !formData.logo && (
                            <div className="mb-2">
                                <img src={initialData.logo} alt="Current logo" className="h-16 w-16 object-cover rounded-lg border border-gray-700 bg-dark-secondary" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, logo: e.target.files[0] })}
                            className="input-field p-2"
                        />
                    </div>

                    <div className="flex items-center space-x-3 py-2">
                        <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="w-5 h-5 accent-primary rounded cursor-pointer"
                        />
                        <label className="text-sm font-medium">{t('admin.form.featuredBrand', 'Featured Brand')}</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary py-2 flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
