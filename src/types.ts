export type ViewType = 'dashboard' | 'fleetbot' | 'workout' | 'health' | 'profile' | 'admin';

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
  waterLiters: number;
  waterTarget: number;
  sleepHours: number;
  hrvMs: number;
  recoveryScore: number;
}
