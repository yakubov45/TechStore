import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import { useTranslation } from 'react-i18next';

export default function Category() {
    const { t } = useTranslation();
    const { slug } = useParams();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategory();
    }, [slug]);

    const fetchCategory = async () => {
        try {
            const res = await api.get(`/categories/${slug}`);
            setCategory(res.data.data.category);
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
            <div className="mb-8">
                <div className="text-5xl mb-4">{category?.icon}</div>
                <h1 className="text-4xl font-bold mb-2">{t(`categories.names.${category?.slug}`) || category?.name}</h1>
                <p className="text-text-secondary">{category?.description}</p>
                <p className="text-sm text-primary mt-2">{category?.productCount} {t('common.items')}</p>
            </div>

            {products.length === 0 ? (
                <p className="text-center text-text-secondary py-20">No products in this category</p>
                ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
