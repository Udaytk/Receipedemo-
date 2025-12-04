import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Recipe } from '../types';
import { base64ToUint8Array, arrayBufferToBase64, float32ToInt16 } from '../utils/audioUtils';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [isTalking, setIsTalking] = useState(false);
  
  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    let cleanup = () => {};

    const startSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const outputContext = new AudioContextClass({ sampleRate: 24000 });
        const inputContext = new AudioContextClass({ sampleRate: 16000 });
        
        audioContextRef.current = outputContext;
        inputContextRef.current = inputContext;

        // Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // System Instruction specifically for guiding the user
        const systemInstruction = `
          You are a friendly, energetic cooking assistant (The Lazy Chef). 
          The user is making: "${recipe.title}".
          
          Ingredients: ${recipe.ingredients.join(', ')}.
          Instructions: ${recipe.instructions.join(' ')}.
          
          Protocol:
          1. Briefly greet the user and ask if they are ready to start.
          2. Read one instruction step at a time.
          3. Wait for the user to say "next", "okay", "done", or ask a question before moving to the next step.
          4. If they ask a question, answer it briefly, then prompt to continue.
          5. Keep responses short and punchy. No long monologues.
        `;

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              setStatus('connected');
              
              // Setup Audio Input Processing
              const source = inputContext.createMediaStreamSource(stream);
              const processor = inputContext.createScriptProcessor(4096, 1, 1);
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Convert to PCM Int16
                const pcmData = float32ToInt16(inputData);
                const base64Data = arrayBufferToBase64(new Uint8Array(pcmData.buffer));
                
                // Send to Gemini
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                    media: {
                      mimeType: 'audio/pcm;rate=16000',
                      data: base64Data
                    }
                  });
                });
              };

              source.connect(processor);
              processor.connect(inputContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              // Handle Audio Output from Model
              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              
              if (base64Audio) {
                setIsTalking(true);
                const audioData = base64ToUint8Array(base64Audio);
                
                // Decode raw PCM from model (24kHz)
                // We need to manually construct the buffer since it's raw PCM
                const dataInt16 = new Int16Array(audioData.buffer);
                const float32 = new Float32Array(dataInt16.length);
                for(let i=0; i<dataInt16.length; i++) {
                   float32[i] = dataInt16[i] / 32768.0;
                }
                
                const buffer = outputContext.createBuffer(1, float32.length, 24000);
                buffer.copyToChannel(float32, 0);

                // Queue playback
                const time = Math.max(outputContext.currentTime, nextStartTimeRef.current);
                const source = outputContext.createBufferSource();
                source.buffer = buffer;
                source.connect(outputContext.destination);
                source.start(time);
                
                nextStartTimeRef.current = time + buffer.duration;
                sourcesRef.current.add(source);
                
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsTalking(false);
                };
              }

              // Handle interruption (user spoke)
              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsTalking(false);
              }
            },
            onclose: () => {
              setStatus('disconnected');
            },
            onerror: (err) => {
              console.error(err);
              setStatus('error');
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            systemInstruction: systemInstruction,
          }
        });

        sessionPromiseRef.current = sessionPromise;
      } catch (e) {
        console.error("Failed to start session", e);
        setStatus('error');
      }
    };

    startSession();

    cleanup = () => {
      // Close session
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
      }
      // Close audio contexts
      audioContextRef.current?.close();
      inputContextRef.current?.close();
    };

    return cleanup;
  }, [recipe]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 animate-fade-in-up">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
      >
        Exit Cooking Mode ✕
      </button>

      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-2">Cooking Assistant</h2>
          <h1 className="text-3xl md:text-4xl font-extrabold">{recipe.title}</h1>
        </div>

        {/* Visualizer Circle */}
        <div className="relative flex justify-center py-12">
          {status === 'connecting' && (
             <div className="w-32 h-32 rounded-full border-4 border-stone-600 border-t-orange-500 animate-spin"></div>
          )}
          
          {status === 'connected' && (
            <div className={`
              w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300
              ${isTalking ? 'bg-orange-500 scale-110 shadow-[0_0_50px_rgba(249,115,22,0.6)]' : 'bg-stone-800'}
            `}>
              <div className="text-5xl">
                {isTalking ? '🗣️' : '👂'}
              </div>
              
              {/* Ripple effects */}
              <div className={`absolute inset-0 rounded-full border border-orange-500 opacity-50 ${isTalking ? 'animate-ping' : ''}`}></div>
            </div>
          )}

          {status === 'error' && (
             <div className="w-32 h-32 rounded-full bg-red-900/50 flex items-center justify-center border-2 border-red-500">
               <span className="text-4xl">⚠️</span>
             </div>
          )}
        </div>

        <div className="space-y-4">
          {status === 'connecting' && <p className="text-xl animate-pulse">Connecting to the chef...</p>}
          {status === 'connected' && (
            <div className="space-y-2">
              <p className="text-2xl font-medium text-orange-100">"I'm ready! Just say 'Start'."</p>
              <p className="text-sm text-stone-400">Speak naturally. Interrupt anytime.</p>
            </div>
          )}
          {status === 'error' && (
            <div>
              <p className="text-xl text-red-300 mb-4">Connection failed.</p>
              <button 
                onClick={onClose} 
                className="bg-white text-stone-900 px-6 py-3 rounded-xl font-bold hover:bg-stone-200"
              >
                Go Back
              </button>
            </div>
          )}
        </div>

        {/* Recipe Steps Preview (Scrollable) */}
        <div className="mt-8 bg-stone-800/50 rounded-2xl p-6 text-left max-h-48 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold text-stone-400 uppercase mb-3">Cheat Sheet</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-stone-300">
             {recipe.instructions.map((step, idx) => (
               <li key={idx} className="leading-relaxed">{step}</li>
             ))}
          </ol>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #57534e; border-radius: 4px; }
      `}</style>
    </div>
  );
};