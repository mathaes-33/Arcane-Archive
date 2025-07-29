import React from 'react';
import { BookOpenIcon } from '@/components/Icons';

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-void z-50">
      <div className="relative">
        <BookOpenIcon className="h-24 w-24 text-gold-600 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-2 border-gold-700/50 animate-ping"></div>
      </div>
    </div>
  );
};