
import React from 'react';

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ categories, selectedCategory, onSelectCategory, onClose }) => {
  const commonButtonClasses = "w-full text-left px-4 py-2 text-sm rounded-md transition-all duration-200 ease-in-out font-serif tracking-wider";
  const activeClasses = "bg-gold-800/60 text-gold-100 shadow-inner shadow-black/30";
  const inactiveClasses = "text-stone-400 hover:bg-gold-900/50 hover:text-gold-200";

  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);
    if (onClose) {
        onClose();
    }
  };

  return (
    <div className="w-full h-full p-4">
        <h2 className="font-serif text-xl text-gold-300 mb-4 tracking-wider border-b border-gold-900 pb-2">Categories</h2>
        <nav className="flex flex-col space-y-2">
            {categories.map(category => (
            <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`${commonButtonClasses} ${selectedCategory === category ? activeClasses : inactiveClasses}`}
                aria-current={selectedCategory === category ? 'page' : undefined}
            >
                {category}
            </button>
            ))}
        </nav>
    </div>
  );
});