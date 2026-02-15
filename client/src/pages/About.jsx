export default function About() {
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center">About TechStore</h1>

            <div className="max-w-4xl mx-auto space-y-8">
                <section className="card p-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">Our Story</h2>
                    <p className="text-text-secondary leading-relaxed">
                        Founded in Tashkent, Uzbekistan, TechStore has been serving the tech community with premium computer hardware and IT accessories. We are dedicated to providing the latest technology products at competitive prices with exceptional customer service.
                    </p>
                </section>

                <section className="card p-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">Our Mission</h2>
                    <p className="text-text-secondary leading-relaxed">
                        To empower our customers with cutting-edge technology solutions that enhance productivity, creativity, and gaming experiences. We strive to be the most trusted source for computer hardware in Uzbekistan.
                    </p>
                </section>

                <section className="card p-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">Why Choose Us</h2>
                    <div className="grid md:grid-cols-2 gap-6 text-text-secondary">
                        <div>
                            <h3 className="font-semibold text-white mb-2">✓ Authentic Products</h3>
                            <p>100% genuine products from authorized distributors</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2">✓ Warranty & Support</h3>
                            <p>Comprehensive warranty and after-sales support</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2">✓ Expert Advice</h3>
                            <p>Knowledgeable staff to help you make the right choice</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2">✓ Fast Delivery</h3>
                            <p>Quick and reliable delivery across Tashkent</p>
                        </div>
                    </div>
                </section>

                <section className="card p-8">
                    <h2 className="text-2xl font-bold mb-4 text-primary">Our Location</h2>
                    <p className="text-text-secondary mb-4">
                        Visit our showroom in the Tech Park district of Tashkent. Browse products in person, get expert recommendations, and pick up your orders.
                    </p>
                    <div className="text-text-secondary space-y-2">
                        <p><strong>Address:</strong> Tech Park District, Tashkent, Uzbekistan</p>
                        <p><strong>Hours:</strong> Mon-Sat 09:00-20:00, Sun 10:00-18:00</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
