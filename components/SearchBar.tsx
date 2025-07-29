
import React from 'react';
import { SearchIcon } from '@/components/Icons';

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(({ searchTerm, setSearchTerm }) => (
    <div className="relative mb-8 w-full max-w-2xl mx-auto">
        <input
            type="search"
            placeholder="Search titles, authors, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/30 backdrop-blur-sm border border-gold-900 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-gold-600 focus:border-gold-600 transition-all duration-300"
            aria-label="Search for books"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-stone-500 pointer-events-none" />
    </div>
));