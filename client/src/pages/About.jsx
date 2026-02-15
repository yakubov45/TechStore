import { motion } from 'framer-motion';
import { Target, Users, BookOpen, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function About() {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="bg-dark-primary overflow-hidden">
            {/* Hero Section */}
            <div className="relative py-24 bg-dark-secondary/50 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent"
                    >
                        About TechStore
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-text-secondary max-w-2xl mx-auto"
                    >
                        We are more than just a repair shop. We are your partners in technology, providing premium hardware and expert solutions since 2018.
                    </motion.p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto space-y-24"
                >
                    {/* Story & Mission */}
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.section variants={fadeIn} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition"></div>
                            <div className="relative card p-8 bg-dark-card h-full">
                                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-6">
                                    <BookOpen className="text-primary" size={28} />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    Founded in Tashkent, Uzbekistan, TechStore has been serving the tech community with premium computer hardware and IT accessories. We started as a small enthusiast shop and grew into a leading technology provider.
                                </p>
                            </div>
                        </motion.section>

                        <motion.section variants={fadeIn} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-primary rounded-2xl blur opacity-10 group-hover:opacity-30 transition"></div>
                            <div className="relative card p-8 bg-dark-card h-full">
                                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-6">
                                    <Target className="text-primary" size={28} />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    To empower our customers with cutting-edge technology solutions that enhance productivity, creativity, and gaming experiences. We strive to be the most trusted source for computer hardware in Uzbekistan.
                                </p>
                            </div>
                        </motion.section>
                    </div>

                    {/* Stats */}
                    <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Happy Clients', value: '15K+' },
                            { label: 'Products', value: '2.5K+' },
                            { label: 'Years Experience', value: '6+' },
                            { label: 'Service Point', value: '3' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl font-bold text-primary mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-sm text-text-secondary font-medium uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Why Choose Us */}
                    <motion.section variants={fadeIn} className="text-center">
                        <h2 className="text-4xl font-bold mb-12">Nima uchun biz?</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                            {[
                                { title: 'Authentic Products', desc: '100% genuine products from authorized distributors', icon: CheckCircle2 },
                                { title: 'Warranty & Support', desc: 'Comprehensive warranty and after-sales support', icon: CheckCircle2 },
                                { title: 'Expert Advice', desc: 'Knowledgeable staff to help you make the right choice', icon: CheckCircle2 },
                                { title: 'Fast Delivery', desc: 'Quick and reliable delivery across Tashkent', icon: CheckCircle2 }
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-dark-secondary rounded-2xl border border-gray-800 hover:border-primary transition group">
                                    <item.icon className="text-primary mb-4 group-hover:scale-110 transition" size={32} />
                                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-text-secondary">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Location */}
                    <motion.section variants={fadeIn} className="relative rounded-3xl overflow-hidden bg-dark-card border border-gray-800 p-12">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Bizning Manzilimiz</h2>
                                <p className="text-text-secondary mb-8 leading-relaxed">
                                    Visit our showroom in the Tech Park district of Tashkent. Browse products in person, get expert recommendations, and pick up your orders.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <MapPin />
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-secondary uppercase font-bold tracking-wider">Address</p>
                                            <p className="text-white">Tech Park District, Tashkent, Uzbekistan</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Clock />
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-secondary uppercase font-bold tracking-wider">Hours</p>
                                            <p className="text-white">Mon-Sat 09:00-20:00, Sun 10:00-18:00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="aspect-video bg-dark-secondary rounded-2xl overflow-hidden border border-gray-800">
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                                    alt="Office"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
}
