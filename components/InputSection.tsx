import React, { useState, KeyboardEvent } from 'react';

interface InputSectionProps {
  onSearch: (ingredients: string) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      onSearch(input);
    }
  };

  const handleClick = () => {
    if (input.trim()) {
      onSearch(input);
    }
  };

  return (
    <div className="sticky top-4 z-50 px-4 w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-300 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
        <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden p-2">
          <input
            type="text"
            className="w-full px-4 py-4 text-lg md:text-xl text-stone-800 placeholder-stone-400 focus:outline-none bg-transparent"
            placeholder="e.g. eggs, bread, ketchup..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoFocus
          />
          <button
            onClick={handleClick}
            disabled={isLoading || !input.trim()}
            className={`
              ml-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-200
              ${isLoading || !input.trim() 
                ? 'bg-stone-300 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 shadow-md'
              }
            `}
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Decide'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};