

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@/components/Icons';

interface FabProps {
    onClick: () => void;
    label: string;
    isVisible: boolean;
    isDisabled?: boolean;
    disabledTooltip?: string;
}

export const Fab: React.FC<FabProps> = ({ onClick, label, isVisible, isDisabled = false, disabledTooltip }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ ease: 'easeInOut', duration: 0.2 }}
                    // Use a group for the tooltip hover effect
                    className="group fixed bottom-8 left-4 z-40"
                >
                    <button
                        onClick={onClick}
                        disabled={isDisabled}
                        className="bg-gold-800/80 text-gold-100 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gold-700 hover:bg-gold-700 transition-colors disabled:bg-stone-700/50 disabled:text-stone-500 disabled:cursor-not-allowed"
                        aria-label={label}
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                    {/* Tooltip for disabled state */}
                    {isDisabled && disabledTooltip && (
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-void text-stone-200 text-xs font-sans rounded-md shadow-lg border border-gold-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {disabledTooltip}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
