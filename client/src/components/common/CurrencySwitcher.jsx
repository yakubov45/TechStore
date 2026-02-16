import { useState, useRef, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrencyStore();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    const options = [
        { code: 'UZS', label: "UZS" },
        { code: 'USD', label: "USD" }
    ];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 hover:text-primary transition rounded-lg hover:bg-dark-secondary"
                title="Change Currency"
            >
                <DollarSign size={18} />
                <span className="hidden md:inline uppercase text-sm font-semibold">{currency}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-dark-card border border-gray-800 rounded-lg shadow-glow z-50 animate-fade-in overflow-hidden">
                    {options.map(opt => (
                        <button
                            key={opt.code}
                            onClick={() => { setCurrency(opt.code); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-3 hover:bg-dark-secondary transition ${currency === opt.code ? 'text-primary bg-primary/10' : 'text-text-primary'}`}
                        >
                            <span className="font-medium">{opt.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
