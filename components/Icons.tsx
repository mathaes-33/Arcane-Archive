/**
 * @file A centralized module for all SVG icon components used in the application.
 * All icons are decorated with `aria-hidden="true"` as they are considered presentational.
 * Any interactive element using an icon should provide its own `aria-label`.
 */
import React from 'react';

interface IconProps {
    className?: string;
}

/** An open book icon representing the application's logo or reading theme. */
export const BookOpenIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

/** A magnifying glass icon for search functionality. */
export const SearchIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

/** A downward arrow into a tray, representing a download or read action. */
export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

/** A "hamburger" icon representing a menu. */
export const MenuIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

/** An "X" icon for closing modals or menus. */
export const XIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/** A plus icon for "add" or "new" actions. */
export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

/** An upward arrow from a tray, representing an upload action. */
export const UploadIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

/** A spinning icon to indicate a loading or processing state. */
export const SpinnerIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.75V6.25m0 11.5v1.5m8.25-11.5l-1.06 1.06M6.81 17.19l-1.06 1.06m13.44-8.25l-1.5.001M4.75 12H6.25m11.5 8.25l-1.06-1.06M6.81 6.81l-1.06-1.06" />
  </svg>
);

/** An upward-pointing chevron for "scroll to top" actions. */
export const ArrowUpIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
);