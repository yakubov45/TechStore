import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import BrandGrid from '../components/brands/BrandGrid';
import { Shield, Truck, RotateCcw, Headphones, Flame, Zap, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/common/SEO';

export default function Home() {
    const { t, i18n } = useTranslation();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 11, seconds: 8 });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [flashDealsActive, setFlashDealsActive] = useState(false);
    const [allProducts, setAllProducts] = useState([]);

    // Listen for admin toggling flash deals from any tab/panel
    useEffect(() => {
        let channel;
        try {
            channel = new BroadcastChannel('techstore-settings');
            channel.onmessage = (e) => {
                if (e.data?.type === 'flash-deals-toggle') {
                    setFlashDealsActive(e.data.value);
                }
            };
        } catch (_) { }
        return () => channel?.close();
    }, []);

    const handleNewsletterSignup = async (e) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            await api.post('/newsletter/subscribe', { email });
            toast.success(t('home.newsletter.success') || 'Successfully subscribed!');
            setEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to subscribe');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setRecentlyViewed(viewed);
    }, []);

    useEffect(() => {
        fetchData();
    }, [i18n.language]);

    const fetchData = async () => {
        try {
            const [featuredRes, flashRes, categoriesRes, brandsRes, settingsRes, allProductsRes] = await Promise.all([
                api.get('/products?featured=true&limit=8'), // fetch featured products for main section
                api.get('/products?inFlashDeal=true&limit=8'), // fetch flash deal products
                api.get('/categories'),
                api.get('/brands?featured=true'),
                api.get('/settings'),
                api.get('/products?limit=100') // fetch products to group by category
            ]);

            // Use featured products for main section; fall back to latest if none marked featured
            const featured = featuredRes.data.data?.length
                ? featuredRes.data.data
                : flashRes.data.data?.length
                    ? flashRes.data.data
                    : allProductsRes.data?.data?.slice(0, 8) || [];

            setFeaturedProducts(featured);
            setCategories(categoriesRes.data.data);
            setBrands(brandsRes.data.data?.length ? brandsRes.data.data : []);
            if (settingsRes.data?.data) {
                setFlashDealsActive(settingsRes.data.data.flashDealsActive);
            }
            if (allProductsRes.data?.data) {
                setAllProducts(allProductsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const heroSlides = [
        {
            title: 'home.hero.slides.0.title',
            subtitle: 'home.hero.slides.0.subtitle',
            cta1: 'home.hero.cta.shopNow',
            cta2: 'home.hero.cta.viewCatalog',
            image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200'
        },
        {
            title: 'home.hero.slides.1.title',
            subtitle: 'home.hero.slides.1.subtitle',
            cta1: 'home.hero.cta.buildPC',
            cta2: 'home.hero.cta.browseParts',
            image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200'
        },
        {
            title: 'home.hero.slides.2.title',
            subtitle: 'home.hero.slides.2.subtitle',
            cta1: 'home.hero.cta.shopNow',
            cta2: 'home.hero.cta.viewCatalog',
            image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200'
        },
        {
            title: 'home.hero.slides.3.title',
            subtitle: 'home.hero.slides.3.subtitle',
            cta1: 'home.hero.cta.buildPC',
            cta2: 'home.hero.cta.browseParts',
            image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1200'
        },
        {
            title: 'home.hero.slides.4.title',
            subtitle: 'home.hero.slides.4.subtitle',
            cta1: 'home.hero.cta.shopNow',
            cta2: 'home.hero.cta.viewCatalog',
            image: 'https://images.unsplash.com/photo-1542393545-10f5cde2ee44?w=1200'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="skeleton h-96 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton h-64"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <SEO
                title={t('nav.home') || 'Home'}
                description="Welcome to TechStore, the best place for top-tier electronics, laptops, phones, and more."
            />
            {/* Hero Carousel */}
            <section className="relative h-[650px] lg:h-[500px] overflow-hidden">
                {heroSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                            }`}
                        style={{
                            backgroundImage: `linear-gradient(rgba(10, 10, 15, 0.7), rgba(10, 10, 15, 0.7)), url(${slide.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="container mx-auto px-4 h-full flex items-center">
                            <div className="max-w-2xl mt-12 sm:mt-0">
                                <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-glow transition-all duration-700 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}>
                                    {t(slide.title)}
                                </h1>
                                <p className={`text-sm sm:text-base md:text-xl lg:text-2xl text-text-secondary mb-8 transition-all duration-700 delay-100 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}>
                                    {t(slide.subtitle)}
                                </p>
                                <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-200 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}>
                                    <Link to="/products" className="btn-primary px-8 py-3">
                                        {t(slide.cta1)}
                                    </Link>
                                    <Link to="/products" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold transition">
                                        {t(slide.cta2)}
                                    </Link>
                                </div>

                                {/* Mini USPs */}
                                <div className={`mt-8 lg:mt-12 flex flex-wrap gap-4 sm:gap-6 transition-all duration-700 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary italic">✓</div>
                                        {t('home.features.shipping')}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary italic">✓</div>
                                        {t('home.features.support')}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary italic">✓</div>
                                        {t('home.features.warranty')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-primary rounded-full transition-all hover:scale-110"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-primary rounded-full transition-all hover:scale-110"
                >
                    <ChevronRight size={24} />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentSlide
                                ? 'w-8 bg-primary'
                                : 'w-2 bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>

            <div className="container mx-auto px-4">
                {/* Features Section */}
                <div className="py-12 border-y border-gray-800 my-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col items-center text-center p-6 bg-dark-secondary/50 rounded-2xl border border-gray-800 hover:border-primary transition group">
                            <Truck className="text-primary mb-4 group-hover:scale-110 transition" size={32} />
                            <h3 className="font-bold mb-1">{t('home.features.shipping')}</h3>
                            <p className="text-xs text-text-secondary">{t('home.features.shippingDesc')}</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-dark-secondary/50 rounded-2xl border border-gray-800 hover:border-primary transition group">
                            <Shield className="text-primary mb-4 group-hover:scale-110 transition" size={32} />
                            <h3 className="font-bold mb-1">{t('home.features.paymentTitle')}</h3>
                            <p className="text-xs text-text-secondary">{t('home.features.paymentDesc')}</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-dark-secondary/50 rounded-2xl border border-gray-800 hover:border-primary transition group">
                            <RotateCcw className="text-primary mb-4 group-hover:scale-110 transition" size={32} />
                            <h3 className="font-bold mb-1">{t('home.features.returnTitle')}</h3>
                            <p className="text-xs text-text-secondary">{t('home.features.returnDesc')}</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-dark-secondary/50 rounded-2xl border border-gray-800 hover:border-primary transition group">
                            <Headphones className="text-primary mb-4 group-hover:scale-110 transition" size={32} />
                            <h3 className="font-bold mb-1">{t('home.features.warranty')}</h3>
                            <p className="text-xs text-text-secondary">{t('home.features.warrantyDesc')}</p>
                        </div>
                    </div>
                </div>

                {/* Flash Deals Section */}
                {flashDealsActive && (
                    <section className="my-16">
                        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 mb-8 bg-gradient-to-r from-red-600/20 to-transparent p-6 rounded-2xl border border-red-600/30">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full md:w-auto">
                                <h2 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2">
                                    <Zap className="text-red-500 fill-red-500 flex-shrink-0" />
                                    <span className="break-words">{t('home.flashDeals')}</span>
                                </h2>
                                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                    <Clock size={18} className="text-text-secondary flex-shrink-0" />
                                    <div className="flex gap-1 font-mono text-lg sm:text-xl">
                                        <span className="bg-red-600 text-white px-2 rounded">
                                            {timeLeft.hours.toString().padStart(2, '0')}
                                        </span>
                                        <span>:</span>
                                        <span className="bg-red-600 text-white px-2 rounded">
                                            {timeLeft.minutes.toString().padStart(2, '0')}
                                        </span>
                                        <span>:</span>
                                        <span className="bg-red-600 text-white px-2 rounded">
                                            {timeLeft.seconds.toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <span className="text-[10px] sm:text-xs text-text-secondary uppercase ml-1 sm:ml-2 whitespace-nowrap">{t('home.endsIn')}</span>
                                </div>
                            </div>
                            <Link to="/products?sort=discount" className="text-red-500 font-bold hover:underline flex items-center gap-1 self-end md:self-auto text-sm sm:text-base mt-2 md:mt-0">
                                {t('home.viewAll')} <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {featuredProducts.slice(0, 4).map((product, index) => {
                                // Prefer monthlyDiscountPercent if provided (admin-set), otherwise use existing comparePrice-based discount
                                const monthly = product.monthlyDiscountPercent ?? product.monthlyDiscount ?? 0;

                                // Prepare a non-mutating copy to pass to ProductCard
                                const p = { ...product };

                                if (monthly && monthly > 0) {
                                    // Determine original price: prefer comparePrice if present, else use product.price as original
                                    const original = product.comparePrice && product.comparePrice > product.price ? product.comparePrice : product.price;
                                    const discounted = Math.round(original * (1 - monthly / 100));
                                    p.price = discounted;
                                    p.comparePrice = original > discounted ? original : null;
                                    p.badge = `-${monthly}%`;
                                } else if (product.comparePrice && product.comparePrice > product.price) {
                                    // Use existing comparePrice difference
                                    p.badge = `-${product.discountPercentage}%`;
                                }

                                return (
                                    <ProductCard key={product._id} product={p} />
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Smart Filters Chips (removed 'Trending' label per localization request) */}
                {/* If you need chips, they should be generated dynamically from categories or a translated list. */}

                {/* Featured Products */}
                <section className="my-16 animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="section-title mb-0">{t('home.featured')}</h2>
                        <Link to="/products" className="btn-secondary px-4 py-2 text-sm">
                            {t('home.viewAll')}
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {featuredProducts.map((product, index) => (
                            <div
                                key={product._id}
                                className="animate-slide-up"
                                style={{ animationDelay: `${index * 75}ms` }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Brands - visual grid */}
                <section className="my-16 animate-fade-in">
                    <h2 className="section-title">{t('home.brands')}</h2>
                    <div className="mt-6">
                        <BrandGrid brands={brands} />
                    </div>
                </section>

                {/* Categories with Products Grid (Replacing old icon grid) */}
                <section className="my-16 animate-fade-in">
                    {categories.slice(0, 5).map((category, idx) => {
                        // find products for this category
                        const categoryProducts = allProducts.filter(p => p.category?._id === category._id || p.category === category._id);
                        if (categoryProducts.length === 0) return null;

                        return (
                            <div key={category._id} className="mb-12">
                                <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2">
                                    <h2 className="text-2xl pt-2 font-bold relative after:content-[''] after:absolute after:-bottom-[9px] after:left-0 after:w-16 after:h-1 after:bg-primary">
                                        {category.translations?.[i18n.language]?.name || category.name}
                                    </h2>
                                    <Link to={`/category/${category.slug}`} className="text-primary hover:underline text-sm font-medium">
                                        {t('home.viewAll', 'View All')}
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {categoryProducts.slice(0, 5).map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* Newsletter */}
                <section className="my-16 bg-gradient-dark rounded-2xl p-12 text-center neon-border animate-fade-in">
                    <h2 className="text-3xl font-bold mb-4">{t('home.newsletter.title')}</h2>
                    <p className="text-text-secondary mb-6">
                        {t('home.newsletter.desc')}
                    </p>
                    <form onSubmit={handleNewsletterSignup} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
                        <input
                            type="email"
                            placeholder={t('home.newsletter.placeholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field w-full flex-1"
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full sm:w-auto disabled:opacity-50"
                        >
                            {submitting ? t('common.loading') : t('home.newsletter.button')}
                        </button>
                    </form>
                </section>

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                    <section className="my-16">
                        <h2 className="section-title">{t('home.recentlyViewed')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {recentlyViewed.slice(0, 6).map(product => (
                                <Link key={product._id} to={`/product/${product.slug}`} className="bg-dark-secondary/30 p-4 rounded-xl border border-gray-800 hover:border-primary transition group text-center">
                                    <img src={product.image} alt={product.name} className="w-24 h-24 object-contain mx-auto mb-3 group-hover:scale-110 transition" />
                                    <h4 className="text-xs font-medium truncate">{product.name}</h4>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* SEO Block - localized */}
                <section className="my-20 border-t border-gray-800 pt-12 pb-20">
                    <div className="max-w-4xl">
                        <h1 className="text-2xl font-bold mb-6">{t('about.hero.title')}</h1>
                        <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
                            <p>
                                {t('about.hero.subtitle')}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
