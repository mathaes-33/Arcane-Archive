import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
    message: string;
    type: 'info' | 'error';
    onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    const bgColor = type === 'error' ? 'bg-red-800/90 border-red-600' : 'bg-gold-800/90 border-gold-600';

    return (
        <AnimatePresence>
            {message && (
                 <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                    className={`fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-2xl z-50 text-gold-100 font-serif tracking-wider text-sm backdrop-blur-sm ${bgColor}`}
                    role="alert"
                 >
                    <div className="flex items-center justify-between gap-4">
                        <p>{message}</p>
                        <button onClick={onDismiss} aria-label="Dismiss" className="p-1 rounded-full hover:bg-white/10 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
