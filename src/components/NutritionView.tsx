import React, { useState } from 'react';
import { DailyMetrics } from '../types';
import { api } from '../lib/api';
import { 
  Utensils, 
  Droplet, 
  Flame, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  Apple, 
  Award, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface NutritionViewProps {
  metrics: DailyMetrics;
  onUpdateMetrics: (updated: Partial<DailyMetrics>) => void;
  userGoal?: string;
  showToast: (msg: string) => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  metrics,
  onUpdateMetrics,
  userGoal,
  showToast
}) => {
  const [proteinInput, setProteinInput] = useState('');
  const [calorieInput, setCalorieInput] = useState('');
  const [waterAddAmount, setWaterAddAmount] = useState('0.5');

  const [aiAdviceText, setAiAdviceText] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  const handleAddProtein = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(proteinInput);
    if (isNaN(val) || val <= 0) return;

    const newProtein = (metrics.proteinGrams || 0) + val;
    onUpdateMetrics({ proteinGrams: newProtein });
    setProteinInput('');
    showToast(`Logged +${val}g Protein! Total: ${newProtein}g`);
  };

  const handleAddCalories = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(calorieInput);
    if (isNaN(val) || val <= 0) return;

    const newCals = (metrics.caloriesConsumed || 0) + val;
    onUpdateMetrics({ caloriesConsumed: newCals });
    setCalorieInput('');
    showToast(`Logged +${val} kcal! Total: ${newCals} kcal`);
  };

  const handleAddWater = (liters: number) => {
    const newWater = parseFloat(((metrics.waterLiters || 0) + liters).toFixed(2));
    onUpdateMetrics({ waterLiters: newWater });
    showToast(`Logged +${liters}L Water! Total: ${newWater}L`);
  };

  const handleAskAiNutrition = async () => {
    setIsAskingAi(true);
    try {
      const prompt = `As FleetBot AI Nutritionist, provide 3 tailored macro and meal tips for a user with goal: "${userGoal || 'Muscle Gain'}".
Current stats: Calories=${metrics.caloriesConsumed}/${metrics.calorieTarget}, Protein=${metrics.proteinGrams || 120}g/${metrics.proteinTarget || 160}g, Water=${metrics.waterLiters}L.`;

      const res = await api.sendChatMessage(prompt, []);
      setAiAdviceText(res.reply);
    } catch (err) {
      setAiAdviceText('Failed to fetch AI nutrition tips. Please check connection.');
    } finally {
      setIsAskingAi(false);
    }
  };

  const pGrams = metrics.proteinGrams || 120;
  const pTarget = metrics.proteinTarget || 160;
  const pPercent = Math.min(100, Math.round((pGrams / pTarget) * 100));

  const cCals = metrics.caloriesConsumed || 1650;
  const cTarget = metrics.calorieTarget || 2200;
  const cPercent = Math.min(100, Math.round((cCals / cTarget) * 100));

  const wLiters = metrics.waterLiters || 1.8;
  const wTarget = metrics.waterTarget || 2.5;
  const wPercent = Math.min(100, Math.round((wLiters / wTarget) * 100));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Utensils className="w-3.5 h-3.5" />
            Metabolic & Macro Tracking Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Nutrition & Protein Module
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Track daily caloric intake, protein targets, hydration logs, and receive AI meal & macro recommendations tailored to your fitness goals.
          </p>
        </div>

        <button
          onClick={handleAskAiNutrition}
          disabled={isAskingAi}
          className="px-5 py-3 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF5722]/30 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          {isAskingAi ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          AI Nutrition Advisor
        </button>
      </div>

      {/* Main Macro Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calories Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#FF5722] font-bold text-sm">
              <Flame className="w-5 h-5" />
              Calorie Intake
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{cPercent}% Target</span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-white font-mono">
              {cCals} <span className="text-sm text-zinc-500 font-sans font-normal">/ {cTarget} kcal</span>
            </div>
            <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-gradient-to-r from-[#FF5722] to-amber-500 h-full transition-all duration-500"
                style={{ width: `${cPercent}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleAddCalories} className="flex gap-2 pt-2">
            <input
              type="number"
              value={calorieInput}
              onChange={(e) => setCalorieInput(e.target.value)}
              placeholder="Add kcal..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5722]"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-xl border border-zinc-700"
            >
              + Log
            </button>
          </form>
        </div>

        {/* Protein Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Apple className="w-5 h-5" />
              Protein Intake
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{pPercent}% Target</span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-white font-mono">
              {pGrams}g <span className="text-sm text-zinc-500 font-sans font-normal">/ {pTarget}g</span>
            </div>
            <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${pPercent}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleAddProtein} className="flex gap-2 pt-2">
            <input
              type="number"
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
              placeholder="Add protein (g)..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-xl border border-zinc-700"
            >
              + Log
            </button>
          </form>
        </div>

        {/* Hydration Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Droplet className="w-5 h-5" />
              Water Hydration
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">{wPercent}% Target</span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-white font-mono">
              {wLiters}L <span className="text-sm text-zinc-500 font-sans font-normal">/ {wTarget}L</span>
            </div>
            <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${wPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => handleAddWater(0.25)}
              className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-blue-400"
            >
              +250ml
            </button>
            <button
              onClick={() => handleAddWater(0.5)}
              className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-blue-400"
            >
              +500ml
            </button>
          </div>
        </div>
      </div>

      {/* AI Advice Output Banner */}
      {aiAdviceText && (
        <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            FleetBot AI Nutrition Breakdown
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
            {aiAdviceText}
          </p>
        </div>
      )}
    </div>
  );
};
