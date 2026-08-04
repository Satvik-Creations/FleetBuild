import { WorkoutPlan } from '../types';

export const CURATED_WORKOUT_PROGRAMS: WorkoutPlan[] = [
  {
    id: 'prog-push-pull-legs',
    title: '4-Week Hypertrophy PPL (Push Pull Legs)',
    type: 'Program Split',
    difficulty: 'Intermediate',
    category: 'Hypertrophy',
    weekDuration: 4,
    durationMinutes: 50,
    caloriesBurned: 420,
    targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'],
    equipment: ['Barbell', 'Dumbbells', 'Cable Machine', 'Bench'],
    description: 'Classic 6-day split designed for maximum muscle growth, balanced recovery, and progressive overload.',
    aiRecommendation: 'Recommended for lifters with 6+ months experience seeking structured muscle building.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    exercises: [
      { id: 'ppl-1', name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: '60 kg', difficulty: 'Intermediate' },
      { id: 'ppl-2', name: 'Overhead Dumbbell Press', targetMuscle: 'Shoulders', sets: 3, reps: '10-12', weight: '16 kg', difficulty: 'Intermediate' },
      { id: 'ppl-3', name: 'Barbell Bent-Over Row', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: '50 kg', difficulty: 'Intermediate' },
      { id: 'ppl-4', name: 'Lat Pulldown', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: '50 kg', difficulty: 'Beginner' },
      { id: 'ppl-5', name: 'Barbell Back Squat', targetMuscle: 'Legs', sets: 4, reps: '8-10', weight: '80 kg', difficulty: 'Advanced' },
      { id: 'ppl-6', name: 'Barbell Bicep Curl', targetMuscle: 'Biceps', sets: 3, reps: '10-12', weight: '25 kg', difficulty: 'Beginner' }
    ]
  },
  {
    id: 'prog-full-body-shred',
    title: 'Full Body Fat Burner & Recomp',
    type: 'Fat Loss',
    difficulty: 'Beginner',
    category: 'Fat Loss',
    weekDuration: 4,
    durationMinutes: 40,
    caloriesBurned: 510,
    targetMuscles: ['Full Body', 'Core', 'Cardio', 'Legs'],
    equipment: ['Dumbbells', 'Bodyweight'],
    description: 'High-energy full body compound circuit designed to boost metabolism, retain lean muscle, and burn fat.',
    aiRecommendation: 'Ideal for fat loss and active conditioning without gym machinery.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    exercises: [
      { id: 'fb-1', name: 'Standard Push-Ups', targetMuscle: 'Chest', sets: 3, reps: '15', weight: 'Bodyweight', difficulty: 'Beginner' },
      { id: 'fb-2', name: 'Dumbbell Goblet Squat', targetMuscle: 'Quads & Glutes', sets: 4, reps: '12-15', weight: '16 kg', difficulty: 'Beginner' },
      { id: 'fb-3', name: 'Incline Dumbbell Press', targetMuscle: 'Upper Chest', sets: 3, reps: '12', weight: '18 kg', difficulty: 'Intermediate' },
      { id: 'fb-4', name: 'Forearm Plank', targetMuscle: 'Core', sets: 3, reps: '60 sec', weight: 'Bodyweight', difficulty: 'Beginner' }
    ]
  },
  {
    id: 'prog-upper-lower',
    title: '4-Week Upper / Lower Power & Strength',
    type: 'Strength',
    difficulty: 'Intermediate',
    category: 'Strength',
    weekDuration: 4,
    durationMinutes: 55,
    caloriesBurned: 460,
    targetMuscles: ['Chest', 'Back', 'Legs', 'Shoulders', 'Core'],
    equipment: ['Barbell', 'Rack', 'Dumbbells'],
    description: '4-day power split alternating between upper body compound pushes/pulls and heavy lower body strength work.',
    aiRecommendation: 'Great balance of strength and recovery for athletes with busy schedules.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    exercises: [
      { id: 'ul-1', name: 'Barbell Back Squat', targetMuscle: 'Legs', sets: 4, reps: '6-8', weight: '90 kg', difficulty: 'Advanced' },
      { id: 'ul-2', name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 4, reps: '6-8', weight: '70 kg', difficulty: 'Intermediate' },
      { id: 'ul-3', name: 'Romanian Deadlift (RDL)', targetMuscle: 'Hamstrings', sets: 4, reps: '8-10', weight: '70 kg', difficulty: 'Intermediate' },
      { id: 'ul-4', name: 'Barbell Bent-Over Row', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: '55 kg', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'prog-home-no-equipment',
    title: 'No-Equipment Home Warrior',
    type: 'Home Workout',
    difficulty: 'Beginner',
    category: 'Home & Travel',
    weekDuration: 4,
    durationMinutes: 30,
    caloriesBurned: 320,
    targetMuscles: ['Full Body', 'Abs', 'Chest', 'Legs'],
    equipment: ['No Equipment'],
    description: 'Zero equipment bodyweight workout routine you can perform anywhere, focusing on core stability, push endurance, and leg power.',
    aiRecommendation: 'Perfect for workouts at home, in hotel rooms, or outdoors.',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=80',
    exercises: [
      { id: 'hne-1', name: 'Standard Push-Ups', targetMuscle: 'Chest', sets: 4, reps: '15-20', weight: 'Bodyweight', difficulty: 'Beginner' },
      { id: 'hne-2', name: 'Air Squats', targetMuscle: 'Quads', sets: 4, reps: '20', weight: 'Bodyweight', difficulty: 'Beginner' },
      { id: 'hne-3', name: 'Forearm Plank', targetMuscle: 'Abs', sets: 3, reps: '60 sec', weight: 'Bodyweight', difficulty: 'Beginner' },
      { id: 'hne-4', name: 'Walking Lunges', targetMuscle: 'Legs', sets: 3, reps: '12 per leg', weight: 'Bodyweight', difficulty: 'Beginner' }
    ]
  },
  {
    id: 'prog-arnold-split',
    title: 'Arnold Chest, Back & Arms Blueprint',
    type: 'Advanced Hypertrophy',
    difficulty: 'Advanced',
    category: 'Hypertrophy',
    weekDuration: 4,
    durationMinutes: 65,
    caloriesBurned: 580,
    targetMuscles: ['Chest', 'Back', 'Biceps', 'Triceps', 'Shoulders'],
    equipment: ['Barbell', 'Dumbbells', 'Bench', 'Cable Machine'],
    description: 'High volume classic antagonist super-set routine paired chest with back and biceps with triceps for max pump.',
    aiRecommendation: 'High intensity split intended for experienced lifters seeking maximum upper body volume.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
    exercises: [
      { id: 'arn-1', name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 5, reps: '8-10', weight: '75 kg', difficulty: 'Intermediate' },
      { id: 'arn-2', name: 'Barbell Bent-Over Row', targetMuscle: 'Back', sets: 5, reps: '8-10', weight: '60 kg', difficulty: 'Intermediate' },
      { id: 'arn-3', name: 'Incline Dumbbell Press', targetMuscle: 'Chest', sets: 4, reps: '10', weight: '24 kg', difficulty: 'Intermediate' },
      { id: 'arn-4', name: 'Lat Pulldown', targetMuscle: 'Back', sets: 4, reps: '10', weight: '60 kg', difficulty: 'Beginner' },
      { id: 'arn-5', name: 'Barbell Bicep Curl', targetMuscle: 'Biceps', sets: 4, reps: '12', weight: '30 kg', difficulty: 'Beginner' },
      { id: 'arn-6', name: 'Cable Tricep Pushdown', targetMuscle: 'Triceps', sets: 4, reps: '12', weight: '35 kg', difficulty: 'Beginner' }
    ]
  }
];
