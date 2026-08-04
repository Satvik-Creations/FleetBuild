export type UserRole = 'member' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  token: string;
  userId: string;
  role: UserRole;
  createdAt: string;
  expiresAt: string;
}

export type HealthConstraintCategory = 'injury' | 'pain' | 'condition' | 'other';
export type HealthConstraintSeverity = 'mild' | 'moderate' | 'severe';

export interface HealthConstraint {
  id: string;
  category: HealthConstraintCategory;
  description: string;
  severity: HealthConstraintSeverity;
  active: boolean;
  notes?: string;
}

export type PrimaryFitnessFocus = 'hypertrophy' | 'fat_loss' | 'strength' | 'endurance' | 'rehab' | 'general_fitness';

export interface FitnessGoal {
  id: string;
  title: string;
  targetDescription: string;
  targetDate?: string;
  primaryFocus: PrimaryFitnessFocus;
}

export interface ExercisePreference {
  preferredExercises: string[];
  excludedExercises: string[];
  equipment: string[];
}

export interface UserConsent {
  medicalDisclaimerAccepted: boolean;
  dataStorageConsent: boolean;
  consentDate: string;
}

export interface NotificationPreferences {
  workoutReminders: boolean;
  recoveryAlerts: boolean;
  weeklyProgressReport: boolean;
  aiCoachTips: boolean;
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  allowAiContextMemory: boolean;
  publicProfile: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  age?: number;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  heightCm?: number;
  weightKg?: number;
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredSplit?: 'full_body' | 'push_pull_legs' | 'upper_lower' | 'bro_split' | 'custom';
  preferredWorkoutDays?: string[];
  unitPreference?: 'metric' | 'imperial';
  fitnessGoal: FitnessGoal;
  equipmentAccess: string[];
  exercisePreferences: ExercisePreference;
  healthConstraints: HealthConstraint[];
  dietaryRestrictions: string[];
  notificationPreferences?: NotificationPreferences;
  privacySettings?: PrivacySettings;
  userConsent: UserConsent;
  createdAt: string;
  updatedAt: string;
}

export interface LoggedWorkout {
  id: string;
  userId: string;
  date: string;
  title: string;
  durationMinutes: number;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight: string;
  }[];
  notes?: string;
}

export interface LoggedMetric {
  id: string;
  userId: string;
  date: string;
  weightKg?: number;
  waterLiters?: number;
  notes?: string;
}

export type MemoryCategory = 'medical' | 'nutrition' | 'goal' | 'preference' | 'routine';
export type MemoryStatus = 'candidate' | 'confirmed' | 'rejected';
export type MemorySensitivity = 'low' | 'high';

export interface MemoryFact {
  id: string;
  category: MemoryCategory;
  fact: string;
  sourceMessageId?: string;
  status: MemoryStatus;
  timestamp: string;
  sensitivity: MemorySensitivity;
}

export type MessageSender = 'user' | 'fleetbot';
export type ActionType = 'load_routine' | 'clear_squats' | 'view_plan' | 'confirm_memory';

export interface ConversationMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  hasAction?: boolean;
  actionType?: ActionType;
  actionLabel?: string;
  candidateMemoryId?: string;
}

export interface SafetyFlags {
  medicalPainDetected: boolean;
  requiresMedicalDisclaimer: boolean;
  requiresUserConfirmation: boolean;
  disclaimerText?: string;
}

export interface SuggestedAction {
  type: ActionType;
  label: string;
  payload?: string;
}

export interface GeminiChatResponse {
  reply: string;
  memoryCandidates: Omit<MemoryFact, 'id' | 'timestamp' | 'status'>[];
  safetyFlags: SafetyFlags;
  suggestedActions: SuggestedAction[];
}

