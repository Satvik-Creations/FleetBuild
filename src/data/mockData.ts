import { MemoryContext, ChatMessage, WorkoutPlan, WeightDataPoint, DailyMetrics } from '../types';

export const initialMemoryContext: MemoryContext = {
  goal: 'Muscle Gain',
  injury: 'Left Knee',
  hates: 'Squats',
  calories: '2,600 kcal',
  equipment: 'Full Gym + Bands',
  recoveryScore: 88,
  lastUpdated: 'Just now',
};

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    text: "I can't do my leg workout today, my left knee is acting up.",
    timestamp: '09:41 AM',
  },
  {
    id: 'msg-2',
    sender: 'fleetbot',
    text: "I've updated your medical profile regarding the left knee pain. I am recalculating today's schedule. Let's pivot to a low-impact upper body mobility and core session. I've also removed barbell squats from your future plans until you are cleared. Should I load the new routine?",
    timestamp: '09:42 AM',
    hasAction: true,
    actionType: 'load_routine',
    actionLabel: '⚡ Load Low-Impact Core & Upper Routine',
  },
];

export const defaultWorkoutPlan: WorkoutPlan = {
  id: 'plan-orig',
  title: 'Pull Day - Back & Biceps',
  type: 'Hypertrophy Strength',
  durationMinutes: 55,
  caloriesBurned: 480,
  adaptedForInjury: false,
  isCurrentPlan: false,
  exercises: [
    {
      id: 'ex-1',
      name: 'Lat Pulldowns',
      targetMuscle: 'Lats & Upper Back',
      sets: 4,
      reps: '10 - 12',
      weight: '70 kg',
      isCompleted: false,
    },
    {
      id: 'ex-2',
      name: 'Barbell Bent-Over Rows',
      targetMuscle: 'Mid-Back & Rhomboids',
      sets: 3,
      reps: '8 - 10',
      weight: '65 kg',
      isCompleted: false,
    },
    {
      id: 'ex-3',
      name: 'Incline Dumbbell Bicep Curls',
      targetMuscle: 'Biceps Long Head',
      sets: 3,
      reps: '12',
      weight: '16 kg',
      isCompleted: false,
    },
    {
      id: 'ex-4',
      name: 'Cable Face Pulls',
      targetMuscle: 'Rear Delts & Rotator Cuff',
      sets: 4,
      reps: '15',
      weight: '25 kg',
      isCompleted: false,
    },
  ],
};

export const adaptiveWorkoutPlan: WorkoutPlan = {
  id: 'plan-adapted',
  title: 'Low-Impact Upper Body & Core Pivot',
  type: 'Adaptive Knee-Safe Protocol',
  durationMinutes: 45,
  caloriesBurned: 410,
  adaptedForInjury: true,
  isCurrentPlan: true,
  exercises: [
    {
      id: 'ex-a1',
      name: 'Seated Cable Row (Neutral Grip)',
      targetMuscle: 'Lats & Upper Back',
      sets: 4,
      reps: '12',
      weight: '65 kg',
      isCompleted: false,
      isAdapted: true,
      notes: 'Zero lower body shear stress. Spine neutral.',
    },
    {
      id: 'ex-a2',
      name: 'Chest-Supported Dumbbell Flyes',
      targetMuscle: 'Pectorals & Stability',
      sets: 3,
      reps: '12 - 15',
      weight: '18 kg',
      isCompleted: false,
    },
    {
      id: 'ex-a3',
      name: 'Hanging Knee/Leg Raises',
      targetMuscle: 'Lower Abdominals',
      sets: 4,
      reps: '15',
      weight: 'Bodyweight',
      isCompleted: false,
      isAdapted: true,
      notes: 'Decompresses lumbar spine while engaging core.',
    },
    {
      id: 'ex-a4',
      name: 'Pallof Press Hold',
      targetMuscle: 'Anti-Rotational Core',
      sets: 3,
      reps: '45s hold/side',
      weight: '20 kg cable',
      isCompleted: false,
      isAdapted: true,
      notes: 'Isometric stability without knee loading.',
    },
  ],
};

export const weight7DayHistory: WeightDataPoint[] = [
  { day: 'Mon', weightKg: 81.2, targetKg: 78.0 },
  { day: 'Tue', weightKg: 80.9, targetKg: 78.0 },
  { day: 'Wed', weightKg: 80.6, targetKg: 78.0 },
  { day: 'Thu', weightKg: 80.4, targetKg: 78.0 },
  { day: 'Fri', weightKg: 80.0, targetKg: 78.0 },
  { day: 'Sat', weightKg: 79.7, targetKg: 78.0 },
  { day: 'Sun', weightKg: 79.3, targetKg: 78.0 },
];

export const initialDailyMetrics: DailyMetrics = {
  weight: 79.3,
  streakDays: 14,
  caloriesConsumed: 1850,
  calorieTarget: 2600,
  waterLiters: 2.8,
  waterTarget: 3.5,
  sleepHours: 7.8,
  hrvMs: 74,
  recoveryScore: 88,
};
