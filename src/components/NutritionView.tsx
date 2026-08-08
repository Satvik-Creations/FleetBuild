import React, { useState, useEffect } from 'react';
import { DailyMetrics, NutritionLogEntry } from '../types';
import { api } from '../lib/api';
import { 
  Utensils, 
  Droplet, 
  Flame, 
  Sparkles, 
  Plus, 
  Minus,
  RotateCcw, 
  Apple, 
  Settings,
  Trash2,
  History,
  CheckCircle2,
  X
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
  
  // Custom Target & Base Config Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [customCalorieTarget, setCustomCalorieTarget] = useState((metrics.calorieTarget || 2000).toString());
  const [customProteinTarget, setCustomProteinTarget] = useState((metrics.proteinTarget || 160).toString());
  const [customWaterTarget, setCustomWaterTarget] = useState((metrics.waterTarget || 2.5).toString());

  const [initialCalories, setInitialCalories] = useState((metrics.caloriesConsumed || 0).toString());
  const [initialProtein, setInitialProtein] = useState((metrics.proteinGrams || 0).toString());
  const [initialWater, setInitialWater] = useState((metrics.waterLiters || 0).toString());

  // Session History State (Persisted in localStorage)
  const [logHistory, setLogHistory] = useState<NutritionLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('fleetbuild_nutrition_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load nutrition history:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('fleetbuild_nutrition_logs', JSON.stringify(logHistory));
    } catch (e) {
      console.error('Failed to save nutrition history:', e);
    }
  }, [logHistory]);

  const [aiAdviceText, setAiAdviceText] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  // Helper to append a log entry
  const recordLog = (type: 'calories' | 'protein' | 'water', amount: number, label?: string) => {
    const newEntry: NutritionLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      amount,
      label,
    };
    setLogHistory((prev) => [newEntry, ...prev]);
  };

  // Add/Subtract Protein
  const handleModifyProtein = (delta: number) => {
    const current = metrics.proteinGrams ?? 0;
    const updated = Math.max(0, current + delta);
    onUpdateMetrics({ proteinGrams: updated });
    recordLog('protein', delta, delta >= 0 ? 'Added protein' : 'Subtracted protein');
    setProteinInput('');
    showToast(`${delta >= 0 ? '+' : ''}${delta}g Protein recorded! Current: ${updated}g`);
  };

  // Add/Subtract Calories
  const handleModifyCalories = (delta: number) => {
    const current = metrics.caloriesConsumed ?? 0;
    const updated = Math.max(0, current + delta);
    onUpdateMetrics({ caloriesConsumed: updated });
    recordLog('calories', delta, delta >= 0 ? 'Added calories' : 'Subtracted calories');
    setCalorieInput('');
    showToast(`${delta >= 0 ? '+' : ''}${delta} kcal recorded! Current: ${updated} kcal`);
  };

  // Add/Subtract Water
  const handleModifyWater = (deltaLiters: number) => {
    const current = metrics.waterLiters ?? 0;
    const updated = Math.max(0, parseFloat((current + deltaLiters).toFixed(2)));
    onUpdateMetrics({ waterLiters: updated });
    recordLog('water', deltaLiters, deltaLiters >= 0 ? 'Hydration added' : 'Hydration corrected');
    showToast(`${deltaLiters >= 0 ? '+' : ''}${deltaLiters}L Water recorded! Current: ${updated}L`);
  };

  // Undo / Delete a log entry
  const handleDeleteLogEntry = (entryId: string) => {
    const target = logHistory.find((entry) => entry.id === entryId);
    if (!target) return;

    if (target.type === 'calories') {
      const updated = Math.max(0, (metrics.caloriesConsumed ?? 0) - target.amount);
      onUpdateMetrics({ caloriesConsumed: updated });
    } else if (target.type === 'protein') {
      const updated = Math.max(0, (metrics.proteinGrams ?? 0) - target.amount);
      onUpdateMetrics({ proteinGrams: updated });
    } else if (target.type === 'water') {
      const updated = Math.max(0, parseFloat(((metrics.waterLiters ?? 0) - target.amount).toFixed(2)));
      onUpdateMetrics({ waterLiters: updated });
    }

    setLogHistory((prev) => prev.filter((item) => item.id !== entryId));
    showToast('Log entry removed from session history.');
  };

  // Reset Today's session data
  const handleResetSessionData = () => {
    if (window.confirm("Reset today's calories, protein, and hydration intake to 0?")) {
      onUpdateMetrics({
        caloriesConsumed: 0,
        proteinGrams: 0,
        waterLiters: 0,
      });
      setLogHistory([]);
      showToast("Session intake reset to 0.");
    }
  };

  // Save Config Settings
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const cTarget = parseFloat(customCalorieTarget) || 2000;
    const pTarget = parseFloat(customProteinTarget) || 160;
    const wTarget = parseFloat(customWaterTarget) || 2.5;

    const cInit = Math.max(0, parseFloat(initialCalories) || 0);
    const pInit = Math.max(0, parseFloat(initialProtein) || 0);
    const wInit = Math.max(0, parseFloat(initialWater) || 0);

    onUpdateMetrics({
      calorieTarget: cTarget,
      proteinTarget: pTarget,
      waterTarget: wTarget,
      caloriesConsumed: cInit,
      proteinGrams: pInit,
      waterLiters: wInit,
    });

    setIsConfigOpen(false);
    showToast('Targets & initial values updated successfully!');
  };

  const handleAskAiNutrition = async () => {
    setIsAskingAi(true);
    try {
      const prompt = `As FleetBot AI Nutritionist, provide 3 tailored macro and meal tips for a user with goal: "${userGoal || 'Muscle Gain'}".
Current stats: Calories=${metrics.caloriesConsumed ?? 0}/${metrics.calorieTarget || 2000}, Protein=${metrics.proteinGrams ?? 0}g/${metrics.proteinTarget || 160}g, Water=${metrics.waterLiters ?? 0}L/${metrics.waterTarget || 2.5}L.`;

      const res = await api.sendChatMessage(prompt, []);
      setAiAdviceText(res.reply);
    } catch (err) {
      setAiAdviceText('Failed to fetch AI nutrition tips. Please check connection.');
    } finally {
      setIsAskingAi(false);
    }
  };

  // Exact values with ZERO hardcoded initial values
  const pGrams = metrics.proteinGrams ?? 0;
  const pTarget = metrics.proteinTarget || 160;
  const pPercent = pTarget > 0 ? Math.min(100, Math.round((pGrams / pTarget) * 100)) : 0;

  const cCals = metrics.caloriesConsumed ?? 0;
  const cTarget = metrics.calorieTarget || 2000;
  const cPercent = cTarget > 0 ? Math.min(100, Math.round((cCals / cTarget) * 100)) : 0;

  const wLiters = metrics.waterLiters ?? 0;
  const wTarget = metrics.waterTarget || 2.5;
  const wPercent = wTarget > 0 ? Math.min(100, Math.round((wLiters / wTarget) * 100)) : 0;

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
            Track daily caloric intake, protein targets, hydration logs, configure custom goals, and maintain your complete session history.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setCustomCalorieTarget((metrics.calorieTarget || 2000).toString());
              setCustomProteinTarget((metrics.proteinTarget || 160).toString());
              setCustomWaterTarget((metrics.waterTarget || 2.5).toString());
              setInitialCalories((metrics.caloriesConsumed ?? 0).toString());
              setInitialProtein((metrics.proteinGrams ?? 0).toString());
              setInitialWater((metrics.waterLiters ?? 0).toString());
              setIsConfigOpen(true);
            }}
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl border border-zinc-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            Set Goals & Base
          </button>

          <button
            onClick={handleAskAiNutrition}
            disabled={isAskingAi}
            className="px-5 py-3 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF5722]/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isAskingAi ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            AI Nutrition Advisor
          </button>
        </div>
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

          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={calorieInput}
                onChange={(e) => setCalorieInput(e.target.value)}
                placeholder="Amount (kcal)..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5722]"
              />
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(calorieInput);
                  if (!isNaN(val) && val > 0) handleModifyCalories(val);
                }}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(calorieInput);
                  if (!isNaN(val) && val > 0) handleModifyCalories(-val);
                }}
                className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
                Subtract
              </button>
            </div>
          </div>
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

          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={proteinInput}
                onChange={(e) => setProteinInput(e.target.value)}
                placeholder="Amount (grams)..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(proteinInput);
                  if (!isNaN(val) && val > 0) handleModifyProtein(val);
                }}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(proteinInput);
                  if (!isNaN(val) && val > 0) handleModifyProtein(-val);
                }}
                className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
                Subtract
              </button>
            </div>
          </div>
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

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleModifyWater(0.25)}
              className="py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-blue-400 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> 250ml
            </button>
            <button
              type="button"
              onClick={() => handleModifyWater(-0.25)}
              className="py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-rose-400 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Minus className="w-3 h-3" /> 250ml
            </button>
            <button
              type="button"
              onClick={() => handleModifyWater(0.5)}
              className="py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-blue-400 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> 500ml
            </button>
            <button
              type="button"
              onClick={() => handleModifyWater(-0.5)}
              className="py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-rose-400 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Minus className="w-3 h-3" /> 500ml
            </button>
          </div>
        </div>
      </div>

      {/* Session Log History Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Session History & Log Entries</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              {logHistory.length} logs
            </span>
          </div>

          {logHistory.length > 0 && (
            <button
              onClick={handleResetSessionData}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset All Session Intake
            </button>
          )}
        </div>

        {logHistory.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No entries logged in this session yet. Use the inputs above or set your base goals to begin tracking!
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {logHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-500 font-mono">{item.timestamp}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      item.type === 'calories'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : item.type === 'protein'
                        ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      item.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.amount >= 0 ? `+${item.amount}` : item.amount}
                    {item.type === 'protein' ? 'g' : item.type === 'calories' ? ' kcal' : 'L'}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteLogEntry(item.id)}
                  title="Remove this log entry"
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration & Initial Values Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Configure Targets & Initial Base</h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">1. Daily Targets</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={customCalorieTarget}
                      onChange={(e) => setCustomCalorieTarget(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF5722] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={customProteinTarget}
                      onChange={(e) => setCustomProteinTarget(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Water (L)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customWaterTarget}
                      onChange={(e) => setCustomWaterTarget(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-zinc-800 pt-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">2. Initial Base Consumed Values</h4>
                <p className="text-[11px] text-zinc-400">Set direct starting values for today if you already consumed macros earlier:</p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Initial kcal</label>
                    <input
                      type="number"
                      value={initialCalories}
                      onChange={(e) => setInitialCalories(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF5722] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Initial Protein (g)</label>
                    <input
                      type="number"
                      value={initialProtein}
                      onChange={(e) => setInitialProtein(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Initial Water (L)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={initialWater}
                      onChange={(e) => setInitialWater(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#FF5722]/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Values
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
