import React, { useState } from 'react';
import { api, OnboardingPayload } from '../lib/api';
import { UserProfile } from '../domain/models';
import { Shield, Dumbbell, Target, AlertTriangle, Utensils, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface OnboardingViewProps {
  initialName: string;
  onOnboardingComplete: (updatedProfile: UserProfile) => void;
}

const EQUIPMENT_OPTIONS = [
  'Full Gym',
  'Dumbbells',
  'Barbell',
  'Resistance Bands',
  'Cable Machine',
  'Kettlebells',
  'Pull-up Bar',
  'Bodyweight Only',
];

const GOAL_FOCUS_OPTIONS: { id: 'hypertrophy' | 'fat_loss' | 'strength' | 'endurance' | 'rehab' | 'general_fitness'; label: string; desc: string }[] = [
  { id: 'hypertrophy', label: 'Muscle Gain & Hypertrophy', desc: 'Build lean muscular mass & strength' },
  { id: 'fat_loss', label: 'Fat Loss & Definition', desc: 'Burn body fat while retaining muscle' },
  { id: 'strength', label: 'Pure Athletic Strength', desc: 'Focus on compound power & heavy force' },
  { id: 'general_fitness', label: 'General Health & Vitality', desc: 'Overall longevity, core, & energy' },
  { id: 'endurance', label: 'Stamina & Endurance', desc: 'Cardiovascular output & muscular endurance' },
  { id: 'rehab', label: 'Rehab & Joint Mobility', desc: 'Low-impact movement & pain-free function' },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ initialName, onOnboardingComplete }) => {
  const [name, setName] = useState(initialName || '');
  const [goalFocus, setGoalFocus] = useState<'hypertrophy' | 'fat_loss' | 'strength' | 'endurance' | 'rehab' | 'general_fitness'>('general_fitness');
  const [goalTitle, setGoalTitle] = useState('General Health & Fitness');
  const [equipment, setEquipment] = useState<string[]>(['Dumbbells', 'Bodyweight Only']);
  const [limitations, setLimitations] = useState('');
  const [dietaryInput, setDietaryInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const handleGoalSelect = (focus: 'hypertrophy' | 'fat_loss' | 'strength' | 'endurance' | 'rehab' | 'general_fitness', defaultTitle: string) => {
    setGoalFocus(focus);
    if (!goalTitle || GOAL_FOCUS_OPTIONS.some((g) => g.label === goalTitle)) {
      setGoalTitle(defaultTitle);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your display name.');
      return;
    }

    if (!goalTitle.trim()) {
      setError('Please specify your primary fitness goal.');
      return;
    }

    setLoading(true);

    try {
      const payload: OnboardingPayload = {
        name: name.trim(),
        primaryFitnessGoal: goalTitle.trim(),
        goalFocus,
        goalDescription: goalTitle.trim(),
        equipmentAccess: equipment,
        healthConstraints: limitations.trim(),
        dietaryRestrictions: dietaryInput.trim()
          ? dietaryInput.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const res = await api.completeOnboarding(payload);
      onOnboardingComplete(res.profile);
    } catch (err: any) {
      setError(err?.message || 'Failed to save onboarding information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-4 sm:p-8 font-sans relative">
      <div className="w-full max-w-2xl bg-[#1E1E1E] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FF5722]/20 via-[#FFC107]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5722]/15 border border-[#FF5722]/30 text-[#FF5722] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalization Setup</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Configure Your Personal Space</h1>
          <p className="text-xs sm:text-sm text-white/60">
            Tell us about your fitness targets and equipment so FleetBot can adapt guidance specifically for you.
          </p>
        </div>

        {/* Disclaimer Callout Box */}
        <div className="p-4 rounded-2xl bg-[#121212] border border-white/10 text-xs text-white/70 flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#FF5722] shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Privacy Notice:</strong> This information is used strictly to personalize general fitness guidance for your account. We never share or publish your personal data.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Display Name */}
          <div className="space-y-2">
            <label htmlFor="onboarding-name" className="text-xs font-bold text-white/80 block uppercase tracking-wider">
              Display Name
            </label>
            <input
              id="onboarding-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex or Jane"
              className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5722] transition-colors"
            />
          </div>

          {/* Primary Goal Category */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/80 block uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-[#FF5722]" />
              <span>Primary Fitness Focus</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_FOCUS_OPTIONS.map((g) => {
                const isSelected = goalFocus === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGoalSelect(g.id, g.label)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#FF5722]/15 border-[#FF5722] text-white shadow-lg shadow-[#FF5722]/10'
                        : 'bg-[#121212] border-white/5 text-white/60 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <p className={`text-xs font-bold ${isSelected ? 'text-[#FF5722]' : 'text-white'}`}>{g.label}</p>
                    <p className="text-[11px] text-white/50 mt-0.5">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Goal Title */}
          <div className="space-y-2">
            <label htmlFor="onboarding-goal-title" className="text-xs font-bold text-white/80 block uppercase tracking-wider">
              Specific Goal Statement
            </label>
            <input
              id="onboarding-goal-title"
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Build core strength & improve shoulder mobility"
              className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5722] transition-colors"
            />
          </div>

          {/* Equipment Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/80 block uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#FFC107]" />
              <span>Available Equipment</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((item) => {
                const active = equipment.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#FFC107]/20 border-[#FFC107] text-[#FFC107]'
                        : 'bg-[#121212] border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC107]" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Injuries / Limitations (Optional) */}
          <div className="space-y-2">
            <label htmlFor="onboarding-limitations" className="text-xs font-bold text-white/80 block uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Injuries or Limitations (Optional)</span>
            </label>
            <input
              id="onboarding-limitations"
              type="text"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="e.g. Mild lower back tightness, avoid overhead presses"
              className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5722] transition-colors"
            />
          </div>

          {/* Dietary Restrictions (Optional) */}
          <div className="space-y-2">
            <label htmlFor="onboarding-diet" className="text-xs font-bold text-white/80 block uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Dietary Restrictions (Optional)</span>
            </label>
            <input
              id="onboarding-diet"
              type="text"
              value={dietaryInput}
              onChange={(e) => setDietaryInput(e.target.value)}
              placeholder="e.g. Vegetarian, High Protein, Gluten-Free (comma-separated)"
              className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5722] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-8 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#FF5722]/30 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Onboarding & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
