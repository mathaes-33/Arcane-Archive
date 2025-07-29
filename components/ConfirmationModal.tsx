import React, { useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 250 } },
  exit: { opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.15 } },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    modalRef.current?.focus();
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 outline-none"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <motion.div
        className="relative w-full max-w-md bg-void border border-gold-800 rounded-lg shadow-2xl shadow-gold-900/20 flex flex-col overflow-hidden"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="confirmation-title" className="font-serif text-xl font-bold text-gold-200 tracking-wider">{title}</h2>
          <p className="mt-2 text-stone-300 font-sans">{message}</p>
        </div>
        <div className="p-4 bg-black/20 flex justify-end gap-3 border-t border-gold-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent text-gold-300 rounded-md border border-gold-800 font-serif tracking-wider text-sm transition-all duration-300 ease-in-out hover:bg-gold-900/50 hover:border-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void focus:ring-gold-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-800 text-red-100 rounded-md border border-red-700 font-serif tracking-wider text-sm transition-all duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void focus:ring-red-500"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};