import { useState, useEffect } from 'react';
import { Save, RefreshCw, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useCurrencyStore } from '../../store/currencyStore';

export default function AdminCurrency() {
    const [rate, setRate] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const { fetchExchangeRate, uzsRate } = useCurrencyStore();

    useEffect(() => {
        fetchData();
        fetchExchangeRate(); // Sync store
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/currency');
            if (response.data.success) {
                setRate(response.data.data.rate);
                setLastUpdated(response.data.data.lastUpdated);
            }
        } catch (error) {
            console.error('Error fetching rate:', error);
            toast.error('Failed to fetch current exchange rate');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/currency', { rate: Number(rate) });
            if (response.data.success) {
                toast.success('Exchange rate updated successfully');
                setLastUpdated(Date.now());
                fetchExchangeRate(); // Update global store
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update rate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <DollarSign className="text-primary" />
                Currency Exchange Rate
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <p className="text-text-secondary mb-4">
                        Set the exchange rate for USD to UZS conversion. This rate will be used to calculate prices across the store.
                    </p>

                    <div className="bg-dark-secondary p-4 rounded-lg mb-4 flex items-center justify-between">
                        <div>
                            <span className="text-sm text-text-secondary block">Current Rate</span>
                            <span className="text-2xl font-bold font-mono">1 USD = {uzsRate?.toLocaleString()} UZS</span>
                        </div>
                        {lastUpdated && (
                            <div className="text-right">
                                <span className="text-xs text-text-secondary block">Last Updated</span>
                                <span className="text-sm text-primary">
                                    {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            New Exchange Rate (UZS)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">UZS</span>
                            <input
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="input-field pl-12"
                                placeholder="e.g. 12500"
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                        Update Rate
                    </button>
                </form>
            </div>
        </div>
    );
}
