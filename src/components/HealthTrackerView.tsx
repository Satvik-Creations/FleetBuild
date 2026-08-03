import React, { useState } from 'react';
import { WeightDataPoint, DailyMetrics } from '../types';
import { Scale, TrendingDown, Droplets, Plus, Check, Activity, BarChart2 } from 'lucide-react';

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
  const [newWeightInput, setNewWeightInput] = useState(dailyMetrics.weight ? dailyMetrics.weight.toString() : '');
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

  const hasWeightData = weightHistory && weightHistory.length > 0;

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold text-white/50 tracking-wider">Health Logging</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Health & Body Metrics Tracker</h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Log your authentic body weight entries and hydration levels over time.
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
            placeholder="e.g. 75.0"
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
        
        {/* Left Column (2 Cols): Weight History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-white/50 tracking-wider">Weight Log</p>
                <h2 className="text-xl font-bold text-white">Body Weight Trend</h2>
              </div>
              {dailyMetrics.weight > 0 && (
                <div className="text-right">
                  <span className="text-2xl font-black text-white">{dailyMetrics.weight} <span className="text-xs font-normal text-white/50">kg</span></span>
                </div>
              )}
            </div>

            {hasWeightData ? (
              <div className="space-y-4">
                <div className="h-48 pt-6 pb-2 flex items-end justify-between gap-3 px-2 border-b border-white/10">
                  {weightHistory.map((pt, i) => {
                    const isLatest = i === weightHistory.length - 1;
                    return (
                      <div key={pt.day + i} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="text-[10px] text-white/70 font-semibold mb-1 opacity-80 group-hover:opacity-100 group-hover:text-[#FFC107]">
                          {pt.weightKg} kg
                        </div>

                        <div className="w-full max-w-[36px] bg-[#121212] rounded-t-2xl h-full flex items-end p-1">
                          <div
                            style={{ height: `${Math.min(100, Math.max(20, (pt.weightKg / 120) * 100))}%` }}
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
              </div>
            ) : (
              <div className="p-8 text-center bg-[#121212] rounded-2xl border border-white/5 space-y-2">
                <BarChart2 className="w-8 h-8 text-white/30 mx-auto" />
                <p className="text-xs font-bold text-white">No weight logs recorded yet</p>
                <p className="text-[11px] text-white/40">Enter your weight in the top logging field to start your history.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Hydration Tracker */}
        <div className="space-y-8">
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Hydration Tracker</h3>
              </div>
              <span className="text-xs text-blue-400 font-bold">
                {dailyMetrics.waterLiters || 0}L
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => onUpdateWater(Math.max(0, (dailyMetrics.waterLiters || 0) - 0.25))}
                className="flex-1 py-2.5 rounded-xl bg-[#121212] hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors"
              >
                - 250ml
              </button>
              <button
                onClick={() => onUpdateWater((dailyMetrics.waterLiters || 0) + 0.25)}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors shadow-md"
              >
                + 250ml
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
