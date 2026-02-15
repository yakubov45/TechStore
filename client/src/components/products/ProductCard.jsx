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

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{discount}%
                    </div>
                )}

                {/* Stock Badge */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-red-500 font-bold text-lg">Out of Stock</span>
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
                <div className="flex items-center space-x-1 mb-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(product.averageRating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-600'
                                    }`}
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-xs text-text-secondary">
                        ({product.reviewCount || 0})
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
