export type ViewType = 
  | 'dashboard' 
  | 'fleetbot' 
  | 'workout' 
  | 'programs' 
  | 'bodyfocus' 
  | 'library' 
  | 'planner' 
  | 'nutrition' 
  | 'achievements' 
  | 'health' 
  | 'profile' 
  | 'admin' 
  | 'account';

export interface MemoryContext {
  goal: string;
  injury: string;
  hates: string;
  calories: string;
  equipment: string;
  recoveryScore: number;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'fleetbot';
  text: string;
  timestamp: string;
  hasAction?: boolean;
  actionType?: 'load_routine' | 'clear_squats' | 'view_plan' | 'confirm_memory';
  actionLabel?: string;
  candidateMemoryId?: string;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  weight: string;
  isCompleted?: boolean;
  isAdapted?: boolean;
  notes?: string;
  iconName?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment?: string;
  instructions?: string[];
  commonMistakes?: string[];
  tips?: string;
  imageUrl?: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  caloriesBurned: number;
  exercises: Exercise[];
  adaptedForInjury?: boolean;
  isCurrentPlan?: boolean;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'AI Recommended';
  category?: string;
  weekDuration?: number; // e.g. 4 weeks
  targetMuscles?: string[];
  equipment?: string[];
  description?: string;
  aiRecommendation?: string;
  isFavorite?: boolean;
  imageUrl?: string;
}

export interface WeightDataPoint {
  day: string;
  weightKg: number;
  targetKg: number;
}

export interface DailyMetrics {
  weight: number;
  streakDays: number;
  caloriesConsumed: number;
  calorieTarget: number;
  proteinGrams: number;
  proteinTarget: number;
  carbsGrams: number;
  carbsTarget: number;
  fatGrams: number;
  fatTarget: number;
  waterLiters: number;
  waterTarget: number;
  sleepHours: number;
  hrvMs: number;
  recoveryScore: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Streak' | 'Workouts' | 'Nutrition' | 'Milestone';
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface ScheduledDay {
  dayName: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  fullDate?: string;
  workoutPlanId?: string;
  workoutTitle?: string;
  isRestDay: boolean;
  isCompleted: boolean;
}

export type BodyMuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Shoulders' 
  | 'Arms' 
  | 'Biceps' 
  | 'Triceps' 
  | 'Forearms' 
  | 'Legs' 
  | 'Quads' 
  | 'Hamstrings' 
  | 'Calves' 
  | 'Glutes' 
  | 'Core' 
  | 'Abs' 
  | 'Cardio' 
  | 'Full Body';

