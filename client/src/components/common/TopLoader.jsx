import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopLoader() {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // Glow duration
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ width: '0%', opacity: 1 }}
                    animate={{ width: '100%', opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="fixed top-0 left-0 h-[3px] bg-primary z-[9999] shadow-[0_0_15px_theme('colors.primary')]"
                />
            )}
        </AnimatePresence>
    );
}
