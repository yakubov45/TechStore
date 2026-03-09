import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, LogOut, Settings, Heart, Sun, Moon, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import GlobalSearch from '../search/GlobalSearch';
import StickySearch from '../search/StickySearch';
import CartDrawer from '../cart/CartDrawer';
import LanguageSwitcher from '../common/LanguageSwitcher';
import CurrencySwitcher from '../common/CurrencySwitcher';
import { useCurrencyStore } from '../../store/currencyStore';
import api from '../../services/api';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();
    const itemCount = useCartStore(state => state.getItemCount());
    const { theme, toggleTheme } = useThemeStore();
    const { currency, setCurrency } = useCurrencyStore();
    const menuCloseTimer = useRef(null);
    const mobileMenuRef = useRef(null);
    const location = useLocation();
    const [categories, setCategories] = useState([]);

    // Fetch categories for mobile menu sidebar
    useEffect(() => {
        if (isMenuOpen && categories.length === 0) {
            const fetchCategories = async () => {
                try {
                    const res = await api.get('/categories');
                    setCategories(res.data.data);
                } catch (error) {
                    console.error('Error fetching categories:', error);
                }
            };
            fetchCategories();
        }
    }, [isMenuOpen]);

    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        if (!isMenuOpen) return;

        const handleClickOutside = (e) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    return (
        <nav className="bg-dark-secondary/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold">T</span>
                        </div>
                        <span className="text-xl font-bold text-glow">TechStore</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link to="/" className="hover:text-primary transition font-medium">{t('nav.home')}</Link>
                        <Link to="/products" className="hover:text-primary transition font-medium">{t('nav.products')}</Link>
                        <Link to="/about" className="hover:text-primary transition font-medium">{t('nav.about')}</Link>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <StickySearch globalOpen={isSearchOpen} />
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <div className="hidden sm:block">
                            <LanguageSwitcher />
                        </div>
                        <div className="hidden sm:block">
                            <CurrencySwitcher />
                        </div>

                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="md:hidden p-1.5 hover:text-primary transition relative group"
                        >
                            <Search size={18} />
                        </button>

                        {isAuthenticated && (
                            <Link to="/profile" className="p-1.5 hover:text-primary transition hidden sm:block">
                                <Heart size={18} />
                            </Link>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="p-1.5 hover:text-primary transition"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <button
                            id="nav-cart-button"
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-1.5 hover:text-primary transition"
                        >
                            <ShoppingCart size={18} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {isAuthenticated ? (
                            <div
                                className="relative"
                                onMouseEnter={() => {
                                    if (window.matchMedia('(hover: hover)').matches) {
                                        clearTimeout(menuCloseTimer.current);
                                        setIsUserMenuOpen(true);
                                    }
                                }}
                                onMouseLeave={() => {
                                    if (window.matchMedia('(hover: hover)').matches) {
                                        menuCloseTimer.current = setTimeout(() => setIsUserMenuOpen(false), 3000);
                                    }
                                }}
                            >
                                <button className="flex items-center space-x-2 p-1.5 hover:text-primary transition" onClick={() => setIsUserMenuOpen(v => !v)}>
                                    <User size={18} />
                                    <span className="hidden md:block">{user?.name}</span>
                                </button>
                                <div className={`absolute right-0 mt-2 w-48 bg-dark-card border border-gray-800 rounded-lg shadow-lg transition-opacity duration-500 ${isUserMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                                    <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 hover:bg-dark-secondary">Profile</Link>
                                    {['admin', 'assistant'].includes(user?.role) && (
                                        <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 hover:bg-dark-secondary text-primary">{t('nav.admin', 'Admin Panel')}</Link>
                                    )}
                                    {['admin', 'delivery'].includes(user?.role) && (
                                        <Link to="/delivery" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 hover:bg-dark-secondary text-green-500">{t('nav.delivery', 'Delivery Panel')}</Link>
                                    )}
                                    <button
                                        onClick={async () => { setIsUserMenuOpen(false); await handleLogout(); }}
                                        className="block w-full text-left px-4 py-2 hover:bg-dark-secondary"
                                    >
                                        {t('nav.logout')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/signin" className="btn-primary px-4 py-2 text-sm hidden md:block">
                                {t('nav.signIn')}
                            </Link>
                        )}

                        <button className="md:hidden p-1.5" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Sidebar (Dark Theme like Image) */}
                <div
                    className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />

                    {/* Sidebar container */}
                    <div
                        className={`absolute top-0 bottom-0 left-0 w-[85vw] max-w-[350px] bg-bg-base shadow-2xl transition-transform duration-300 transform flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-bg-secondary">
                            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                                <span className="text-xl font-bold tracking-tight text-white uppercase flex items-center">
                                    Tech<span className="text-primary transform -skew-x-12 ml-0.5">Store</span>
                                </span>
                            </Link>
                            <button aria-label="Close menu" className="p-1 text-gray-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
                                <X size={22} />
                            </button>
                        </div>

                        {/* Top shortcuts with subtle active line indicator */}
                        <div className="flex items-center gap-6 px-6 py-4 border-b border-border/60 relative bg-bg-secondary">
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors text-[13px] font-medium group">
                                <Heart size={16} className="text-primary group-hover:text-primary/80 transition-colors" />
                                <span>{t('nav.wishlist', 'Избранное')}</span>
                            </Link>

                            <button onClick={() => { setIsMenuOpen(false); setIsCartOpen(true); }} className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors text-[13px] font-medium group">
                                <ShoppingCart size={16} className="text-primary group-hover:text-primary/80 transition-colors" />
                                <span>{t('nav.cart', 'Корзина')}</span>
                            </button>

                            {/* Blue active line under first tab simulating the image's style */}
                            <div className="absolute bottom-0 left-6 w-20 h-0.5 bg-primary/80 rounded-t-sm"></div>
                        </div>

                        {/* Locale/Currency Utils */}
                        <div className="flex items-center justify-between px-6 py-3 border-b border-border/60 bg-bg-secondary/50">
                            <div className="flex bg-bg-card rounded-md border border-border overflow-hidden">
                                <button onClick={() => i18n.changeLanguage('uz')} className={`px-2 py-1 text-[10px] font-bold transition-colors ${i18n.language?.startsWith('uz') ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>UZB</button>
                                <button onClick={() => i18n.changeLanguage('ru')} className={`px-2 py-1 text-[10px] font-bold border-l border-r border-border transition-colors ${i18n.language?.startsWith('ru') ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>RUS</button>
                                <button onClick={() => i18n.changeLanguage('en')} className={`px-2 py-1 text-[10px] font-bold transition-colors ${i18n.language?.startsWith('en') ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>ENG</button>
                            </div>

                            <div className="flex bg-bg-card rounded-md border border-border overflow-hidden">
                                <button onClick={() => setCurrency('UZS')} className={`px-2 py-1 text-[10px] font-bold transition-colors ${currency === 'UZS' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>UZS</button>
                                <button onClick={() => setCurrency('USD')} className={`px-2 py-1 text-[10px] font-bold border-l border-border transition-colors ${currency === 'USD' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>USD</button>
                            </div>
                        </div>

                        {/* Top Pages Links */}
                        <div className="grid grid-cols-3 gap-2 px-6 py-3 border-b border-border/60 bg-bg-secondary/50 text-center">
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-text-secondary hover:text-text-primary text-[11px] font-semibold tracking-wide uppercase py-1 transition-colors">
                                {t('nav.products', 'Products')}
                            </Link>
                            <Link to="/faq" onClick={() => setIsMenuOpen(false)} className="text-text-secondary hover:text-text-primary text-[11px] font-semibold tracking-wide uppercase py-1 transition-colors border-l border-r border-border/50">
                                {t('nav.faq', 'FAQ')}
                            </Link>
                            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-text-secondary hover:text-text-primary text-[11px] font-semibold tracking-wide uppercase py-1 transition-colors">
                                {t('nav.contact', 'Contact')}
                            </Link>
                        </div>

                        {/* Scrollable Categories List */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-2 bg-bg-base">
                            <Link
                                to="/products"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-between px-6 py-3.5 text-gray-100 hover:bg-white/5 transition-colors group"
                            >
                                <span className="font-bold text-[14px]">All Products</span>
                                <ChevronRight size={16} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                            </Link>

                            {categories.map(cat => (
                                <Link
                                    key={cat._id}
                                    to={`/products?category=${cat._id}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between px-6 py-3.5 text-gray-200 hover:bg-white/5 transition-colors group"
                                >
                                    <span className="font-semibold text-[14px]">
                                        {t(`categories.names.${cat.name.toLowerCase()}`, cat.name)}
                                    </span>
                                    <ChevronRight size={16} className="text-gray-500 group-hover:text-gray-300 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>

                        {/* Footer Options */}
                        <div className="border-t border-border/80 p-5 bg-bg-secondary">
                            {isAuthenticated ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-white font-bold">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{user?.name}</p>
                                            <p className="text-xs text-gray-400">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex-1 btn-secondary text-center text-sm py-2 bg-dark-card border border-gray-700">Profile</Link>
                                        <button
                                            onClick={async () => { setIsMenuOpen(false); await handleLogout(); }}
                                            className="flex-1 btn-primary text-center text-sm py-2 bg-red-600/20 text-red-500 border border-red-900/50 hover:bg-red-600/30"
                                        >
                                            {t('nav.logout')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/signin" onClick={() => setIsMenuOpen(false)} className="btn-primary w-full text-center text-sm py-3 flex items-center justify-center gap-2 rounded-xl">
                                    <User size={18} />
                                    {t('nav.signIn')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Search and Cart Modals */}
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </nav>
    );
}
