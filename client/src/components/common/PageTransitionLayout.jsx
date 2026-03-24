import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PageTransitionLayout() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full"
        >
            <Outlet />
        </motion.div>
    );
}
