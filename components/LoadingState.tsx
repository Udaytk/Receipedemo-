import React, { useEffect, useState } from 'react';

const lazyPhrases = [
  "Consulting the lazy spirits...",
  "Trying to avoid effort...",
  "Finding the path of least resistance...",
  "Looking for shortcuts...",
  "Minimizing dishwashing..."
];

export const LoadingState: React.FC = () => {
  const [phrase, setPhrase] = useState(lazyPhrases[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhrase(lazyPhrases[Math.floor(Math.random() * lazyPhrases.length)]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-20">
      <div className="text-6xl mb-6 animate-bounce">🍳</div>
      <p className="text-xl font-medium text-stone-500 animate-pulse">{phrase}</p>
    </div>
  );
};