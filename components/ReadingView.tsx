/**
 * @file A modal component that provides an immersive, full-screen reading experience.
 * It is designed for displaying the `textContent` of archived manuscripts with clean typography.
 */
import React, { useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { Book } from '@/types';
import { XIcon } from '@/components/Icons';

interface ReadingViewProps {
  book: Book;
  onClose: () => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.3, ease: 'easeIn' } },
};

export const ReadingView: React.FC<ReadingViewProps> = ({ book, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Effect for handling keyboard interactions (Escape key to close)
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    // Focus the modal content for accessibility, allowing scrolling with arrow keys
    modalRef.current?.focus();

    // Prevent body from scrolling while the reader is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 bg-void/95 backdrop-blur-md z-50 flex flex-col"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-view-title"
    >
        <header className="flex-shrink-0 w-full max-w-4xl mx-auto p-4 flex items-center justify-between text-stone-300 z-10">
            <div className="font-serif">
                <h2 id="reading-view-title" className="text-xl font-bold text-gold-200">{book.title}</h2>
                <p className="text-sm text-stone-400">{book.author}</p>
            </div>
            <button
                onClick={onClose}
                aria-label="Close reader"
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
                <XIcon className="w-6 h-6" />
            </button>
        </header>

        <div 
            ref={modalRef}
            className="flex-grow overflow-y-auto custom-scrollbar focus:outline-none"
            tabIndex={-1}
        >
            <motion.div 
                className="w-full max-w-4xl mx-auto p-4 sm:p-8 md:p-12"
                variants={contentVariants}
            >
                <div className="prose prose-base sm:prose-lg prose-invert prose-p:font-sans prose-p:leading-relaxed prose-p:text-stone-300 prose-headings:font-serif prose-headings:text-gold-300">
                    {/* Render text content in a div that preserves all whitespace and line breaks */}
                    <div className="whitespace-pre-wrap font-sans">
                        {book.textContent}
                    </div>
                </div>
            </motion.div>
        </div>
    </motion.div>
  );
};

export default ReadingView;
