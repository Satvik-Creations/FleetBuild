import React, { useState, useEffect } from 'react';
import { WorkoutPlan, Exercise } from '../types';
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Dumbbell, 
  Trophy, 
  X, 
  RotateCcw,
  Volume2,
  Award,
  Sparkles
} from 'lucide-react';

interface WorkoutSessionModalProps {
  workoutPlan: WorkoutPlan;
  onClose: () => void;
  onCompleteSession: (completedStats: { durationMinutes: number; caloriesBurned: number }) => void;
  showToast: (msg: string) => void;
}

export const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
  workoutPlan,
  onClose,
  onCompleteSession,
  showToast
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);

  // Active Exercise Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimerActive, setRestTimerActive] = useState(false);

  // Active exercise data
  const currentEx: Exercise = workoutPlan.exercises[currentExerciseIndex] || {
    id: 'ex-0',
    name: 'Workout Movement',
    targetMuscle: 'Target Muscle',
    sets: 3,
    reps: '10-12',
    weight: 'Moderate'
  };

  const nextEx = workoutPlan.exercises[currentExerciseIndex + 1];

  // Overall workout timer effect
  useEffect(() => {
    if (isWorkoutCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutCompleted]);

  // Rest timer countdown effect
  useEffect(() => {
    if (!isResting || !restTimerActive) return;

    if (restSeconds <= 0) {
      setIsResting(false);
      setRestTimerActive(false);
      showToast('Rest time up! Next set ready.');
      return;
    }

    const timer = setTimeout(() => {
      setRestSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isResting, restTimerActive, restSeconds]);

  const startRestTimer = (seconds = 60) => {
    setRestSeconds(seconds);
    setIsResting(true);
    setRestTimerActive(true);
  };

  const handleCompleteCurrentExercise = () => {
    if (!completedExercises.includes(currentExerciseIndex)) {
      setCompletedExercises([...completedExercises, currentExerciseIndex]);
    }

    if (currentExerciseIndex < workoutPlan.exercises.length - 1) {
      startRestTimer(60);
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      showToast(`Completed ${currentEx.name}!`);
    } else {
      // All exercises finished
      setIsWorkoutCompleted(true);
    }
  };

  const handleFinishWorkout = () => {
    const durationMin = Math.max(1, Math.round(elapsedSeconds / 60));
    const calories = Math.round((durationMin / (workoutPlan.durationMinutes || 45)) * (workoutPlan.caloriesBurned || 300));
    onCompleteSession({ durationMinutes: durationMin, caloriesBurned: calories });
    onClose();
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col justify-between max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5722] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Live Active Workout Session
            </span>
            <h2 className="text-lg font-extrabold text-white">{workoutPlan.title}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-amber-400 font-bold bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
              <Clock className="w-4 h-4 text-amber-400" />
              {formatTime(elapsedSeconds)}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workout Completion Summary View */}
        {isWorkoutCompleted ? (
          <div className="p-8 text-center space-y-6 my-auto animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-[#FF5722] flex items-center justify-center mx-auto shadow-2xl shadow-[#FF5722]/40 text-white animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Session Crushed! Excellent Work!</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                You completed all exercises in <strong className="text-zinc-200">{workoutPlan.title}</strong>. Your performance metrics have been recorded.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center max-w-md mx-auto">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Duration</span>
                <span className="text-base font-bold text-amber-400">{formatTime(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Calories</span>
                <span className="text-base font-bold text-[#FF5722]">
                  ~{Math.round((Math.max(1, elapsedSeconds) / 2700) * (workoutPlan.caloriesBurned || 300))} kcal
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Completed</span>
                <span className="text-base font-bold text-emerald-400">{workoutPlan.exercises.length} Exercises</span>
              </div>
            </div>

            <button
              onClick={handleFinishWorkout}
              className="px-8 py-3 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF5722]/30 cursor-pointer transition-all"
            >
              Save Workout Log & Exit
            </button>
          </div>
        ) : (
          /* Main Interactive Exercise Runner */
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Rest Timer Banner */}
            {isResting && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-2xl flex items-center justify-between text-amber-300 animate-pulse">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">Rest & Recovery Interval</span>
                    <span className="text-xl font-mono font-black">{restSeconds}s remaining</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRestSeconds((r) => r + 30)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg text-amber-200 border border-zinc-700"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => setIsResting(false)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg"
                  >
                    Skip Rest
                  </button>
                </div>
              </div>
            )}

            {/* Exercise Progress Tracker */}
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3">
              <span>Exercise {currentExerciseIndex + 1} of {workoutPlan.exercises.length}</span>
              <div className="flex items-center gap-1">
                {workoutPlan.exercises.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentExerciseIndex
                        ? 'w-6 bg-[#FF5722]'
                        : completedExercises.includes(idx)
                        ? 'w-3 bg-emerald-500'
                        : 'w-2 bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Main Active Exercise Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    {currentEx.targetMuscle}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">{currentEx.name}</h3>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-right">
                  <span className="text-xs text-zinc-400 block font-semibold">Target</span>
                  <span className="text-lg font-mono font-bold text-amber-400">
                    {currentEx.sets} sets × {currentEx.reps}
                  </span>
                </div>
              </div>

              {/* Set Execution Tracker */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-zinc-400 block">Set Log</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Array.from({ length: currentEx.sets || 3 }).map((_, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center space-y-1"
                    >
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">Set {sIdx + 1}</span>
                      <span className="text-xs font-mono font-bold text-zinc-200">{currentEx.reps} reps</span>
                      <span className="text-[10px] text-amber-400 block">{currentEx.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Exercise Preview */}
            {nextEx && (
              <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <SkipForward className="w-4 h-4 text-zinc-500" />
                  <span>Up Next: <strong className="text-zinc-200">{nextEx.name}</strong> ({nextEx.targetMuscle})</span>
                </div>
                <span className="font-mono text-amber-400">{nextEx.sets} sets × {nextEx.reps}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls Footer */}
        {!isWorkoutCompleted && (
          <div className="bg-zinc-950 p-6 border-t border-zinc-800 flex items-center justify-between gap-4">
            <button
              onClick={() => startRestTimer(60)}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold rounded-xl border border-zinc-700 flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              Rest 60s
            </button>

            <button
              onClick={handleCompleteCurrentExercise}
              className="flex-1 py-3 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF5722]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {currentExerciseIndex === workoutPlan.exercises.length - 1
                ? 'Finish Last Exercise'
                : 'Complete Exercise & Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
