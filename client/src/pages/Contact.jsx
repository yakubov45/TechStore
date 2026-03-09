import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Contact() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success(t('contact.successMsg'));
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center">{t('contact.title')}</h1>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Contact Form */}
                <div className="card p-8">
                    <h2 className="text-2xl font-bold mb-6">{t('contact.sendTitle')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2">{t('contact.fields.name')}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">{t('contact.fields.email')}</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">{t('contact.fields.subject')}</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">{t('contact.fields.message')}</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="input-field"
                                rows={5}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            {t('contact.sendButton')}
                        </button>
                    </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <div className="flex items-start gap-4">
                            <Mail className="text-primary mt-1" size={24} />
                            <div>
                                <h3 className="font-bold mb-2">{t('contact.info.emailBox')}</h3>
                                <p className="text-text-secondary">support@techstore.uz</p>
                                <p className="text-text-secondary">sales@techstore.uz</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-start gap-4">
                            <Phone className="text-primary mt-1" size={24} />
                            <div>
                                <h3 className="font-bold mb-2">{t('contact.info.phoneBox')}</h3>
                                <p className="text-text-secondary">+998 90 123 45 67</p>
                                <p className="text-text-secondary">+998 91 765 43 21</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-start gap-4">
                            <MapPin className="text-primary mt-1" size={24} />
                            <div>
                                <h3 className="font-bold mb-2">{t('contact.info.locationBox')}</h3>
                                <p className="text-text-secondary">{t('contact.info.locationDesc1')}</p>
                                <p className="text-text-secondary">{t('contact.info.locationDesc2')}</p>
                                <p className="text-sm text-primary mt-2">{t('contact.info.pickupMsg')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h3 className="font-bold mb-3">{t('contact.workingHours.title')}</h3>
                        <div className="space-y-2 text-text-secondary text-sm">
                            <div className="flex justify-between">
                                <span>{t('contact.workingHours.weekdays')}</span>
                                <span className="text-primary">09:00 - 20:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('contact.workingHours.sunday')}</span>
                                <span className="text-primary">10:00 - 18:00</span>
                            </div>
                        </div>
                    </div>

                    {/* Map Embed */}
                    <div className="card overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2994.887858632688!2d69.34005697551066!3d41.339893400612!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aef48a8ed4d0e9%3A0x3772abeffc72e7b8!2sIT%20Park!5e0!3m2!1sen!2s!4v1709405452243!5m2!1sen!2s"
                            width="100%"
                            height="250"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Store Location Map"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
