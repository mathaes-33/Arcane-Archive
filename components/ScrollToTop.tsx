
/**
 * @file A component that displays a "scroll to top" button when the user
 * has scrolled down the page.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { ArrowUpIcon } from '@/components/Icons';

interface ScrollToTopProps {
    isVisible: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ isVisible }) => {
    const scrollPosition = useScrollPosition();

    // The button should only be shown if modals are not open AND the user has scrolled past 300px.
    const showButton = isVisible && scrollPosition > 300;

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {showButton && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ ease: 'easeInOut', duration: 0.2 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-4 bg-gold-800/80 text-gold-100 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gold-700 hover:bg-gold-700 transition-colors z-40"
                    aria-label="Scroll to top"
                >
                    <ArrowUpIcon className="w-6 h-6" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};