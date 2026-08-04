import { Exercise, BodyMuscleGroup } from '../types';

export interface ExerciseDetail extends Exercise {
  category: BodyMuscleGroup;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  instructions: string[];
  commonMistakes: string[];
  tips: string;
  imageUrl: string;
}

export const EXERCISE_DATABASE: ExerciseDetail[] = [
  // CHEST
  {
    id: 'ex-bench-press',
    name: 'Barbell Bench Press',
    targetMuscle: 'Chest',
    category: 'Chest',
    sets: 4,
    reps: '8-10',
    weight: '60 kg',
    difficulty: 'Intermediate',
    equipment: 'Barbell & Bench',
    instructions: [
      'Lie flat on the bench with feet firmly planted on the floor.',
      'Grip the barbell slightly wider than shoulder-width apart.',
      'Unrack the bar and lower it smoothly to your mid-chest level.',
      'Press explosively upward until arms are extended without locking elbows.'
    ],
    commonMistakes: [
      'Bouncing the barbell off the chest.',
      'Flaring elbows out at a 90-degree angle.',
      'Lifting hips off the bench during heavy exertion.'
    ],
    tips: 'Retract your shoulder blades and keep your core tight throughout the lift.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ex-incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    targetMuscle: 'Chest',
    category: 'Chest',
    sets: 3,
    reps: '10-12',
    weight: '20 kg',
    difficulty: 'Intermediate',
    equipment: 'Dumbbells & Incline Bench',
    instructions: [
      'Set an adjustable bench to a 30-45 degree incline.',
      'Hold dumbbells at shoulder height with palms facing forward.',
      'Press the dumbbells up toward the ceiling until arms are extended.',
      'Lower under control back to upper chest level.'
    ],
    commonMistakes: [
      'Setting bench angle too high (shifts load to front delts).',
      'Clashing dumbbells at the top.'
    ],
    tips: 'Focus on squeezing the upper chest at the top of each rep.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ex-pushups',
    name: 'Standard Push-Ups',
    targetMuscle: 'Chest',
    category: 'Chest',
    sets: 3,
    reps: '15-20',
    weight: 'Bodyweight',
    difficulty: 'Beginner',
    equipment: 'No Equipment',
    instructions: [
      'Place hands slightly wider than shoulder-width on the floor.',
      'Maintain a rigid plank line from head to heels.',
      'Lower your chest until it nearly touches the floor.',
      'Push firmly back up to the starting position.'
    ],
    commonMistakes: [
      'Sagging hips or arching lower back.',
      'Tucking head down toward the floor.'
    ],
    tips: 'Engage glutes and core to keep your body straight like a plank.',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80'
  },

  // BACK
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown',
    targetMuscle: 'Back',
    category: 'Back',
    sets: 4,
    reps: '10-12',
    weight: '50 kg',
    difficulty: 'Beginner',
    equipment: 'Cable Machine',
    instructions: [
      'Sit facing the lat pulldown machine and adjust the knee pad.',
      'Grip the wide bar with palms facing forward.',
      'Pull the bar down toward upper chest while leaning slightly back.',
      'Slowly return the bar to full arm extension.'
    ],
    commonMistakes: [
      'Pulling the bar behind the neck.',
      'Using excessive momentum or swinging backwards.'
    ],
    tips: 'Initiate the movement by driving your elbows down and back.',
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ex-bent-over-row',
    name: 'Barbell Bent-Over Row',
    targetMuscle: 'Back',
    category: 'Back',
    sets: 4,
    reps: '8-10',
    weight: '50 kg',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    instructions: [
      'Hinge at the hips with knees slightly bent and back flat at 45 degrees.',
      'Hold barbell with overhand grip wider than shoulders.',
      'Pull bar toward lower rib cage, driving elbows back.',
      'Lower under control to full arm stretch.'
    ],
    commonMistakes: [
      'Rounding the lower back.',
      'Standing too upright during reps.'
    ],
    tips: 'Keep your neck neutral looking a few feet in front of your toes.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80'
  },

  // SHOULDERS
  {
    id: 'ex-overhead-press',
    name: 'Dumbbell Overhead Press',
    targetMuscle: 'Shoulders',
    category: 'Shoulders',
    sets: 3,
    reps: '10-12',
    weight: '16 kg',
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    instructions: [
      'Sit or stand holding dumbbells at shoulder level with elbows bent.',
      'Press weights overhead until arms are fully extended.',
      'Lower controlled back to ear level.'
    ],
    commonMistakes: [
      'Arching lower back excessively.',
      'Pressing forward instead of straight overhead.'
    ],
    tips: 'Brace your abdominal muscles as if preparing for a impact.',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ex-lateral-raises',
    name: 'Dumbbell Lateral Raise',
    targetMuscle: 'Shoulders',
    category: 'Shoulders',
    sets: 3,
    reps: '12-15',
    weight: '8 kg',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    instructions: [
      'Stand with feet hip-width apart holding light dumbbells at sides.',
      'With elbows slightly bent, raise arms out to sides until shoulder height.',
      'Pause briefly, then lower with control.'
    ],
    commonMistakes: [
      'Swinging body for momentum.',
      'Raising hands above elbow height.'
    ],
    tips: 'Think about pouring water out of two pitchers at the top.',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80'
  },

  // ARMS (BICEPS / TRICEPS / FOREARMS)
  {
    id: 'ex-bicep-curl',
    name: 'Barbell Bicep Curl',
    targetMuscle: 'Biceps',
    category: 'Biceps',
    sets: 3,
    reps: '10-12',
    weight: '25 kg',
    difficulty: 'Beginner',
    equipment: 'Barbell / EZ-Bar',
    instructions: [
      'Stand upright holding bar with underhand grip at shoulder-width.',
      'Keep elbows tucked close to your torso.',
      'Curl weight up toward chest while squeezing biceps.',
      'Lower back down under full control.'
    ],
    commonMistakes: [
      'Swinging hips or leaning back.',
      'Allowing elbows to drift forward.'
    ],
    tips: 'Keep tension on the biceps by avoiding locking out passively at bottom.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ex-tricep-pushdown',
    name: 'Cable Tricep Pushdown',
    targetMuscle: 'Triceps',
    category: 'Triceps',
    sets: 3,
    reps: '12-15',
    weight: '30 kg',
    difficulty: 'Beginner',
    equipment: 'Cable Machine',
    instructions: [
      'Attach rope or bar to high cable pulley.',
      'Keep upper arms pinned to your sides.',
      'Push attachment down until arms are straight.',
      'Squeeze triceps hard before controlling return.'
    ],
    commonMistakes: [
      'Flaring elbows out to sides.',
      'Letting shoulders hunch forward.'
    ],
    tips: 'Maintain a firm, upright posture with knees slightly unlocked.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80'
  },

  // LEGS (QUADS / HAMSTRINGS / CALVES / GLUTES)
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    targetMuscle: 'Quads & Glutes',
    category: 'Quads',
    sets: 4,
    reps: '8-10',
    weight: '80 kg',
    difficulty: 'Advanced',
    equipment: 'Barbell & Squat Rack',
    instructions: [
      'Rest barbell across upper back/traps with firm grip.',
      'Set feet shoulder-width apart, toes pointed slightly outward.',
      'Hinge hips back and bend knees to lower until thighs are parallel to floor.',
      'Drive through heels to stand back up.'
    ],
    commonMistakes: [
      'Knees collapsing inward (valgus).',
      'Heels lifting off the floor.'
    ],
    tips: 'Brace core hard and push knees outward in line with your toes.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ex-romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings & Glutes',
    category: 'Hamstrings',
    sets: 4,
    reps: '10-12',
    weight: '60 kg',
    difficulty: 'Intermediate',
    equipment: 'Barbell or Dumbbells',
    instructions: [
      'Stand holding weight with overhand grip at hip level.',
      'Push hips back while maintaining flat back and soft knees.',
      'Lower weight along shins until stretch is felt in hamstrings.',
      'Drive hips forward to return to starting position.'
    ],
    commonMistakes: [
      'Rounding lower spine.',
      'Bending knees too much (turning into squat).'
    ],
    tips: 'Think of pushing a door shut behind you with your glutes.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'
  },

  // CORE / ABS
  {
    id: 'ex-plank',
    name: 'Forearm Plank',
    targetMuscle: 'Core & Abs',
    category: 'Abs',
    sets: 3,
    reps: '60 sec',
    weight: 'Bodyweight',
    difficulty: 'Beginner',
    equipment: 'No Equipment',
    instructions: [
      'Place forearms on mat with elbows under shoulders.',
      'Extend legs back with toes on floor.',
      'Keep body in straight line from head to heels.',
      'Hold position while breathing steadily.'
    ],
    commonMistakes: [
      'Sagging midsection or sticking hips high in air.',
      'Holding breath.'
    ],
    tips: 'Squeeze glutes and pull belly button toward your spine.',
    imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    targetMuscle: 'Lower Abs',
    category: 'Abs',
    sets: 3,
    reps: '12-15',
    weight: 'Bodyweight',
    difficulty: 'Advanced',
    equipment: 'Pull-Up Bar',
    instructions: [
      'Hang from pull-up bar with overhand grip.',
      'Keep legs straight or slightly bent at knees.',
      'Raise legs up until parallel to floor or higher.',
      'Lower back down slowly without swinging.'
    ],
    commonMistakes: [
      'Using body momentum to swing legs up.',
      'Dropping legs down rapidly.'
    ],
    tips: 'Tilt pelvis backward at top to maximize lower abdominal contraction.',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80'
  }
];
