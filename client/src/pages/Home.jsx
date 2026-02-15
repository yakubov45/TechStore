import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';

export default function Home() {
    const { t } = useTranslation();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

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
            title: "Latest Gaming Hardware",
            subtitle: "home.hero.subtitle",
            cta: "home.hero.shopNow",
            image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200"
        },
        {
            title: "Build Your Dream PC",
            subtitle: "home.hero.subtitle",
            cta: "home.hero.shopNow",
            image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200"
        },
        {
            title: "Professional Workstations",
            subtitle: "home.hero.subtitle",
            cta: "home.hero.shopNow",
            image: "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=1200"
        },
        {
            title: "Next-Gen Consoles",
            subtitle: "home.hero.subtitle",
            cta: "home.hero.shopNow",
            image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=1200"
        },
        {
            title: "Immersive Audio",
            subtitle: "home.hero.subtitle",
            cta: "home.hero.shopNow",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200"
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
                                <Link
                                    to="/products"
                                    className={`btn-primary inline-block transition-all duration-700 delay-200 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                        }`}
                                >
                                    {t(slide.cta)}
                                </Link>
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
                <div className="bg-dark-secondary py-12 border-y border-gray-800 my-8 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
                        <div className="flex items-center gap-4 p-6 bg-dark-card rounded-xl border border-gray-800 hover:border-primary transition group">
                            <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{t('home.features.shipping')}</h3>
                                <p className="text-sm text-text-secondary">{t('home.features.shippingDesc')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-dark-card rounded-xl border border-gray-800 hover:border-primary transition group">
                            <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition">
                                <span className="text-2xl">🛡️</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{t('home.features.warranty')}</h3>
                                <p className="text-sm text-text-secondary">{t('home.features.warrantyDesc')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-dark-card rounded-xl border border-gray-800 hover:border-primary transition group">
                            <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition">
                                <span className="text-2xl">💬</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{t('home.features.support')}</h3>
                                <p className="text-sm text-text-secondary">{t('home.features.supportDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

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
                    <div className="max-w-md mx-auto flex gap-2">
                        <input
                            type="email"
                            placeholder={t('home.newsletter.placeholder')}
                            className="input-field flex-1"
                        />
                        <button className="btn-primary">{t('home.newsletter.button')}</button>
                    </div>
                </section>
            </div>
        </div>
    );
}
