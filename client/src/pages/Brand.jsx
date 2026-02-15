import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';

export default function Brand() {
    const { slug } = useParams();
    const [brand, setBrand] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBrand();
    }, [slug]);

    const fetchBrand = async () => {
        try {
            const res = await api.get(`/brands/${slug}`);
            setBrand(res.data.data.brand);
            setProducts(res.data.data.products);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container mx-auto px-4 py-8"><div className="skeleton h-96"></div></div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="card p-8 mb-8">
                <h1 className="text-4xl font-bold mb-4">{brand?.name}</h1>
                <p className="text-text-secondary mb-4">{brand?.description}</p>
                {brand?.website && (
                    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Visit Website
                    </a>
                )}
                <p className="text-sm text-primary mt-4">{brand?.productCount} products</p>
            </div>

            {products.length === 0 ? (
                <p className="text-center text-text-secondary py-20">No products from this brand</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
