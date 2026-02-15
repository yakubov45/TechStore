import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';

export default function OTPVerification() {
    const { user, isAuthenticated } = useAuthStore();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signin');
        }
        if (user?.isEmailVerified) {
            navigate('/profile');
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            toast.error('Iltimos, 6 xonali kodni to\'liq kiriting');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { code });
            toast.success(res.data.message);
            // In a real app, you might want to update the local user state here
            window.location.href = '/profile';
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setResending(true);
        try {
            await api.post('/auth/send-otp');
            toast.success('Kod qaytadan yuborildi');
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } catch (error) {
            toast.error('Kod yuborishda xatolik');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark px-4">
            <div className="max-w-md w-full animate-fade-in">
                <div className="card p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-primary/10 rounded-full text-primary">
                            <ShieldCheck size={48} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">Tasdiqlash kodi</h1>
                    <p className="text-text-secondary mb-8">
                        Biz {user?.email} manziliga 6 xonali tasdiqlash kodini yubordik.
                    </p>

                    <form onSubmit={handleVerify}>
                        <div className="flex justify-between gap-2 mb-8">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-dark-secondary border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all"
                                    required
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : (
                                <>
                                    Tasdiqlash
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-sm">
                        <p className="text-text-secondary">
                            Kod kelmadimi?{' '}
                            {timer > 0 ? (
                                <span className="text-primary font-medium">{timer} soniyadan keyin qayta yuborish mumkin</span>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="text-primary font-bold hover:underline disabled:opacity-50"
                                >
                                    Qayta yuborish
                                </button>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
