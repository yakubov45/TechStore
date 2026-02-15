import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-dark-secondary border-t border-gray-800 mt-20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-2xl font-bold">T</span>
                            </div>
                            <span className="text-xl font-bold">TechStore</span>
                        </div>
                        <p className="text-text-secondary text-sm mb-4">
                            Your premier destination for computer hardware and IT accessories in Tashkent, Uzbekistan.
                        </p>
                        <div className="flex space-x-3">
                            <a href="https://t.me/techstore" className="p-2 bg-dark-card rounded-lg hover:bg-primary transition">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.098.155.231.171.324.016.093.036.305.02.469z" />
                                </svg>
                            </a>
                            <a href="https://instagram.com/techstore" className="p-2 bg-dark-card rounded-lg hover:bg-primary transition">
                                <Instagram size={20} />
                            </a>
                            <a href="https://youtube.com/techstore" className="p-2 bg-dark-card rounded-lg hover:bg-primary transition">
                                <Youtube size={20} />
                            </a>
                            <a href="https://facebook.com/techstore" className="p-2 bg-dark-card rounded-lg hover:bg-primary transition">
                                <Facebook size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            <li><Link to="/products" className="hover:text-primary transition">Products</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition">Contact</Link></li>
                            <li><Link to="/faq" className="hover:text-primary transition">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li className="flex items-start space-x-2">
                                <Mail size={16} className="mt-1 text-primary" />
                                <div>
                                    <div>support@techstore.uz</div>
                                    <div>sales@techstore.uz</div>
                                </div>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Phone size={16} className="mt-1 text-primary" />
                                <div>
                                    <div>+998 90 123 45 67</div>
                                    <div>+998 91 765 43 21</div>
                                </div>
                            </li>
                            <li className="flex items-start space-x-2">
                                <MapPin size={16} className="mt-1 text-primary" />
                                <div>
                                    Tech Park District<br />
                                    Tashkent, Uzbekistan
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Working Hours */}
                    <div>
                        <h3 className="font-semibold mb-4">Working Hours</h3>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            <li>Monday - Saturday</li>
                            <li className="text-primary">09:00 - 20:00</li>
                            <li className="mt-3">Sunday</li>
                            <li className="text-primary">10:00 - 18:00</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-text-secondary">
                    <p>&copy; 2024 TechStore. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
