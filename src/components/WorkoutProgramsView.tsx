import React, { useState } from 'react';
import { WorkoutPlan } from '../types';
import { CURATED_WORKOUT_PROGRAMS } from '../data/programsData';
import { 
  Dumbbell, 
  Flame, 
  Sparkles, 
  Clock, 
  Zap, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Play, 
  X,
  Layers,
  Award
} from 'lucide-react';

interface WorkoutProgramsViewProps {
  onSelectPlan: (plan: WorkoutPlan) => void;
  onStartSession: (plan: WorkoutPlan) => void;
  currentPlanId?: string;
  userGoal?: string;
  showToast: (msg: string) => void;
}

export const WorkoutProgramsView: React.FC<WorkoutProgramsViewProps> = ({
  onSelectPlan,
  onStartSession,
  currentPlanId,
  userGoal,
  showToast
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalPlan, setActiveModalPlan] = useState<WorkoutPlan | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = ['All', 'Hypertrophy', 'Fat Loss', 'Strength', 'Home & Travel'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredPrograms = CURATED_WORKOUT_PROGRAMS.filter((prog) => {
    const matchesCategory = selectedCategory === 'All' || prog.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || prog.difficulty === selectedDifficulty;
    const matchesSearch = prog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.targetMuscles?.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
      showToast('Removed from favorites');
    } else {
      setFavorites([...favorites, id]);
      showToast('Saved to favorites!');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/30 text-[#FF5722] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Curated 4-Week Gym & Home Programs
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Workout Programs & Splits
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Choose structured multi-week training programs designed for muscle gain, fat loss, strength, and body recomposition. Fully integrable with FleetBot AI Coach.
          </p>
        </div>

        {userGoal && (
          <div className="bg-zinc-950/80 border border-amber-500/30 rounded-xl p-4 shrink-0 max-w-xs space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Goal Sync
            </div>
            <p className="text-xs text-zinc-200 font-medium">
              Profile Goal: <span className="text-amber-300 font-bold">{userGoal}</span>
            </p>
          </div>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs or target muscles (e.g., Push Pull, Chest, Strength)..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#FF5722] rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-zinc-400 mr-1 shrink-0">Difficulty:</span>
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-zinc-800 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-zinc-800/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/30'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => {
          const isFav = favorites.includes(program.id);
          const isCurrent = currentPlanId === program.id;

          return (
            <div
              key={program.id}
              onClick={() => setActiveModalPlan(program)}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Image Header */}
                <div className="relative h-44 overflow-hidden bg-zinc-950">
                  <img
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                      {program.difficulty}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-md text-zinc-300 border border-zinc-700 text-[11px] font-medium">
                      {program.weekDuration || 4} Weeks
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(e, program.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-amber-400 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  {/* Program Title Over Image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5722] block mb-0.5">
                      {program.type}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {program.title}
                    </h3>
                  </div>
                </div>

                {/* Description & Specs */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {program.description}
                  </p>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{program.durationMinutes} mins / session</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Flame className="w-4 h-4 text-[#FF5722] shrink-0" />
                      <span>~{program.caloriesBurned} kcal</span>
                    </div>
                  </div>

                  {/* Target Muscle Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {program.targetMuscles?.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-zinc-800/60 mt-2">
                <span className="text-xs font-semibold text-zinc-400">
                  {program.exercises.length} Exercises included
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(program);
                    showToast(`Activated ${program.title}!`);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[#FF5722] hover:bg-[#FF5722]/90 text-white shadow-md shadow-[#FF5722]/20'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Plan
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Set as Active
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Program Detail Modal */}
      {activeModalPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-0">
            {/* Header */}
            <div className="relative h-48 bg-zinc-950">
              <img
                src={activeModalPlan.imageUrl}
                alt={activeModalPlan.title}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
              
              <button
                onClick={() => setActiveModalPlan(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-zinc-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5722]">
                  {activeModalPlan.category} • {activeModalPlan.difficulty}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white">
                  {activeModalPlan.title}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {activeModalPlan.description}
              </p>

              {/* AI Recommendation Banner */}
              {activeModalPlan.aiRecommendation && (
                <div className="p-4 bg-zinc-950 border border-amber-500/30 rounded-xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      FleetBot AI Recommendation
                    </span>
                    <p className="text-xs text-zinc-300">
                      {activeModalPlan.aiRecommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Duration</span>
                  <span className="text-sm font-bold text-zinc-100">{activeModalPlan.durationMinutes} mins</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Est. Burn</span>
                  <span className="text-sm font-bold text-[#FF5722]">~{activeModalPlan.caloriesBurned} kcal</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Program Length</span>
                  <span className="text-sm font-bold text-amber-400">{activeModalPlan.weekDuration || 4} Weeks</span>
                </div>
              </div>

              {/* Exercise List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center justify-between">
                  <span>Exercise Routine Breakdown</span>
                  <span className="text-xs text-zinc-500 font-normal">{activeModalPlan.exercises.length} Exercises</span>
                </h3>

                <div className="space-y-2">
                  {activeModalPlan.exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center font-mono font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-zinc-100">{ex.name}</p>
                          <p className="text-[11px] text-zinc-400">{ex.targetMuscle}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-amber-400 font-bold">{ex.sets} sets × {ex.reps}</span>
                        <span className="block text-[10px] text-zinc-500">{ex.weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-zinc-950 p-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  onStartSession(activeModalPlan);
                  setActiveModalPlan(null);
                }}
                className="w-full sm:flex-1 py-3 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF5722]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Live Workout Session
              </button>
              <button
                onClick={() => {
                  onSelectPlan(activeModalPlan);
                  showToast(`Activated ${activeModalPlan.title}!`);
                  setActiveModalPlan(null);
                }}
                className="w-full sm:w-auto px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl border border-zinc-700 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Set as Active Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
