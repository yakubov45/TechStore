import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success('Message sent! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Contact Form */}
                <div className="card p-8">
                    <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Message</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="input-field"
                                rows={5}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <div className="flex items-start gap-4">
                            <Mail className="text-primary mt-1" size={24} />
                            <div>
                                <h3 className="font-bold mb-2">Email</h3>
                                <p className="text-text-secondary">support@techstore.uz</p>
                                <p className="text-text-secondary">sales@techstore.uz</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-start gap-4">
                            <Phone className="text-primary mt-1" size={24} />
                            <div>
                                <h3 className="font-bold mb-2">Phone</h3>
                                <p className="text-text-secondary">+998 90 123 45 67</p>
                                <p className="text-text-secondary">+998 91 765 43 21</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-start gap-4">
                            <MapPin className="text-primary mt-1" size={24} />
                            <div>
                                <h3 className="font-bold mb-2">Location</h3>
                                <p className="text-text-secondary">Tech Park District</p>
                                <p className="text-text-secondary">Tashkent, Uzbekistan</p>
                                <p className="text-sm text-primary mt-2">Showroom + Pickup Available</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h3 className="font-bold mb-3">Working Hours</h3>
                        <div className="space-y-2 text-text-secondary text-sm">
                            <div className="flex justify-between">
                                <span>Monday - Saturday</span>
                                <span className="text-primary">09:00 - 20:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sunday</span>
                                <span className="text-primary">10:00 - 18:00</span>
                            </div>
                        </div>
                    </div>

                    {/* Map Embed */}
                    <div className="card overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.9095434072217!2d69.2401!3d41.2995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE3JzU4LjIiTiA2OcKwMTQnMjQuNCJF!5e0!3m2!1sen!2s!4v1234567890"
                            width="100%"
                            height="250"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
