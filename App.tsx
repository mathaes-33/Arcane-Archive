/**
 * @file The root component of the Arcane Archives application.
 * It manages all primary state, including the book collection, search/filter criteria,
 * and modal visibility. It orchestrates the main layout and renders all sub-components.
 */
import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { Book } from '@/types';
import { BOOKS as initialBooks } from '@/constants';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { Sidebar } from '@/components/Sidebar';
import { BookCard } from '@/components/BookCard';
import { Loader } from '@/components/Loader';
import { BookDetailModal } from '@/components/BookDetailModal';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Fab } from '@/components/Fab';
import { MenuIcon } from '@/components/Icons';
import { MobileMenu } from '@/components/MobileMenu';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { analyzeText, AnalyzedBookData } from '@/lib/ai';
import { getAllBooks, saveBook, deleteBook } from '@/lib/storage';
import { useDebounce } from '@/hooks/useDebounce';
import { ModalProvider, useModal } from '@/context/ModalContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toast } from '@/components/Toast';

// Lazy load components that are not immediately needed
const ArchiveModal = React.lazy(() => import('@/components/ArchiveModal'));
const ReadingView = React.lazy(() => import('@/components/ReadingView'));

/** A purely decorative background component with subtle animations. */
const Background: React.FC = () => (
  <div className="fixed inset-0 -z-10 h-full w-full bg-void">
    <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
    <div className="absolute -z-20 top-0 left-0 h-full w-full bg-gradient-to-br from-[#1e1b4b] via-void to-void animate-aurora" />
  </div>
);

interface ArchivePayload {
    textContent: string;
    fileDataUrl?: string;
}

type ToastState = { message: string; type: 'info' | 'error'; key: number } | null;

/** Renders modals based on the global modal context state. */
const ModalRenderer: React.FC<{ 
    onDeleteBook: (bookId: string) => Promise<void>;
    onArchiveBook: (payload: ArchivePayload) => Promise<void>;
}> = ({ onDeleteBook, onArchiveBook }) => {
    const { modal, closeModal } = useModal();
    
    return (
        <AnimatePresence>
            {(() => {
                switch (modal.type) {
                    case 'bookDetail':
                        return (
                            <BookDetailModal
                                book={modal.props.book}
                                onClose={closeModal}
                                onDelete={onDeleteBook}
                            />
                        );
                    case 'archive':
                        return (
                            <Suspense fallback={<div className="fixed inset-0 bg-void/50 z-50" />}>
                                <ArchiveModal
                                    onClose={closeModal}
                                    onArchive={onArchiveBook}
                                />
                            </Suspense>
                        );
                    case 'readingView':
                        return (
                            <Suspense fallback={<div className="fixed inset-0 bg-void/50 z-50" />}>
                                <ReadingView book={modal.props.book} onClose={closeModal} />
                            </Suspense>
                        );
                    default:
                        return null;
                }
            })()}
        </AnimatePresence>
    );
};

const AppContent: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [loading, setLoading] = useState(true);
    const [books, setBooks] = useState<Book[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAiConfigured, setIsAiConfigured] = useState(false);
    const [toast, setToast] = useState<ToastState>(null);

    const { modal, openModal, closeModal } = useModal();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const areModalsOpen = !!modal.type;
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    // --- EFFECTS ---
    useEffect(() => {
        const loadData = async () => {
            try {
                // Check if the AI is configured by calling our serverless function
                fetch('/.netlify/functions/check-config')
                    .then(res => res.json())
                    .then(data => setIsAiConfigured(data.isConfigured))
                    .catch(err => {
                        console.error("Failed to check AI configuration:", err);
                        setIsAiConfigured(false); // Assume not configured on error
                    });
                    
                const userBooks = await getAllBooks();
                setBooks([...initialBooks, ...userBooks]);
            } catch (error) {
                console.error("Failed to load user books from storage:", error);
                setBooks(initialBooks);
            } finally {
                setLoading(false);
                document.body.classList.add('loaded');
                document.body.classList.remove('no-flash');
            }
        };
        loadData();
    }, []);
    
    // --- MEMOIZED VALUES ---
    const categories = useMemo(() => {
        const allTags = new Set(books.flatMap(book => book.tags));
        return ["All", ...Array.from(allTags)].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b));
    }, [books]);

    const fuse = useMemo(() => new Fuse(books, {
        keys: ['title', 'author', 'tags'],
        includeScore: true,
        includeMatches: true,
        threshold: 0.4,
        minMatchCharLength: 2,
        ignoreLocation: true,
    }), [books]);

    const filteredBooks = useMemo(() => {
        let results: Book[];
        if (debouncedSearchTerm.trim()) {
            results = fuse.search(debouncedSearchTerm).map(result => ({
                ...result.item,
                matches: result.matches,
            }));
        } else {
            results = books.map(({ matches, ...book }) => book);
        }

        if (selectedCategory === 'All') return results;
        return results.filter(book => book.tags.includes(selectedCategory));
    }, [debouncedSearchTerm, selectedCategory, books, fuse]);

    // --- CALLBACKS ---
    const handleMenuOpen = useCallback(() => setIsMenuOpen(true), []);
    const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);
    
    const showToast = useCallback((toastData: Omit<NonNullable<ToastState>, 'key'>) => {
        setToast({ ...toastData, key: Date.now() });
    }, []);

    const handleArchive = useCallback(async ({ textContent, fileDataUrl }: ArchivePayload) => {
        const newBookData: AnalyzedBookData = await analyzeText(textContent);
        const newBook: Book = {
            ...newBookData,
            id: crypto.randomUUID(),
            coverImage: `https://picsum.photos/seed/${newBookData.title.replace(/\s+/g, '-')}/400/600`,
            fileUrl: fileDataUrl || '#',
            textContent: textContent,
        };
        await saveBook(newBook);
        setBooks(prevBooks => [...prevBooks, newBook]);
        showToast({ message: "Manuscript successfully archived.", type: 'info' });
    }, [showToast]);

    const handleDeleteBook = useCallback(async (bookId: string) => {
        closeModal();
        const originalBooks = [...books];
        setBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
        try {
            await deleteBook(bookId);
            showToast({ message: 'Manuscript deleted.', type: 'info' });
        } catch (error) {
            console.error("Failed to delete book:", error);
            setBooks(originalBooks);
            showToast({ message: 'Failed to delete manuscript.', type: 'error' });
        }
    }, [books, closeModal, showToast]);

    if (loading) return <Loader />;

    return (
        <>
            <div className="relative min-h-screen px-4 sm:px-6 lg:px-8">
                <Header />
                <main className="container mx-auto max-w-screen-2xl">
                    <ErrorBoundary>
                        <div className="flex flex-col lg:flex-row gap-8">
                            {isDesktop && (
                                <aside className="w-full lg:w-64 lg:flex-shrink-0">
                                    <div className="lg:sticky lg:top-8 bg-black/20 backdrop-blur-md border border-gold-900/30 rounded-lg">
                                        <Sidebar categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                                    </div>
                                </aside>
                            )}
                            <div className="flex-1">
                                {!isDesktop && (
                                    <div className="flex justify-between items-center mb-4 p-2 bg-black/20 border border-gold-900/30 rounded-lg">
                                        <h2 className="font-serif text-lg text-gold-300 tracking-wider">Library</h2>
                                        <button onClick={handleMenuOpen} className="p-2 text-gold-300 hover:text-gold-100 transition-colors" aria-label="Open categories menu">
                                            <MenuIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                )}
                                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                                {filteredBooks.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                        {filteredBooks.map(book => (
                                            <BookCard key={book.id} book={book} onViewDetails={(b) => openModal('bookDetail', { book: b })} onReadText={(b) => openModal('readingView', { book: b })} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-black/20 rounded-lg border border-gold-900/30">
                                        <p className="text-xl text-stone-400 font-serif">No manuscripts found.</p>
                                        <p className="mt-2 text-stone-500">Adjust your search or filter.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ErrorBoundary>
                </main>
                <footer className="text-center py-12 mt-16 text-sm text-stone-500 font-sans">
                    <p>&copy; {new Date().getFullYear()} Arcane Archives. For educational and esoteric pursuits only.</p>
                </footer>
            </div>

            <ModalRenderer onDeleteBook={handleDeleteBook} onArchiveBook={handleArchive} />
            
            <MobileMenu isOpen={!isDesktop && isMenuOpen} onClose={handleMenuClose}>
                <Sidebar categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} onClose={handleMenuClose} />
            </MobileMenu>

            <Fab onClick={() => openModal('archive')} label="Archive New Manuscript" isVisible={!areModalsOpen} isDisabled={!isAiConfigured} disabledTooltip="AI Scribe is not configured." />
            <ScrollToTop isVisible={!areModalsOpen} />
            
            {toast && (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => setToast(null)}
                />
            )}
        </>
    );
};

export default function App() {
    return (
        <ModalProvider>
            <Background />
            <AppContent />
        </ModalProvider>
    );
}
