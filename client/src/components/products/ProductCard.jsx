import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../utils/image';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
    const addItem = useCartStore(state => state.addItem);
    const { user, addToWishlist, removeFromWishlist } = useAuthStore();
    const { formatPrice } = useCurrencyStore();
    const { t } = useTranslation();

    const handleAddToCart = (e) => {
        e.preventDefault();

        // Start flying image animation to cart
        try {
            const cartBtn = document.getElementById('nav-cart-button');
            const imgEl = e.currentTarget.closest('.product-card')?.querySelector('img');
            if (cartBtn && imgEl) {
                const imgRect = imgEl.getBoundingClientRect();
                const cartRect = cartBtn.getBoundingClientRect();

                const fly = imgEl.cloneNode(true);
                fly.style.position = 'fixed';
                fly.style.left = `${imgRect.left}px`;
                fly.style.top = `${imgRect.top}px`;
                fly.style.width = `${imgRect.width}px`;
                fly.style.height = `${imgRect.height}px`;
                fly.style.transition = 'transform 700ms cubic-bezier(.2,.8,.2,1), opacity 700ms';
                fly.style.zIndex = 9999;
                fly.style.borderRadius = '8px';
                document.body.appendChild(fly);

                requestAnimationFrame(() => {
                    const translateX = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
                    const translateY = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);
                    fly.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.2)`;
                    fly.style.opacity = '0.6';
                });

                setTimeout(() => {
                    try { document.body.removeChild(fly); } catch (err) { }
                    // brief cart icon pop
                    cartBtn.classList.add('cart-pop');
                    setTimeout(() => cartBtn.classList.remove('cart-pop'), 400);
                }, 750);
            }
        } catch (err) {
            // ignore animation errors
            console.warn('Cart animation error', err);
        }

        addItem(product, 1);
        toast.success('Added to cart!');
    };

    const isWishlisted = user?.wishlist?.includes(product._id);

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to use wishlist');
            return;
        }

        try {
            if (isWishlisted) {
                await removeFromWishlist(product._id);
                toast.success('Removed from wishlist');
            } else {
                await addToWishlist(product._id);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        }
    };

    const discount = product.discountPercentage || 0;

    return (
        <Link
            to={`/product/${product.slug}`}
            className="product-card group"
        >
            {/* Image */}
            <div className="relative overflow-hidden bg-dark-secondary aspect-square">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = '/placeholder.png'; e.target.onerror = null; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        {t('products.noImage')}
                    </div>
                )}

                {/* Dynamic Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                    {product.badge && (
                        <div className="bg-red-600 text-white px-3 py-1 rounded-br-xl text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            {product.badge}
                        </div>
                    )}
                    {product.isNewProduct && (
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-br-xl text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            NEW
                        </div>
                    )}
                    {product.averageRating >= 4.5 && (
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-br-xl text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            HOT
                        </div>
                    )}
                </div>

                {/* Stock Badge */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <span className="text-white font-bold text-sm bg-red-600 px-4 py-2 rounded-full shadow-glow">{t('products.outOfStock')}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Brand */}
                {product.brand && (
                    <p className="text-xs text-primary mb-1">{product.brand.name}</p>
                )}

                {/* Name */}
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center bg-yellow-400/10 px-2 py-0.5 rounded text-yellow-400">
                        <span className="text-xs font-bold mr-1">{product.averageRating || '0.0'}</span>
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                    </div>
                    <span className="text-[10px] text-text-secondary">
                        ({product.reviewCount || 0} {t('products.customerReviews', 'reviews')})
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-end justify-between mb-3">
                    <div className="flex flex-col gap-0.5">
                        {product.comparePrice && product.comparePrice > product.price ? (
                            <>
                                {/* Original price with strikethrough */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-text-secondary line-through">
                                        {formatPrice(product.comparePrice)}
                                    </span>
                                    <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                                        -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                                    </span>
                                </div>
                                {/* Discounted (current) price */}
                                <div className="text-lg font-bold text-primary">
                                    {formatPrice(product.price)}
                                </div>
                            </>
                        ) : (
                            <div className="text-lg font-bold text-primary">
                                {formatPrice(product.price)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-[1fr_auto] gap-2 lg:flex lg:space-x-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="btn-primary py-1.5 md:py-2 text-[10px] sm:text-[11px] md:text-sm px-2 sm:px-3 flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate whitespace-nowrap">{t('products.addToCart')}</span>
                    </button>
                    <button
                        onClick={handleWishlist}
                        className={`p-1.5 sm:p-2 border-2 rounded-lg transition flex-shrink-0 flex items-center justify-center ${isWishlisted
                            ? 'bg-primary border-primary text-white'
                            : 'border-primary text-primary hover:bg-primary hover:text-white'
                            }`}
                    >
                        <Heart size={16} className="md:w-5 md:h-5" fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </Link>
    );
}
