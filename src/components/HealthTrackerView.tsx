import React, { useState } from 'react';
import { WeightDataPoint, DailyMetrics } from '../types';
import { Scale, TrendingDown, Droplets, Moon, Heart, Flame, Plus, Check, Activity, BarChart2 } from 'lucide-react';

interface HealthTrackerViewProps {
  weightHistory: WeightDataPoint[];
  dailyMetrics: DailyMetrics;
  onUpdateWeight: (newWeight: number) => void;
  onUpdateWater: (liters: number) => void;
}

export const HealthTrackerView: React.FC<HealthTrackerViewProps> = ({
  weightHistory,
  dailyMetrics,
  onUpdateWeight,
  onUpdateWater,
}) => {
  const [newWeightInput, setNewWeightInput] = useState(dailyMetrics.weight.toString());
  const [isLogged, setIsLogged] = useState(false);

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!isNaN(val) && val > 30) {
      onUpdateWeight(val);
      setIsLogged(true);
      setTimeout(() => setIsLogged(false), 2500);
    }
  };

  const macros = [
    { label: 'Protein', current: 185, target: 200, unit: 'g', color: 'bg-[#FF5722]' },
    { label: 'Carbohydrates', current: 210, target: 280, unit: 'g', color: 'bg-[#FFC107]' },
    { label: 'Fats', current: 58, target: 70, unit: 'g', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold text-white/50 tracking-wider">Biometric Command</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Health & Biometrics Tracker</h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Tracking 7-Day Weight Loss Velocity, Macro Balances & HRV Recovery Index.
          </p>
        </div>

        {/* Quick Log Form */}
        <form onSubmit={handleLogWeight} className="flex items-center gap-2 bg-[#121212] p-2 rounded-2xl border border-white/10">
          <Scale className="w-4 h-4 text-[#FF5722] ml-2" />
          <input
            type="number"
            step="0.1"
            value={newWeightInput}
            onChange={(e) => setNewWeightInput(e.target.value)}
            className="w-20 bg-transparent text-white font-bold text-sm outline-none px-2"
            placeholder="79.3"
          />
          <span className="text-xs text-white/50 mr-1">kg</span>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1"
          >
            {isLogged ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isLogged ? 'Logged!' : 'Log Today'}</span>
          </button>
        </form>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): 7-Day Weight Chart & Macro Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Detailed 7-Day Weight Chart */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-white/50 tracking-wider">Weight Log</p>
                <h2 className="text-xl font-bold text-white">7-Day Weight Trend</h2>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{dailyMetrics.weight} <span className="text-xs font-normal text-white/50">kg</span></span>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                  <TrendingDown className="w-3.5 h-3.5" />
                  On track for 78.0 kg target
                </p>
              </div>
            </div>

            {/* Visual Bars with details */}
            <div className="space-y-4">
              <div className="h-48 pt-6 pb-2 flex items-end justify-between gap-3 px-2 border-b border-white/10">
                {weightHistory.map((pt, i) => {
                  const maxW = 82;
                  const minW = 77;
                  const h = Math.max(15, ((pt.weightKg - minW) / (maxW - minW)) * 100);
                  const isLatest = i === weightHistory.length - 1;

                  return (
                    <div key={pt.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div className="text-[10px] text-white/70 font-semibold mb-1 opacity-80 group-hover:opacity-100 group-hover:text-[#FFC107]">
                        {pt.weightKg}
                      </div>

                      <div className="w-full max-w-[36px] bg-[#121212] rounded-t-2xl h-full flex items-end p-1">
                        <div
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            isLatest
                              ? 'bg-gradient-to-t from-[#FF5722] to-amber-500 shadow-lg shadow-[#FF5722]/40'
                              : 'bg-white/20 group-hover:bg-[#FFC107]'
                          }`}
                        />
                      </div>

                      <span className={`text-xs font-bold ${isLatest ? 'text-[#FF5722]' : 'text-white/50'}`}>
                        {pt.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2">
                <span>Weekly Average: <strong>80.1 kg</strong></span>
                <span>Velocity: <strong>-0.27 kg / day</strong></span>
                <span>Goal Target: <strong className="text-[#FFC107]">78.0 kg</strong></span>
              </div>
            </div>
          </div>

          {/* Macronutrients Card */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-white/50 tracking-wider">Nutrition Engine</p>
                <h2 className="text-xl font-bold text-white">Daily Macronutrient Balances</h2>
              </div>
              <span className="text-xs text-[#FFC107] font-bold bg-[#FFC107]/10 px-3 py-1 rounded-full border border-[#FFC107]/30">
                {dailyMetrics.caloriesConsumed} / {dailyMetrics.calorieTarget} kcal
              </span>
            </div>

            <div className="space-y-4">
              {macros.map((m) => {
                const pct = Math.round((m.current / m.target) * 100);
                return (
                  <div key={m.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">{m.label}</span>
                      <span className="text-white/70">
                        {m.current} / {m.target} {m.unit} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#121212] overflow-hidden p-0.5">
                      <div
                        style={{ width: `${Math.min(100, pct)}%` }}
                        className={`h-full ${m.color} rounded-full transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Recovery & Hydration */}
        <div className="space-y-8">
          
          {/* Hydration Widget */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Hydration Tracker</h3>
              </div>
              <span className="text-xs text-blue-400 font-bold">
                {dailyMetrics.waterLiters}L / {dailyMetrics.waterTarget}L
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-[#121212] overflow-hidden p-0.5">
              <div
                style={{ width: `${(dailyMetrics.waterLiters / dailyMetrics.waterTarget) * 100}%` }}
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => onUpdateWater(Math.max(0, dailyMetrics.waterLiters - 0.25))}
                className="flex-1 py-2 rounded-xl bg-[#121212] hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors"
              >
                - 250ml
              </button>
              <button
                onClick={() => onUpdateWater(dailyMetrics.waterLiters + 0.25)}
                className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors shadow-md"
              >
                + 250ml Log
              </button>
            </div>
          </div>

          {/* Sleep & HRV Recovery Score */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Sleep & Neural Recovery</h3>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                88% Readiness
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-[#121212] border border-white/5 space-y-1">
                <p className="text-[10px] text-white/50 uppercase font-semibold">Sleep Duration</p>
                <p className="text-lg font-extrabold text-white">{dailyMetrics.sleepHours} hrs</p>
                <p className="text-[10px] text-emerald-400">92% Deep Sleep</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121212] border border-white/5 space-y-1">
                <p className="text-[10px] text-white/50 uppercase font-semibold">HRV Score</p>
                <p className="text-lg font-extrabold text-[#FFC107]">{dailyMetrics.hrvMs} ms</p>
                <p className="text-[10px] text-[#FFC107]">+6ms above baseline</p>
              </div>
            </div>
          </div>

          {/* Body Measurements Log */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF5722]" />
              <span>Girth Measurements</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#121212] border border-white/5 flex justify-between">
                <span className="text-white/60">Chest</span>
                <span className="font-bold text-white">104 cm</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#121212] border border-white/5 flex justify-between">
                <span className="text-white/60">Waist</span>
                <span className="font-bold text-[#FF5722]">81 cm (-2cm)</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#121212] border border-white/5 flex justify-between">
                <span className="text-white/60">Biceps (Flexed)</span>
                <span className="font-bold text-[#FFC107]">39.5 cm (+0.5cm)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
