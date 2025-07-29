/**
 * @file A fully accessible, animated slide-in menu for mobile navigation.
 * It handles its own visibility, animations, and focus trapping to meet
 * accessibility standards (WCAG).
 */
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { XIcon } from '@/components/Icons';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const menuVariants: Variants = {
  open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, children }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Effect for accessibility:
   * 1. Traps keyboard focus within the menu when it's open.
   * 2. Adds an event listener to close the menu with the 'Escape' key.
   */
  useEffect(() => {
    if (!isOpen) return;

    const menuNode = menuRef.current;
    if (!menuNode) return;

    // Get all focusable elements inside the menu
    const focusableElements = menuNode.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // Trap focus
      if (e.shiftKey) { // Tabbing backwards
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tabbing forwards
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEsc);
    
    // Focus the first element when the menu opens
    firstElement?.focus();

    // Cleanup listeners on component unmount or when menu closes
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            ref={menuRef}
            className="absolute top-0 left-0 h-full w-full max-w-xs bg-void flex flex-col shadow-2xl shadow-gold-900/40"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the menu from closing it
          >
            <div className="flex items-center justify-between p-4 border-b border-gold-900/50">
                <h2 className="font-serif text-xl text-gold-300 tracking-wider">Categories</h2>
                <button 
                    onClick={onClose} 
                    className="p-2 text-gold-300 hover:text-gold-100 transition-colors"
                    aria-label="Close menu"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
