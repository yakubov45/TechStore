import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import { Shield, Truck, RotateCcw, Headphones, Flame, Zap, Clock } from 'lucide-react';

export default function Home() {
    const { t } = useTranslation();
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
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes, brandsRes] = await Promise.all([
                api.get('/products/featured'),
                api.get('/categories'),
                api.get('/brands?featured=true')
            ]);

            setFeaturedProducts(productsRes.data.data);
            setCategories(categoriesRes.data.data);
            setBrands(brandsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const heroSlides = [
        {
            title: "Performance Gaming Laptops",
            subtitle: "RTX 40-Series graphics for ultimate performance",
            cta1: "Shop Now",
            cta2: "View Catalog",
            image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200"
        },
        {
            title: "Build Your Dream Setup",
            subtitle: "Custom components for every enthusiast",
            cta1: "Build PC",
            cta2: "Browse Parts",
            image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200"
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
            {/* Hero Carousel */}
            <section className="relative h-[500px] overflow-hidden">
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
                            <div className="max-w-2xl">
                                <h1 className={`text-5xl md:text-6xl font-bold mb-4 text-glow transition-all duration-700 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}>
                                    {slide.title}
                                </h1>
                                <p className={`text-xl md:text-2xl text-text-secondary mb-8 transition-all duration-700 delay-100 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}>
                                    {t(slide.subtitle)}
                                </p>
                                <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-200 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}>
                                    <Link to="/products" className="btn-primary px-8 py-3">
                                        {slide.cta1}
                                    </Link>
                                    <Link to="/products" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold transition">
                                        {slide.cta2}
                                    </Link>
                                </div>

                                {/* Mini USPs */}
                                <div className={`mt-12 flex flex-wrap gap-6 transition-all duration-700 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary italic">✓</div>
                                        Rasmiy kafolat
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary italic">✓</div>
                                        24 soatda yetkazish
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary italic">✓</div>
                                        Qaytarish mavjud
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col items-center text-center p-6 bg-dark-secondary/50 rounded-2xl border border-gray-800 hover:border-primary transition group">
                            <Truck className="text-primary mb-4 group-hover:scale-110 transition" size={32} />
                            <h3 className="font-bold mb-1">Free Delivery 1M+</h3>
                            <p className="text-xs text-text-secondary">On orders over 1,000,000 UZS</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-dark-secondary/50 rounded-2xl border border-gray-800 hover:border-primary transition group">
                            <Shield className="text-primary mb-4 group-hover:scale-110 transition" size={32} />
                            <h3 className="font-bold mb-1">Secure Payment</h3>
                            <p className="text-xs text-text-secondary">100% security guarantee</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-dark-secondary/50 rounded-2xl border border-gray-800 hover:border-primary transition group">
                            <RotateCcw className="text-primary mb-4 group-hover:scale-110 transition" size={32} />
                            <h3 className="font-bold mb-1">7 Day Return</h3>
                            <p className="text-xs text-text-secondary">Easy money back guarantee</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-dark-secondary/50 rounded-2xl border border-gray-800 hover:border-primary transition group">
                            <Headphones className="text-primary mb-4 group-hover:scale-110 transition" size={32} />
                            <h3 className="font-bold mb-1">Official Warranty</h3>
                            <p className="text-xs text-text-secondary">Authorized service centers</p>
                        </div>
                    </div>
                </div>

                {/* Flash Deals Section */}
                <section className="my-16">
                    <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-red-600/20 to-transparent p-6 rounded-2xl border border-red-600/30">
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Zap className="text-red-500 fill-red-500" />
                                Bugungi chegirmalar
                            </h2>
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-text-secondary" />
                                <div className="flex gap-1 font-mono text-xl">
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
                                <span className="text-xs text-text-secondary uppercase ml-2">qoldi</span>
                            </div>
                        </div>
                        <Link to="/products?sort=discount" className="text-red-500 font-bold hover:underline flex items-center gap-1">
                            Barchasini ko'rish <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.slice(0, 4).map((product, index) => (
                            <ProductCard key={product._id} product={{ ...product, badge: `-${Math.floor(Math.random() * 20 + 10)}%` }} />
                        ))}
                    </div>
                </section>

                {/* Smart Filters Chips */}
                <section className="my-12">
                    <div className="flex items-center gap-4 mb-6">
                        <Flame className="text-orange-500" />
                        <h2 className="text-xl font-bold">Trenddagilar:</h2>
                        <div className="flex flex-wrap gap-2">
                            {['Gaming', 'Office', 'Audio', 'Streaming', 'Apple', 'Asus'].map(chip => (
                                <button
                                    key={chip}
                                    onClick={() => setSelectedCategory(chip)}
                                    className={`px-6 py-2 rounded-full border transition-all text-sm font-medium ${selectedCategory === chip
                                        ? 'bg-primary border-primary text-white'
                                        : 'bg-dark-secondary border-gray-800 hover:border-primary'
                                        }`}
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Categories Grid */}
                <section className="my-16 animate-fade-in">
                    <h2 className="section-title">{t('home.categories')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {categories.slice(0, 14).map((category, index) => (
                            <Link
                                key={category._id}
                                to={`/category/${category.slug}`}
                                className="card-glow p-6 text-center group animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="text-4xl mb-3 transition-transform group-hover:scale-125">{category.icon || '📦'}</div>
                                <h3 className="font-semibold text-sm group-hover:text-primary transition">
                                    {category.name}
                                </h3>
                                <p className="text-xs text-text-secondary mt-1">
                                    {category.productCount} items
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Featured Products */}
                <section className="my-16 animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="section-title mb-0">{t('home.featured')}</h2>
                        <Link to="/products" className="btn-secondary px-4 py-2 text-sm">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

                {/* Top Brands */}
                <section className="my-16 animate-fade-in">
                    <h2 className="section-title">{t('home.brands')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {brands.map((brand, index) => (
                            <Link
                                key={brand._id}
                                to={`/brand/${brand.slug}`}
                                className="card-glow p-6 flex items-center justify-center hover:scale-105 transition-transform animate-slide-up"
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">{brand.name}</h3>
                                    <p className="text-xs text-text-secondary mt-1">
                                        {brand.productCount} products
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Newsletter */}
                <section className="my-16 bg-gradient-dark rounded-2xl p-12 text-center neon-border animate-fade-in">
                    <h2 className="text-3xl font-bold mb-4">{t('home.newsletter.title')}</h2>
                    <p className="text-text-secondary mb-6">
                        {t('home.newsletter.desc')}
                    </p>
                    <form onSubmit={handleNewsletterSignup} className="max-w-md mx-auto flex gap-2">
                        <input
                            type="email"
                            placeholder={t('home.newsletter.placeholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field flex-1"
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary disabled:opacity-50"
                        >
                            {submitting ? t('common.loading') : t('home.newsletter.button')}
                        </button>
                    </form>
                </section>

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                    <section className="my-16">
                        <h2 className="section-title">Siz ko'rgan mahsulotlar</h2>
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

                {/* SEO Block */}
                <section className="my-20 border-t border-gray-800 pt-12 pb-20">
                    <div className="max-w-4xl">
                        <h1 className="text-2xl font-bold mb-6">TechStore — kompyuter texnikalari onlayn do'koni</h1>
                        <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
                            <p>
                                TechStore - O'zbekistondagi eng yirik onlayn do'konlardan biri bo'lib, biz mijozlarimizga eng so'nggi va yuqori sifatli kompyuter texnikalarini taklif etamiz. Bizning assortimentimizda noutbuklar, monitorlar, videokartalar, protsessorlar va boshqa ko'plab qurilmalarni hamyonbop narxlarda topishingiz mumkin.
                            </p>
                            <p>
                                Nima uchun aynan bizni tanlashadi?
                                TechStore jamoasi har bir mijozga individual yondashadi. Biz faqat rasmiy kafolatga ega mahsulotlarni sotamiz va Toshkent bo'ylab 24 soat ichida yetkazib berishni kafolatlaymiz. Shuningdek, bizda qulay to'lov tizimlari va muddatli to'lov imkoniyatlari mavjud.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
