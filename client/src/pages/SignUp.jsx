import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', general: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const register = useAuthStore(state => state.register);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({ name: '', email: '', phone: '', password: '', confirmPassword: '', general: '' });
        let hasError = false;

        // Basic frontend validation
        if (!formData.name.trim() || /^\d+$/.test(formData.name.trim()) || formData.name.trim().length < 3) {
            setErrors(prev => ({ ...prev, name: t('auth.invalidName', 'Please enter a valid full name (letters only, min 3 chars)') }));
            hasError = true;
        }

        if (!formData.phone || !/^\+998\d{9}$/.test(formData.phone)) {
            setErrors(prev => ({ ...prev, phone: t('auth.invalidPhone', "Iltimos, O'zbekiston raqamini kiriting (+998XXXXXXXXX)") }));
            hasError = true;
        }

        if (formData.password.length < 6) {
            setErrors(prev => ({ ...prev, password: t('auth.passwordLength', 'Password must be at least 6 characters') }));
            hasError = true;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: t('auth.passwordsMismatch') }));
            hasError = true;
        }

        if (hasError) {
            toast.error(t('auth.validationError', 'Please fix the errors in the form'));
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...userData } = formData;
            // include selected language so backend can localize OTP/SMS
            userData.language = i18n.language || 'en';
            await register(userData);
            // Save pending email so OTP verification can be completed without authentication
            localStorage.setItem('pendingEmail', userData.email);
            toast.success(t('auth.accountCreated'));
            navigate('/verify-otp');
        } catch (error) {
            const msg = error.response?.data?.message || t('auth.registrationFailed');

            // Map mongoose errors/API errors to fields
            if (msg.toLowerCase().includes('email')) {
                setErrors(prev => ({ ...prev, email: msg }));
            } else if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('raqam')) {
                setErrors(prev => ({ ...prev, phone: msg }));
            } else if (msg.toLowerCase().includes('password')) {
                setErrors(prev => ({ ...prev, password: msg }));
            } else if (msg.toLowerCase().includes('name')) {
                setErrors(prev => ({ ...prev, name: msg }));
            } else {
                setErrors(prev => ({ ...prev, general: msg }));
            }

            toast.error(t('auth.registrationFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto card p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">{t('auth.signUp')}</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-500 text-sm text-center">{errors.general}</p>
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 font-semibold">{t('auth.fullName')}</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            className={`input-field ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">{t('auth.email')}</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">{t('auth.phone')}</label>
                        <input
                            type="tel"
                            placeholder="+998901234567"
                            value={formData.phone}
                            onChange={(e) => {
                                setFormData({ ...formData, phone: e.target.value });
                                if (errors.phone) setErrors({ ...errors, phone: '' });
                            }}
                            className={`input-field ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">{t('auth.password')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                }}
                                className={`input-field pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">{t('auth.confirmPassword')}</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    setFormData({ ...formData, confirmPassword: e.target.value });
                                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                }}
                                className={`input-field pr-12 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? t('auth.creatingAccount') : t('auth.signUp')}
                    </button>
                </form>

                <p className="text-center mt-6 text-text-secondary">
                    {t('auth.alreadyHaveAccount')}{' '}
                    <Link to="/signin" className="text-primary hover:underline">
                        {t('nav.signIn')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
