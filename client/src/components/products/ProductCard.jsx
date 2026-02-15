import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
    const addItem = useCartStore(state => state.addItem);
    const { user, addToWishlist, removeFromWishlist } = useAuthStore();
    const { formatPrice } = useCurrencyStore();

    const handleAddToCart = (e) => {
        e.preventDefault();
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
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No Image
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
                        <span className="text-white font-bold text-sm bg-red-600 px-4 py-2 rounded-full shadow-glow">Out of Stock</span>
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
                        ({product.reviewCount || 0} reviews)
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-end justify-between mb-3">
                    <div>
                        <div className="text-lg font-bold text-primary">
                            {formatPrice(product.price)}
                        </div>
                        {product.comparePrice && product.comparePrice > product.price && (
                            <div className="text-xs text-text-secondary line-through">
                                {formatPrice(product.comparePrice)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="flex-1 btn-primary py-2 text-sm flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart size={16} />
                        <span>Add to Cart</span>
                    </button>
                    <button
                        onClick={handleWishlist}
                        className={`p-2 border-2 rounded-lg transition ${isWishlisted
                            ? 'bg-primary border-primary text-white'
                            : 'border-primary text-primary hover:bg-primary hover:text-white'
                            }`}
                    >
                        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </Link>
    );
}
