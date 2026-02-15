import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useCurrencyStore } from '../store/currencyStore';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

import Reviews from '../components/products/Reviews';

export default function ProductDetails() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [currentImage, setCurrentImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    const addItem = useCartStore(state => state.addItem);
    const { user, addToWishlist, removeFromWishlist } = useAuthStore();
    const { formatPrice } = useCurrencyStore();
    const { t } = useTranslation();

    useEffect(() => {
        fetchProduct();
        if (product) {
            saveToRecentlyViewed(product);
        }
    }, [slug, product?._id]);

    const saveToRecentlyViewed = (prod) => {
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const newItem = {
            _id: prod._id,
            name: prod.name,
            slug: prod.slug,
            image: prod.images?.[0],
            price: prod.price
        };
        const filtered = viewed.filter(item => item._id !== prod._id);
        const updated = [newItem, ...filtered].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    };

    const fetchProduct = async () => {
        try {
            const [productRes, relatedRes] = await Promise.all([
                api.get(`/products/${slug}`),
                api.get(`/products/${slug}/related`)
            ]);
            setProduct(productRes.data.data);
            setRelatedProducts(relatedRes.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        addItem(product, quantity);
        toast.success(t('cart.addedToCart', { count: quantity }));
    };

    const isWishlisted = user?.wishlist?.includes(product?._id);

    const handleWishlist = async () => {
        if (!user) {
            toast.error(t('auth_messages.loginRequired'));
            return;
        }

        try {
            if (isWishlisted) {
                await removeFromWishlist(product._id);
                toast.success(t('auth_messages.removedFromWishlist'));
            } else {
                await addToWishlist(product._id);
                toast.success(t('auth_messages.addedToWishlist'));
            }
        } catch (error) {
            toast.error(t('auth_messages.wishlistFailed'));
        }
    };

    const handleReviewAdded = (updatedReview) => {
        // Optimistically update reviews or re-fetch
        fetchProduct();
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="skeleton h-96"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl">{t('products.notFound')}</h1>
            </div>
        );
    }

    const images = product.images || [];
    const specs = product.specifications ? Object.entries(product.specifications) : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
                {/* Image Gallery */}
                <div>
                    <div className="card overflow-hidden mb-4">
                        <div className="aspect-square bg-dark-secondary relative">
                            {images.length > 0 ? (
                                <>
                                    <img
                                        src={images[currentImage]}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-primary rounded-full"
                                            >
                                                <ChevronLeft />
                                            </button>
                                            <button
                                                onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-primary rounded-full"
                                            >
                                                <ChevronRight />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-600">
                                    {t('products.noImage')}
                                </div>
                            )}
                        </div>
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImage(idx)}
                                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${idx === currentImage ? 'border-primary' : 'border-gray-700'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <p className="text-primary text-sm mb-2">{product.brand?.name}</p>
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center bg-yellow-400/10 px-3 py-1 rounded-full text-yellow-400 border border-yellow-400/20">
                            <Star size={18} className="fill-current mr-2" />
                            <span className="font-bold">{product.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <span className="text-text-secondary text-sm">
                            {product.reviewCount || 0} {t('products.customerReviews')}
                        </span>
                        <div className="h-4 w-px bg-gray-800"></div>
                        <span className="text-xs text-green-500 font-medium">98% would recommend</span>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <div className="text-4xl font-bold text-primary mb-2">
                            {formatPrice(product.price)}
                        </div>
                        {product.comparePrice && product.comparePrice > product.price && (
                            <div className="flex items-center gap-2">
                                <span className="text-xl text-text-secondary line-through">
                                    {formatPrice(product.comparePrice)}
                                </span>
                                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                                    Save {product.discountPercentage}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stock */}
                    <div className="mb-6">
                        {product.stock > 0 ? (
                            <span className="text-green-500">✓ {t('products.inStock', { count: product.stock })}</span>
                        ) : (
                            <span className="text-red-500">✗ {t('products.outOfStock')}</span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-text-secondary mb-6 leading-relaxed">{product.description}</p>

                    {/* Quantity */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold">{t('products.quantity')}</label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border-2 border-gray-700 rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 hover:bg-dark-secondary"
                                >
                                    -
                                </button>
                                <span className="px-6 py-2 border-x-2 border-gray-700">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="px-4 py-2 hover:bg-dark-secondary"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart />
                            {t('products.addToCart')}
                        </button>
                        <button
                            onClick={handleWishlist}
                            className={`px-6 border-2 rounded-lg transition flex items-center justify-center ${isWishlisted
                                ? 'bg-primary border-primary text-white'
                                : 'border-primary text-primary hover:bg-primary hover:text-white'
                                }`}
                        >
                            <Heart fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {/* Specifications */}
                    {specs.length > 0 && (
                        <div className="card p-6">
                            <h3 className="font-bold mb-4">{t('products.specifications')}</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    {specs.map(([key, value], idx) => (
                                        <tr key={idx} className="border-b border-gray-800 last:border-0">
                                            <td className="py-2 text-text-secondary">{key}</td>
                                            <td className="py-2 text-right font-semibold">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <Reviews
                productId={product._id}
                reviews={product.reviews}
                onReviewAdded={handleReviewAdded}
            />

            {/* Related Products */}
                    {relatedProducts.length > 0 && (
                <section>
                    <h2 className="section-title">{t('products.related')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
