

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Book } from '@/types';
import { XIcon } from '@/components/Icons';
import { BOOKS as initialBooks } from '@/constants';
import { ConfirmationModal } from './ConfirmationModal';
import { openFileInNewTab } from '@/lib/utils';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onDelete: (bookId: string) => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 } 
  },
  exit: { 
    opacity: 0, 
    y: 50, 
    scale: 0.95,
    transition: { duration: 0.2 } 
  },
};

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose, onDelete }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const isUserBook = !initialBooks.some(b => b.id === book.id);
  const hasFile = book.fileUrl && book.fileUrl !== '#';
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);


  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      // Close confirmation first if open, otherwise close the main modal
      if (event.key === 'Escape') {
        if (isConfirmingDelete) {
            setIsConfirmingDelete(false);
        } else {
            onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);

    // Focus the modal when it opens for accessibility
    if (!isConfirmingDelete) {
        modalRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, isConfirmingDelete]);
  
  const handleDelete = () => {
    onDelete(book.id);
    setIsConfirmingDelete(false);
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 outline-none"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-title"
        ref={modalRef}
        tabIndex={-1}
      >
        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] bg-void border border-gold-800 rounded-lg shadow-2xl shadow-gold-900/20 flex flex-col overflow-hidden"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-64 w-full">
              <img 
                  src={book.coverImage} 
                  alt={`Cover of ${book.title}`} 
                  className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent"></div>
          </div>
          
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
              <h2 id="book-title" className="font-serif text-2xl sm:text-3xl font-bold text-gold-200 tracking-wider">{book.title}</h2>
              <p className="text-md text-stone-400 mt-1">{book.author} <span className="text-stone-500">({book.year})</span></p>

              <div className="mt-4 flex flex-wrap gap-2">
                  {book.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 text-xs bg-gold-900/50 text-gold-300 rounded-full">
                      {tag}
                      </span>
                  ))}
              </div>

              <p className="mt-6 text-stone-300 text-base leading-relaxed">{book.description}</p>
              
              {book.textContent && (
                  <div className="mt-6 pt-6 border-t border-gold-900/50">
                      <h3 className="font-serif text-xl font-bold text-gold-300 mb-2 tracking-wider">Archived Text</h3>
                      <div className="bg-black/20 p-4 rounded-lg max-h-60 overflow-y-auto custom-scrollbar">
                          <pre className="text-stone-300 text-base leading-relaxed whitespace-pre-wrap font-sans">
                              {book.textContent}
                          </pre>
                      </div>
                  </div>
              )}
          </div>

          <div className="p-4 sm:p-6 mt-auto border-t border-gold-900/50 bg-black/20 flex items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <button
                      onClick={onClose}
                      aria-label="Close"
                      className="flex items-center justify-center px-4 py-2 bg-transparent text-gold-300 rounded-md border border-gold-800 font-serif tracking-wider text-sm transition-all duration-300 ease-in-out hover:bg-gold-900/50 hover:border-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void focus:ring-gold-500"
                  >
                      Close
                  </button>
                  {isUserBook && (
                       <button
                          onClick={() => setIsConfirmingDelete(true)}
                          aria-label="Delete manuscript"
                          className="flex items-center justify-center px-4 py-2 bg-transparent text-red-400 rounded-md border border-red-700/50 font-serif tracking-wider text-sm transition-all duration-300 ease-in-out hover:bg-red-900/50 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void focus:ring-red-500"
                      >
                          Delete
                      </button>
                  )}
              </div>
              {hasFile ? (
                  <button 
                    onClick={() => openFileInNewTab(book.fileUrl)}
                    className="flex items-center justify-center px-6 py-2 bg-gold-800 text-gold-100 rounded-md border border-gold-700 font-serif tracking-wider text-sm transition-all duration-300 ease-in-out hover:bg-gold-700 hover:shadow-lg hover:shadow-gold-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void focus:ring-gold-500"
                  >
                    Read Manuscript
                  </button>
              ) : (
                  <button
                      disabled
                      className="flex items-center justify-center px-6 py-2 bg-stone-700/50 text-stone-400 rounded-md border border-stone-600 font-serif tracking-wider text-sm cursor-not-allowed"
                   >
                      Read Manuscript
                   </button>
              )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isConfirmingDelete && (
            <ConfirmationModal
                isOpen={isConfirmingDelete}
                onClose={() => setIsConfirmingDelete(false)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message="Are you sure you want to permanently delete this manuscript? This action cannot be undone."
                confirmText="Delete"
            />
        )}
      </AnimatePresence>
    </>
  );
};