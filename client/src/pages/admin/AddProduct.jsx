import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, X, Plus, Save, ArrowLeft } from 'lucide-react';

export default function AddProduct() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        sku: '',
        category: '',
        brand: '',
        stock: '',
        featured: false,
        tags: ''
    });

    const [images, setImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Dynamic Specifications State
    const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            toast.error('Admin access required');
            navigate('/');
            return;
        }
        fetchData();
    }, [isAuthenticated, user]);

    const fetchData = async () => {
        try {
            const [categoriesRes, brandsRes] = await Promise.all([
                api.get('/categories'),
                api.get('/brands')
            ]);
            setCategories(categoriesRes.data.data);
            setBrands(brandsRes.data.data);
        } catch (error) {
            toast.error('Failed to load categories/brands');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreview(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    // Specification Handlers
    const addSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    const removeSpecification = (index) => {
        const newSpecs = [...specifications];
        newSpecs.splice(index, 1);
        setSpecifications(newSpecs);
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create FormData object for file upload
            const data = new FormData();

            // Append basic fields
            Object.keys(formData).forEach(key => {
                if (key === 'tags') {
                    // Split tags by comma and trim
                    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                    tagsArray.forEach(tag => data.append('tags[]', tag));
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append specifications as JSON string
            const specsMap = specifications.reduce((acc, curr) => {
                if (curr.key && curr.value) acc[curr.key] = curr.value;
                return acc;
            }, {});
            data.append('specifications', JSON.stringify(specsMap));

            // Append images
            images.forEach(image => {
                data.append('images', image);
            });

            await api.post('/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Product created successfully!');
            navigate('/admin');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition"
            >
                <ArrowLeft size={20} />
                Back to Dashboard
            </button>

            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-glow">Add New Product</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="card p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g. RTX 4090 Gaming OC"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">SKU</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g. GPU-ASUS-4090"
                                    required
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="input-field resize-none"
                                    placeholder="Product description..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="card p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Pricing & Inventory</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (USD)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-3 pt-8">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                                />
                                <label className="text-sm font-medium">Featured Product</label>
                            </div>
                        </div>
                    </div>

                    {/* Categorization */}
                    <div className="card p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Categorization</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="input-field appearance-none"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Brand</label>
                                <select
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="input-field appearance-none"
                                    required
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map(brand => (
                                        <option key={brand._id} value={brand._id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g. gaming, rgb, wireless"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="card p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <h2 className="text-xl font-semibold">Specifications</h2>
                            <button
                                type="button"
                                onClick={addSpecification}
                                className="text-primary hover:text-primary-dark text-sm flex items-center gap-1 font-medium"
                            >
                                <Plus size={16} /> Add Spec
                            </button>
                        </div>

                        <div className="space-y-4">
                            {specifications.map((spec, index) => (
                                <div key={index} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={spec.key}
                                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                        placeholder="Key (e.g. Memory)"
                                        className="input-field flex-1"
                                    />
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                        placeholder="Value (e.g. 16GB)"
                                        className="input-field flex-1"
                                    />
                                    {specifications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSpecification(index)}
                                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="card p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Product Images</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Upload Button */}
                            <label className="border-2 border-dashed border-gray-700 hover:border-primary rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer transition hover:bg-dark-secondary group">
                                <Upload className="text-text-secondary group-hover:text-primary mb-2 transition" size={32} />
                                <span className="text-sm text-text-secondary group-hover:text-text-primary">Upload Image</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            {/* Image Previews */}
                            {imagePreview.map((src, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-800">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
