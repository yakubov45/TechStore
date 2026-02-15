import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "How long does delivery take?",
            answer: "Standard delivery takes 2-3 business days within Tashkent. Express delivery is available for next-day service. Orders can also be picked up from our showroom."
        },
        {
            question: "What is your warranty policy?",
            answer: "All products come with manufacturer warranty ranging from 1-5 years depending on the product. We also provide after-sales support and can assist with warranty claims."
        },
        {
            question: "Can I return or exchange a product?",
            answer: "Yes, we accept returns within 14 days of purchase if the product is unused and in original packaging. Exchanges can be made within 30 days. Please contact us for the return/exchange process."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept cash on delivery, credit/debit cards, and online payment methods. Payment can be made at the time of delivery or in our showroom."
        },
        {
            question: "How can I track my order?",
            answer: "After placing an order, you can track it from your profile page. You will also receive email notifications about your order status updates."
        },
        {
            question: "Do you build custom PCs?",
            answer: "Yes! We offer custom PC building services. Choose your components and our experts will assemble and test your system before delivery."
        },
        {
            question: "Are all products genuine?",
            answer: "Absolutely! We only sell 100% authentic products from authorized distributors and manufacturers. All products come with proper documentation and warranty."
        },
        {
            question: "Do you offer installation services?",
            answer: "Yes, we provide installation and setup services for certain products. Contact us for more details about available services and pricing."
        },
        {
            question: "How do I create an account?",
            answer: "Click on 'Sign Up' in the top right corner, fill in your details, and verify your email. An account helps you track orders, save wishlists, and get faster checkout."
        },
        {
            question: "What if I receive a damaged product?",
            answer: "If you receive a damaged product, please contact us immediately with photos. We will arrange for a replacement or full refund at no additional cost to you."
        }
    ];

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-4 text-center">Frequently Asked Questions</h1>
            <p className="text-text-secondary text-center mb-12 max-w-2xl mx-auto">
                Find answers to common questions about our products, services, and policies.
            </p>

            <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="card overflow-hidden">
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full p-6 flex items-center justify-between hover:bg-dark-secondary transition"
                        >
                            <span className="font-semibold text-left">{faq.question}</span>
                            {openIndex === index ? (
                                <ChevronUp className="text-primary flex-shrink-0" />
                            ) : (
                                <ChevronDown className="text-primary flex-shrink-0" />
                            )}
                        </button>
                        {openIndex === index && (
                            <div className="px-6 pb-6 text-text-secondary animate-fade-in">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <p className="text-text-secondary mb-4">Still have questions?</p>
                <a href="/contact" className="btn-primary inline-block">
                    Contact Us
                </a>
            </div>
        </div>
    );
}
