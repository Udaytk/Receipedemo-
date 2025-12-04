import React from 'react';

export const Header: React.FC = () => {
  return (
    <div className="text-center py-10 md:py-16">
      <h1 className="text-4xl md:text-6xl font-extrabold text-stone-900 tracking-tight mb-3">
        Lazy Meal <span className="text-orange-500">Decider</span>
      </h1>
      <p className="text-lg text-stone-500 max-w-md mx-auto">
        Zero thinking required. Tell us what you have, we'll tell you what to eat.
      </p>
    </div>
  );
};