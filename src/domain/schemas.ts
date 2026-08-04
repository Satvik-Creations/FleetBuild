import { z } from 'zod';

// Auth Schemas
export const SignUpSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const OnboardingSchema = z.object({
  name: z.string().min(1, 'Display name is required'),
  primaryFitnessGoal: z.string().min(1, 'Primary fitness goal is required'),
  goalFocus: z.enum(['hypertrophy', 'fat_loss', 'strength', 'endurance', 'rehab', 'general_fitness']).default('general_fitness'),
  goalDescription: z.string().optional().default(''),
  equipmentAccess: z.array(z.string()).default([]),
  healthConstraints: z.string().optional().default(''),
  dietaryRestrictions: z.array(z.string()).default([]),
});

// Health Constraint Schema
export const HealthConstraintSchema = z.object({
  id: z.string().default(() => `hc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
  category: z.enum(['injury', 'pain', 'condition', 'other']),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  active: z.boolean().default(true),
  notes: z.string().optional(),
});


// Fitness Goal Schema
export const FitnessGoalSchema = z.object({
  id: z.string().default(() => `fg-${Date.now()}`),
  title: z.string().min(1, 'Title is required'),
  targetDescription: z.string().min(1, 'Target description is required'),
  targetDate: z.string().optional(),
  primaryFocus: z.enum(['hypertrophy', 'fat_loss', 'strength', 'endurance', 'rehab', 'general_fitness']),
});

// Exercise Preference Schema
export const ExercisePreferenceSchema = z.object({
  preferredExercises: z.array(z.string()).default([]),
  excludedExercises: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
});

// User Consent Schema
export const UserConsentSchema = z.object({
  medicalDisclaimerAccepted: z.boolean().default(false),
  dataStorageConsent: z.boolean().default(false),
  consentDate: z.string().default(() => new Date().toISOString()),
});

// Notification Preferences Schema
export const NotificationPreferencesSchema = z.object({
  workoutReminders: z.boolean().default(true),
  recoveryAlerts: z.boolean().default(true),
  weeklyProgressReport: z.boolean().default(true),
  aiCoachTips: z.boolean().default(true),
});

// Privacy Settings Schema
export const PrivacySettingsSchema = z.object({
  shareAnalytics: z.boolean().default(false),
  allowAiContextMemory: z.boolean().default(true),
  publicProfile: z.boolean().default(false),
});

// Change Password Schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmNewPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1, 'Name is required'),
  username: z.string().optional(),
  email: z.string().email('Invalid email address'),
  avatarUrl: z.string().optional(),
  onboardingCompleted: z.boolean(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).optional(),
  heightCm: z.number().optional(),
  weightKg: z.number().optional(),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferredSplit: z.enum(['full_body', 'push_pull_legs', 'upper_lower', 'bro_split', 'custom']).optional(),
  preferredWorkoutDays: z.array(z.string()).optional(),
  unitPreference: z.enum(['metric', 'imperial']).optional(),
  fitnessGoal: FitnessGoalSchema,
  equipmentAccess: z.array(z.string()),
  exercisePreferences: ExercisePreferenceSchema,
  healthConstraints: z.array(HealthConstraintSchema),
  dietaryRestrictions: z.array(z.string()),
  notificationPreferences: NotificationPreferencesSchema.optional(),
  privacySettings: PrivacySettingsSchema.optional(),
  userConsent: UserConsentSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Update Profile API Request Schema
export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().optional(),
  age: z.number().min(13).max(120).optional().nullable(),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).optional().nullable(),
  heightCm: z.number().min(50).max(300).optional().nullable(),
  weightKg: z.number().min(20).max(500).optional().nullable(),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferredSplit: z.enum(['full_body', 'push_pull_legs', 'upper_lower', 'bro_split', 'custom']).optional(),
  preferredWorkoutDays: z.array(z.string()).optional(),
  unitPreference: z.enum(['metric', 'imperial']).optional(),
  fitnessGoal: FitnessGoalSchema.partial().optional(),
  equipmentAccess: z.array(z.string()).optional(),
  exercisePreferences: ExercisePreferenceSchema.partial().optional(),
  healthConstraints: z.array(HealthConstraintSchema).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  notificationPreferences: NotificationPreferencesSchema.partial().optional(),
  privacySettings: PrivacySettingsSchema.partial().optional(),
  userConsent: UserConsentSchema.partial().optional(),
});

// Memory Fact Schema
export const MemoryFactSchema = z.object({
  id: z.string(),
  category: z.enum(['medical', 'nutrition', 'goal', 'preference', 'routine']),
  fact: z.string().min(1),
  sourceMessageId: z.string().optional(),
  status: z.enum(['candidate', 'confirmed', 'rejected']),
  timestamp: z.string(),
  sensitivity: z.enum(['low', 'high']),
});

// Conversation Message Schema
export const ConversationMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(['user', 'fleetbot']),
  text: z.string().min(1),
  timestamp: z.string(),
  hasAction: z.boolean().optional(),
  actionType: z.enum(['load_routine', 'clear_squats', 'view_plan', 'confirm_memory']).optional(),
  actionLabel: z.string().optional(),
  candidateMemoryId: z.string().optional(),
});

// Chat Request Schema
export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message text is required'),
  chatHistory: z.array(ConversationMessageSchema).optional().default([]),
  memoryContext: z.record(z.string(), z.string()).optional(),
});

// Memory Confirmation Schema
export const ConfirmMemorySchema = z.object({
  factId: z.string().min(1, 'factId is required'),
  action: z.enum(['confirm', 'reject']),
});

// Safety Flags Schema
export const SafetyFlagsSchema = z.object({
  medicalPainDetected: z.boolean().default(false),
  requiresMedicalDisclaimer: z.boolean().default(false),
  requiresUserConfirmation: z.boolean().default(false),
  disclaimerText: z.string().optional(),
});

// Suggested Action Schema
export const SuggestedActionSchema = z.object({
  type: z.enum(['load_routine', 'clear_squats', 'view_plan', 'confirm_memory']),
  label: z.string(),
  payload: z.string().optional(),
});

// Memory Fact Candidate Schema for Gemini structured output
export const MemoryFactCandidateSchema = z.object({
  category: z.enum(['medical', 'nutrition', 'goal', 'preference', 'routine']),
  fact: z.string().min(1),
  sensitivity: z.enum(['low', 'high']),
});

// Gemini Chat Structured Output Schema
export const GeminiChatOutputSchema = z.object({
  reply: z.string().min(1),
  memoryCandidates: z.array(MemoryFactCandidateSchema).default([]),
  safetyFlags: SafetyFlagsSchema.default({
    medicalPainDetected: false,
    requiresMedicalDisclaimer: false,
    requiresUserConfirmation: false,
  }),
  suggestedActions: z.array(SuggestedActionSchema).default([]),
});
