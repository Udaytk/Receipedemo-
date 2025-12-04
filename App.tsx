import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { RecipeCard } from './components/RecipeCard';
import { LoadingState } from './components/LoadingState';
import { CookingMode } from './components/CookingMode';
import { generateMealPlan } from './services/geminiService';
import { MealPlanResponse, LoadingState as LoadStatus, Recipe } from './types';

export default function App() {
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [data, setData] = useState<MealPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  const handleSearch = async (ingredients: string) => {
    setStatus('loading');
    setError(null);
    setData(null);
    try {
      const result = await generateMealPlan(ingredients);
      setData(result);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setError("The lazy chef is sleeping. Please try again.");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <Header />
      <InputSection onSearch={handleSearch} isLoading={status === 'loading'} />

      {status === 'loading' && <LoadingState />}

      {status === 'error' && (
        <div className="text-center py-10">
          <div className="inline-block bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        </div>
      )}

      {status === 'success' && data && (
        <div className="mt-12 space-y-12 animate-fade-in-up">
          
          {/* Highlighted Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-1">
              <RecipeCard 
                recipe={data.fiveMinuteOption} 
                tag="⚡ Speedrun" 
                tagColor="bg-yellow-400 text-yellow-900"
                highlight={true}
                onCook={setCookingRecipe}
              />
            </div>
            <div className="md:col-span-1">
              <RecipeCard 
                recipe={data.onePanOption} 
                tag="🥘 1-Pan Wonder" 
                tagColor="bg-green-400 text-green-900"
                highlight={true}
                onCook={setCookingRecipe}
              />
            </div>
          </div>

          {/* Quick Recipes Section */}
          <div>
            <div className="flex items-center gap-4 mb-6">
               <h2 className="text-2xl font-bold text-stone-800">Quick Picks</h2>
               <div className="h-px bg-stone-200 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.quickRecipes.map((recipe, index) => (
                <RecipeCard 
                  key={index} 
                  recipe={recipe} 
                  onCook={setCookingRecipe}
                />
              ))}
            </div>
          </div>

        </div>
      )}
      
      {/* Empty State / Prompt */}
      {status === 'idle' && (
        <div className="mt-20 text-center opacity-40 select-none">
          <div className="text-8xl mb-4">💤</div>
          <p className="text-xl">Waiting for ingredients...</p>
        </div>
      )}

      {/* Cooking Mode Overlay */}
      {cookingRecipe && (
        <CookingMode 
          recipe={cookingRecipe} 
          onClose={() => setCookingRecipe(null)} 
        />
      )}

      {/* Tailwind Animation Customization */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}