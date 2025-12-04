import { GoogleGenAI, Type } from "@google/genai";
import { MealPlanResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Fun, catchy name for the dish" },
    ingredients: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of ingredients needed, including assumed pantry staples like salt/oil" 
    },
    instructions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Short, punchy steps. Max 1 sentence per step." 
    },
    time: { type: Type.STRING, description: "Total time estimate e.g. '10 mins'" },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
    calories: { type: Type.STRING, description: "Approximate calories" }
  },
  required: ["title", "ingredients", "instructions", "time", "difficulty"]
};

export const generateMealPlan = async (ingredients: string): Promise<MealPlanResponse> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are the "Lazy Chef". You help people who are tired and hungry cook something fast with what they have.
    User will provide a list of ingredients.
    
    You must generate:
    1. 3 "Quick Recipes" (General good options).
    2. 1 "5-Minute Version" (The absolute fastest hack).
    3. 1 "1-Pan Version" (Minimal cleanup).

    Tone: Casual, encouraging, slightly humorous. 
    Assumptions: Assume user has basic pantry items (salt, pepper, oil, water) if they aren't listed, but prioritize the user's input.
    Constraint: Keep instructions extremely brief. Lazy people don't read paragraphs.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `I have these ingredients: ${ingredients}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quickRecipes: {
            type: Type.ARRAY,
            items: recipeSchema,
            description: "3 general quick recipe ideas based on input"
          },
          fiveMinuteOption: {
            ...recipeSchema,
            description: "The fastest possible meal (max 5-10 mins)"
          },
          onePanOption: {
            ...recipeSchema,
            description: "A recipe that only uses one pan/pot/sheet to minimize cleaning"
          }
        },
        required: ["quickRecipes", "fiveMinuteOption", "onePanOption"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(text) as MealPlanResponse;
};