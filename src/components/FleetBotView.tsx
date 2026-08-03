import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MemoryContext, WorkoutPlan } from '../types';
import { Bot, Send, Sparkles, ShieldAlert, Check, Plus, Edit2, RotateCcw, Zap, RefreshCw, Cpu, User } from 'lucide-react';

interface FleetBotViewProps {
  messages: ChatMessage[];
  memoryContext: MemoryContext;
  onSendMessage: (text: string) => void;
  onUpdateMemoryContext: (updated: Partial<MemoryContext>) => void;
  onLoadAdaptiveRoutine: () => void;
  isRoutineLoaded: boolean;
  isGenerating: boolean;
}

export const FleetBotView: React.FC<FleetBotViewProps> = ({
  messages,
  memoryContext,
  onSendMessage,
  onUpdateMemoryContext,
  onLoadAdaptiveRoutine,
  isRoutineLoaded,
  isGenerating,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEditingMemory, setIsEditingMemory] = useState(false);
  const [editGoal, setEditGoal] = useState(memoryContext.goal);
  const [editInjury, setEditInjury] = useState(memoryContext.injury);
  const [editHates, setEditHates] = useState(memoryContext.hates);
  const [editCalories, setEditCalories] = useState(memoryContext.calories);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSaveMemory = () => {
    onUpdateMemoryContext({
      goal: editGoal,
      injury: editInjury,
      hates: editHates,
      calories: editCalories,
      lastUpdated: 'Just updated',
    });
    setIsEditingMemory(false);
  };

  const quickPrompts = [
    "I can't do my leg workout today, my left knee is acting up.",
    "Suggest a 15-min core finisher to replace squats",
    "How is my recovery score looking today?",
    "Update my goal to lean fat loss & definition",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[900px] rounded-3xl bg-[#121212] border border-white/10 shadow-2xl overflow-hidden">
      
      {/* FleetBot Header */}
      <div className="p-4 sm:p-6 bg-[#1E1E1E] border-b border-white/10 flex flex-col gap-4">
        
        {/* Top Title & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-[#FF5722]/30 relative">
              <Bot className="w-6 h-6" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1E1E1E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">FleetBot Neural Coach</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5722]/20 text-[#FF5722] flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  v2.4 Memory Engine
                </span>
              </div>
              <p className="text-xs text-white/50">Adaptive Neural Assistant • Real-time Medical & Injury Profiling</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingMemory(!isEditingMemory)}
            className="px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#FFC107]" />
            <span className="hidden sm:inline">{isEditingMemory ? 'Close Context Editor' : 'Edit Memory Context'}</span>
          </button>
        </div>

        {/* Active Memory Context Badge Bar (Required Feature) */}
        {!isEditingMemory ? (
          <div className="p-3.5 rounded-2xl bg-[#121212] border border-[#FF5722]/30 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#FF5722] font-bold shrink-0">
              <Sparkles className="w-4 h-4" />
              <span>Active Memory Context:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-white/90 font-medium">
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                🎯 <strong>Goal:</strong> {memoryContext.goal}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-[#FF5722]/20 border border-[#FF5722]/40 text-white font-semibold">
                ⚠️ <strong>Injury:</strong> {memoryContext.injury}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-[#FFC107]/15 border border-[#FFC107]/30 text-[#FFC107]">
                🚫 <strong>Hates:</strong> {memoryContext.hates}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                🔥 <strong>Cal:</strong> {memoryContext.calories}
              </span>
            </div>
          </div>
        ) : (
          /* Inline Memory Context Editor */
          <div className="p-4 rounded-2xl bg-[#121212] border border-[#FF5722] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#FF5722] font-bold">
              <span>Edit Active Memory Attributes</span>
              <span>Updated in real-time</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Primary Goal</label>
                <input
                  type="text"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl p-2 text-white focus:border-[#FF5722] outline-none"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Injury / Pain Profile</label>
                <input
                  type="text"
                  value={editInjury}
                  onChange={(e) => setEditInjury(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl p-2 text-white focus:border-[#FF5722] outline-none"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Excluded Exercises (Hates)</label>
                <input
                  type="text"
                  value={editHates}
                  onChange={(e) => setEditHates(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl p-2 text-white focus:border-[#FF5722] outline-none"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Daily Calorie Target</label>
                <input
                  type="text"
                  value={editCalories}
                  onChange={(e) => setEditCalories(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl p-2 text-white focus:border-[#FF5722] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsEditingMemory(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-white/70 text-xs hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMemory}
                className="px-4 py-1.5 rounded-xl bg-[#FF5722] text-white font-bold text-xs hover:bg-[#E64A19]"
              >
                Save Memory Context
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Chat History Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-[#FF5722] to-amber-500'
                    : 'bg-[#1E1E1E] border border-white/10 text-[#FF5722]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-[85%]">
                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-[#FF5722] to-[#E64A19] text-white rounded-tr-xs shadow-lg shadow-[#FF5722]/20 font-medium'
                      : 'bg-[#1E1E1E] text-white border border-white/10 rounded-tl-xs shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Message Actions (e.g. Load Routine Button) */}
                  {msg.hasAction && msg.actionType === 'load_routine' && (
                    <div className="mt-4 pt-3 border-t border-white/15">
                      {isRoutineLoaded ? (
                        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          <span>Low-Impact Routine Successfully Loaded into Dashboard!</span>
                        </div>
                      ) : (
                        <button
                          onClick={onLoadAdaptiveRoutine}
                          className="w-full py-3 px-4 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#FF5722]/40 transition-all transform hover:scale-[1.01]"
                        >
                          <Zap className="w-4 h-4 fill-white" />
                          <span>{msg.actionLabel || 'Load Adaptive Routine'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`flex items-center gap-2 text-[10px] text-white/40 px-2 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && <span className="text-[#FF5722]">• FleetBot AI</span>}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-3 max-w-xl mr-auto">
            <div className="w-9 h-9 rounded-2xl bg-[#1E1E1E] border border-white/10 text-[#FF5722] flex items-center justify-center">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-4 rounded-3xl bg-[#1E1E1E] border border-white/10 text-xs text-white/70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-ping" />
              <span>FleetBot is recalculating biomechanical parameters...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 bg-[#121212] border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-white/40 shrink-0">Quick Prompts:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full bg-[#1E1E1E] hover:bg-white/10 border border-white/10 text-xs text-white/80 whitespace-nowrap transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-[#1E1E1E] border-t border-white/10 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask FleetBot to adjust workouts, log injuries, or optimize sets..."
          disabled={isGenerating}
          className="flex-1 bg-[#121212] border border-white/10 focus:border-[#FF5722] rounded-2xl px-5 py-3.5 text-sm text-white placeholder-white/40 outline-none transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isGenerating}
          className="w-12 h-12 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-[#FF5722]/30 transition-all shrink-0 cursor-pointer"
          aria-label="Send message to FleetBot"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

    </div>
  );
};
