import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Book } from '@/types';
import { DownloadIcon, BookOpenIcon } from '@/components/Icons';
import { HighlightedText } from './HighlightedText';
import { openFileInNewTab } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  onViewDetails: (book: Book) => void;
  onReadText: (book: Book) => void;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const BookCard: React.FC<BookCardProps> = React.memo(({ book, onViewDetails, onReadText }) => {
  const commonButtonClasses = "flex items-center justify-center w-full px-4 py-2 rounded-md font-serif tracking-wider text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void focus:ring-gold-500";
  const primaryButtonClasses = "bg-gold-800/80 text-gold-100 border border-gold-700 hover:bg-gold-700 hover:shadow-lg hover:shadow-gold-500/20";
  const secondaryButtonClasses = "bg-transparent text-gold-300 border border-gold-800 hover:bg-gold-900/50 hover:border-gold-700";
  const disabledButtonClasses = "bg-stone-700/50 text-stone-400 border border-stone-600 cursor-not-allowed";

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="group relative flex flex-col bg-black/30 backdrop-blur-sm border border-gold-900/50 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-gold-700/20 hover:border-gold-700"
    >
      <div className="relative h-64 md:h-72 w-full overflow-hidden">
        <img 
          src={book.coverImage} 
          alt={`Cover of ${book.title}`} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-serif text-lg md:text-xl font-bold text-gold-200 tracking-wider group-hover:text-gold-300 transition-colors">
            <HighlightedText text={book.title} matches={book.matches} matchKey="title" />
        </h3>
        <p className="text-sm text-stone-400 mt-1">
            <HighlightedText text={book.author} matches={book.matches} matchKey="author" /> ({book.year})
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {book.tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-gold-900/50 text-gold-300 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
        <button
          onClick={() => onViewDetails(book)}
          className={`${commonButtonClasses} ${secondaryButtonClasses}`}
        >
          View Details
        </button>
        {book.textContent ? (
            <button
                onClick={() => onReadText(book)}
                className={`${commonButtonClasses} ${primaryButtonClasses}`}
            >
                <BookOpenIcon className="w-4 h-4 mr-2" />
                Read Text
            </button>
        ) : book.fileUrl && book.fileUrl !== '#' ? (
            <button 
                onClick={() => openFileInNewTab(book.fileUrl)}
                className={`${commonButtonClasses} ${primaryButtonClasses}`}
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Read
            </button>
        ) : (
            <button 
                disabled 
                className={`${commonButtonClasses} ${disabledButtonClasses}`}
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Read
            </button>
        )}

      </div>
    </motion.div>
  );
});