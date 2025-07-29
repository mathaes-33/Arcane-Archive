
import React from 'react';
import { BookOpenIcon } from '@/components/Icons';

export const Header: React.FC = () => (
    <header className="text-center py-12 sm:py-16 px-4 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-gold-500/20 rounded-full blur-3xl -z-10"></div>
        <BookOpenIcon className="mx-auto h-16 w-16 text-gold-500/80 mb-4" />
        <h1 
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-gold-200 tracking-widest uppercase"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
            Arcane Archives
        </h1>
        <p 
            className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-stone-300 font-sans italic"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
            Unlock the Forbidden. Illuminate the Hidden.
        </p>
    </header>
);