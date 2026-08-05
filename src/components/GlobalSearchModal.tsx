import React, { useState } from 'react';
import { Search, X, Dumbbell, BookOpen, Target, Zap, ChevronRight } from 'lucide-react';
import { CURATED_WORKOUT_PROGRAMS } from '../data/programsData';
import { EXERCISE_DATABASE } from '../data/exercisesData';
import { ViewType, WorkoutPlan } from '../types';

interface GlobalSearchModalProps {
  onClose: () => void;
  onSelectView: (view: ViewType) => void;
  onSelectPlan: (plan: WorkoutPlan) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  onClose,
  onSelectView,
  onSelectPlan
}) => {
  const [query, setQuery] = useState('');

  const matchingPrograms = CURATED_WORKOUT_PROGRAMS.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.category?.toLowerCase().includes(query.toLowerCase()) ||
    p.targetMuscles?.some(m => m.toLowerCase().includes(query.toLowerCase()))
  );

  const matchingExercises = EXERCISE_DATABASE.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    e.targetMuscle.toLowerCase().includes(query.toLowerCase()) ||
    e.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#FF5722]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workouts, exercises, muscle groups, programs..."
            autoFocus
            className="flex-1 bg-transparent border-none text-base text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!query ? (
            <div className="space-y-4">
              <div className="text-center py-4 text-zinc-500 space-y-2 text-xs">
                <Search className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="font-semibold text-zinc-400">Type to search FleetBuild Fitness Platform</p>
                <p>Try "Coach", "Steps", "Push Pull", "Bench Press", "Chest"</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => {
                    onSelectView('livecoach');
                    onClose();
                  }}
                  className="p-3 bg-zinc-950 border border-zinc-800 hover:border-[#FF5722] rounded-xl text-left cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF5722]" />
                    FleetBuild Live Coach
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">1-Min Video Call Consultation</p>
                </button>

                <button
                  onClick={() => {
                    onSelectView('steptracker');
                    onClose();
                  }}
                  className="p-3 bg-zinc-950 border border-zinc-800 hover:border-[#FF5722] rounded-xl text-left cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF5722]" />
                    Step & Calorie Counter
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Pedometer & Distance Tracker</p>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Programs Results */}
              {matchingPrograms.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Workout Programs ({matchingPrograms.length})
                  </span>
                  <div className="space-y-2">
                    {matchingPrograms.map((prog) => (
                      <div
                        key={prog.id}
                        onClick={() => {
                          onSelectPlan(prog);
                          onSelectView('programs');
                          onClose();
                        }}
                        className="p-3.5 bg-zinc-950 border border-zinc-800 hover:border-[#FF5722] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{prog.title}</p>
                          <p className="text-xs text-zinc-400">{prog.category} • {prog.difficulty} • {prog.durationMinutes} mins</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises Results */}
              {matchingExercises.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5722] flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5" />
                    Exercises ({matchingExercises.length})
                  </span>
                  <div className="space-y-2">
                    {matchingExercises.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => {
                          onSelectView('library');
                          onClose();
                        }}
                        className="p-3.5 bg-zinc-950 border border-zinc-800 hover:border-[#FF5722] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{ex.name}</p>
                          <p className="text-xs text-zinc-400">{ex.targetMuscle} • {ex.equipment}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingPrograms.length === 0 && matchingExercises.length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No matches found for "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
