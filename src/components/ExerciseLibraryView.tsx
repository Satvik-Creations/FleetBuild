import React, { useState } from 'react';
import { EXERCISE_DATABASE, ExerciseDetail } from '../data/exercisesData';
import { WorkoutPlan } from '../types';
import { api } from '../lib/api';
import { 
  Search, 
  Dumbbell, 
  Sparkles, 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  X, 
  Info,
  Filter
} from 'lucide-react';

interface ExerciseLibraryViewProps {
  currentPlan?: WorkoutPlan;
  onAddExerciseToPlan?: (exercise: ExerciseDetail) => void;
  showToast: (msg: string) => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  currentPlan,
  onAddExerciseToPlan,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetail | null>(null);

  // AI Explanation Modal State
  const [aiExplanationModal, setAiExplanationModal] = useState<ExerciseDetail | null>(null);
  const [aiExplanationText, setAiExplanationText] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Abs'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesCategory = categoryFilter === 'All' || ex.category === categoryFilter;
    const matchesDiff = difficultyFilter === 'All' || ex.difficulty === difficultyFilter;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesDiff && matchesSearch;
  });

  const handleAskAiExplanation = async (ex: ExerciseDetail) => {
    setAiExplanationModal(ex);
    setIsLoadingAi(true);
    setAiExplanationText(null);

    try {
      const prompt = `As FleetBot AI Coach, provide a concise, high-yield coaching summary for the exercise "${ex.name}".
Cover:
1. Optimal bio-mechanics & muscle engagement.
2. Safety cues & injury prevention for ${ex.targetMuscle}.
3. Progressive overload strategy.`;

      const res = await api.sendChatMessage(prompt, []);
      setAiExplanationText(res.reply);
    } catch (err: any) {
      setAiExplanationText('Failed to generate AI exercise analysis. Please check your connection.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            Anatomical Movement Database
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Exercise Library & Bio-Mechanics
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Explore step-by-step instructions, execution cues, common mistakes, and AI-powered technique breakdowns for all key compound & isolation lifts.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise name, equipment, or muscle (e.g. Bench Press, Dumbbell)..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#FF5722] rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-zinc-400 mr-1 shrink-0">Difficulty:</span>
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  difficultyFilter === diff
                    ? 'bg-zinc-800 text-amber-400 border border-amber-500/40'
                    : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-zinc-800/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/30'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image Preview */}
              <div className="relative h-44 overflow-hidden bg-zinc-950">
                <img
                  src={ex.imageUrl}
                  alt={ex.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900/90 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                    {ex.difficulty}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5722] block mb-0.5">
                    {ex.category} • {ex.equipment}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {ex.name}
                  </h3>
                </div>
              </div>

              {/* Instructions Brief */}
              <div className="p-5 space-y-3">
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {ex.instructions?.[0] || `Targeting ${ex.targetMuscle} with ${ex.equipment}.`}
                </p>

                {ex.commonMistakes && ex.commonMistakes.length > 0 && (
                  <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-[11px] text-red-300 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      Avoid Common Mistake:
                    </span>
                    <p className="text-red-300/80 line-clamp-1">{ex.commonMistakes[0]}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-5 pt-0 flex items-center gap-2 border-t border-zinc-800/60 mt-2">
              <button
                onClick={() => setSelectedExercise(ex)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors"
              >
                View Technique
              </button>
              <button
                onClick={() => handleAskAiExplanation(ex)}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/40 flex items-center gap-1 transition-colors"
                title="Ask FleetBot for AI Analysis"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI
              </button>
              {onAddExerciseToPlan && (() => {
                const isAlreadyInPlan = currentPlan?.exercises?.some(
                  (e) => e.name.trim().toLowerCase() === ex.name.trim().toLowerCase()
                );

                if (isAlreadyInPlan) {
                  return (
                    <button
                      onClick={() => showToast(`${ex.name} is already in your active plan!`)}
                      className="p-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl shadow-md transition-colors"
                      title="Already added to Active Plan"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  );
                }

                return (
                  <button
                    onClick={() => {
                      onAddExerciseToPlan(ex);
                    }}
                    className="p-2 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white rounded-xl shadow-md transition-colors"
                    title="Add to Workout Plan"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Technique Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  {selectedExercise.category} • {selectedExercise.difficulty}
                </span>
                <h2 className="text-xl font-bold text-white">{selectedExercise.name}</h2>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300">
              <div>
                <h3 className="font-bold text-zinc-100 mb-2">Step-by-Step Execution</h3>
                <ol className="list-decimal list-inside space-y-1.5 bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
                  {selectedExercise.instructions?.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              {selectedExercise.commonMistakes && (
                <div>
                  <h3 className="font-bold text-red-300 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Common Pitfalls & Mistakes
                  </h3>
                  <ul className="list-disc list-inside space-y-1 bg-red-950/20 border border-red-900/40 p-4 rounded-xl text-red-200">
                    {selectedExercise.commonMistakes.map((mistake, idx) => (
                      <li key={idx}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedExercise.tips && (
                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-300">
                  <strong className="block text-amber-400 mb-1">Coach's Pro Tip:</strong>
                  {selectedExercise.tips}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedExercise(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      {aiExplanationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">FleetBot AI Analysis: {aiExplanationModal.name}</h3>
              </div>
              <button
                onClick={() => setAiExplanationModal(null)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingAi ? (
              <div className="py-12 text-center space-y-3">
                <RotateCcw className="w-8 h-8 text-[#FF5722] animate-spin mx-auto" />
                <p className="text-xs text-zinc-400">Analyzing bio-mechanics and progressive overload for {aiExplanationModal.name}...</p>
              </div>
            ) : (
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 leading-relaxed space-y-2 max-h-80 overflow-y-auto">
                <p className="whitespace-pre-line">{aiExplanationText}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAiExplanationModal(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
