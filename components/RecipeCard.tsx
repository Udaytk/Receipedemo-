import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  tag?: string;
  tagColor?: string;
  highlight?: boolean;
  onCook?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, tag, tagColor = "bg-gray-200 text-gray-800", highlight = false, onCook }) => {
  return (
    <div className={`
      relative p-6 rounded-2xl transition-all duration-300 h-full flex flex-col
      ${highlight 
        ? 'bg-white border-2 border-orange-200 shadow-xl scale-[1.02] hover:shadow-2xl' 
        : 'bg-white border border-stone-100 shadow-sm hover:shadow-md'
      }
    `}>
      {tag && (
        <span className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tagColor}`}>
          {tag}
        </span>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-stone-800 leading-tight">
          {recipe.title}
        </h3>
        <span className="text-sm font-semibold text-stone-500 whitespace-nowrap bg-stone-100 px-2 py-1 rounded">
          ⏱ {recipe.time}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-bold text-stone-400 uppercase mb-2 tracking-wide">You need</h4>
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.map((ing, idx) => (
            <span key={idx} className="text-sm bg-orange-50 text-orange-800 px-2 py-1 rounded-md">
              {ing}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-grow mb-6">
        <h4 className="text-xs font-bold text-stone-400 uppercase mb-2 tracking-wide">To do</h4>
        <ol className="list-decimal list-inside space-y-2 text-stone-600 text-sm">
          {recipe.instructions.map((step, idx) => (
            <li key={idx} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-auto pt-4 border-t border-stone-100">
        <button 
          onClick={() => onCook && onCook(recipe)}
          className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-stone-200"
        >
          <span>🎙️</span>
          Guide Me
        </button>
      </div>
    </div>
  );
};