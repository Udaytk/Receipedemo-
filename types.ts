export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories?: string;
}

export interface MealPlanResponse {
  quickRecipes: Recipe[];
  fiveMinuteOption: Recipe;
  onePanOption: Recipe;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';