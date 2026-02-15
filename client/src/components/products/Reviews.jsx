import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Reviews({ productId, reviews = [], onReviewAdded }) {
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error(t('reviews.loginRequired'));
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post(`/products/${productId}/reviews`, {
                rating,
                comment
            });

            toast.success('Review submitted successfully');
            setComment('');
            setRating(5);
            if (onReviewAdded) onReviewAdded(response.data.data); // Assuming backend returns the new review or updated product
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">{t('reviews.title')}</h2>

            {/* Add Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-8 border-b border-gray-800 pb-8">
                    <h3 className="text-lg font-semibold mb-4">{t('reviews.writeReview')}</h3>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm text-text-secondary">{t('reviews.rating')}</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`focus:outline-none transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-600'
                                        }`}
                                >
                                    <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm text-text-secondary">{t('reviews.comment')}</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="input-field min-h-[100px]"
                            placeholder={t('reviews.placeholder')}
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary"
                    >
                        {submitting ? t('reviews.submitting') : t('reviews.submit')}
                    </button>
                </form>
            ) : (
                <div className="bg-dark-secondary p-4 rounded-lg mb-8 text-center">
                    <p className="text-text-secondary">
                        {t('reviews.loginRequired')} <a href="/login" className="text-primary hover:underline">{t('nav.signIn')}</a>
                    </p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={review._id || index} className="border-b border-gray-800 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-dark-secondary p-2 rounded-full">
                                        <User size={20} className="text-primary" />
                                    </div>
                                    <span className="font-semibold">
                                        {review.user?.name || 'Anonymous'}
                                    </span>
                                </div>
                                <span className="text-xs text-text-secondary">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}
                                    />
                                ))}
                            </div>
                            <p className="text-text-secondary">{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-text-secondary py-4">{t('reviews.noReviews')}</p>
                )}
            </div>
        </div>
    );
}
