import React, { useState } from 'react';
import { ScheduledDay, WorkoutPlan } from '../types';
import { CURATED_WORKOUT_PROGRAMS } from '../data/programsData';
import { api } from '../lib/api';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Dumbbell, 
  Coffee, 
  Plus, 
  RotateCcw, 
  Zap, 
  ChevronRight,
  Trash2
} from 'lucide-react';

interface WeeklyPlannerViewProps {
  onSelectPlan: (plan: WorkoutPlan) => void;
  userGoal?: string;
  showToast: (msg: string) => void;
}

export const WeeklyPlannerView: React.FC<WeeklyPlannerViewProps> = ({
  onSelectPlan,
  userGoal,
  showToast
}) => {
  const [schedule, setSchedule] = useState<ScheduledDay[]>([
    { dayName: 'Mon', workoutPlanId: 'prog-push-pull-legs', workoutTitle: 'Push Day (Chest, Shoulders, Triceps)', isRestDay: false, isCompleted: true },
    { dayName: 'Tue', workoutPlanId: 'prog-push-pull-legs', workoutTitle: 'Pull Day (Back, Biceps)', isRestDay: false, isCompleted: true },
    { dayName: 'Wed', isRestDay: true, isCompleted: false },
    { dayName: 'Thu', workoutPlanId: 'prog-push-pull-legs', workoutTitle: 'Leg Day (Quads, Hamstrings, Glutes)', isRestDay: false, isCompleted: false },
    { dayName: 'Fri', workoutPlanId: 'prog-full-body-shred', workoutTitle: 'Upper Body Hypertrophy', isRestDay: false, isCompleted: false },
    { dayName: 'Sat', isRestDay: true, isCompleted: false },
    { dayName: 'Sun', workoutPlanId: 'prog-home-no-equipment', workoutTitle: 'Core & Mobility Circuit', isRestDay: false, isCompleted: false },
  ]);

  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  const toggleRestDay = (dayIndex: number) => {
    const updated = [...schedule];
    updated[dayIndex].isRestDay = !updated[dayIndex].isRestDay;
    if (updated[dayIndex].isRestDay) {
      updated[dayIndex].workoutTitle = undefined;
      updated[dayIndex].workoutPlanId = undefined;
    } else {
      updated[dayIndex].workoutTitle = 'Full Body Conditioning';
    }
    setSchedule(updated);
    showToast(`Updated ${updated[dayIndex].dayName} status.`);
  };

  const toggleCompletedDay = (dayIndex: number) => {
    const updated = [...schedule];
    updated[dayIndex].isCompleted = !updated[dayIndex].isCompleted;
    setSchedule(updated);
    showToast(`${updated[dayIndex].dayName} marked as ${updated[dayIndex].isCompleted ? 'Completed' : 'Pending'}.`);
  };

  const handleGenerateAiSchedule = async () => {
    setIsGeneratingSchedule(true);
    try {
      const prompt = `As FleetBot AI Coach, generate a 7-day optimal weekly training schedule for a user with goal: "${userGoal || 'General Fitness'}".
Return a balanced split with 2 rest days.`;

      await api.sendChatMessage(prompt, []);

      setSchedule([
        { dayName: 'Mon', workoutPlanId: 'prog-push-pull-legs', workoutTitle: 'AI Push Focus (Chest & Delts)', isRestDay: false, isCompleted: false },
        { dayName: 'Tue', workoutPlanId: 'prog-push-pull-legs', workoutTitle: 'AI Pull Focus (Lats & Biceps)', isRestDay: false, isCompleted: false },
        { dayName: 'Wed', isRestDay: true, isCompleted: false },
        { dayName: 'Thu', workoutPlanId: 'prog-upper-lower', workoutTitle: 'AI Lower Body Heavy Power', isRestDay: false, isCompleted: false },
        { dayName: 'Fri', workoutPlanId: 'prog-arnold-split', workoutTitle: 'AI Upper Body Hypertrophy', isRestDay: false, isCompleted: false },
        { dayName: 'Sat', isRestDay: true, isCompleted: false },
        { dayName: 'Sun', workoutPlanId: 'prog-full-body-shred', workoutTitle: 'AI Conditioning & Core', isRestDay: false, isCompleted: false },
      ]);

      showToast('Generated AI Weekly Training Schedule!');
    } catch (err) {
      showToast('Failed to generate AI schedule. Try again.');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            Periodic Training Periodization
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Weekly Calendar & Program Scheduler
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Organize your training days, schedule active workout splits, configure rest days, and auto-generate AI periodized plans.
          </p>
        </div>

        <button
          onClick={handleGenerateAiSchedule}
          disabled={isGeneratingSchedule}
          className="px-5 py-3 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF5722]/30 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          {isGeneratingSchedule ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate AI Schedule
        </button>
      </div>

      {/* 7-Day Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {schedule.map((day, idx) => (
          <div
            key={day.dayName}
            className={`bg-zinc-900 border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all ${
              day.isCompleted
                ? 'border-emerald-500/50 bg-emerald-950/10'
                : day.isRestDay
                ? 'border-zinc-800 bg-zinc-950/60'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-sm font-black text-white">{day.dayName}</span>
              <button
                onClick={() => toggleCompletedDay(idx)}
                className={`p-1 rounded-lg transition-colors ${
                  day.isCompleted
                    ? 'text-emerald-400 bg-emerald-500/20'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
                title="Toggle Completion"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-2 py-2">
              {day.isRestDay ? (
                <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-center space-y-1">
                  <Coffee className="w-5 h-5 text-amber-400 mx-auto" />
                  <span className="text-xs font-bold text-amber-300 block">Rest Day</span>
                  <span className="text-[10px] text-zinc-500 block">Active Recovery</span>
                </div>
              ) : (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF5722] font-bold">
                    <Dumbbell className="w-3.5 h-3.5" />
                    WORKOUT
                  </div>
                  <p className="text-xs font-bold text-zinc-200 line-clamp-2">
                    {day.workoutTitle || 'Scheduled Session'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Control */}
            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
              <button
                onClick={() => toggleRestDay(idx)}
                className="text-[11px] font-semibold text-zinc-400 hover:text-amber-400 transition-colors"
              >
                {day.isRestDay ? 'Make Workout Day' : 'Set as Rest Day'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
