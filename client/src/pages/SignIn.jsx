import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function SignIn() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const login = useAuthStore(state => state.login);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            toast.success(t('auth.welcomeBack'));
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || t('auth.loginFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto card p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">{t('nav.signIn')}</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-semibold">{t('auth.email')}</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">{t('auth.password')}</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input-field"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? t('auth.signingIn') : t('nav.signIn')}
                    </button>
                </form>

                <p className="text-center mt-6 text-text-secondary">
                    {t('auth.noAccount')}{' '}
                    <Link to="/signup" className="text-primary hover:underline">
                        {t('auth.signUp')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
