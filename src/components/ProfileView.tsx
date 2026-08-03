import React, { useState, useEffect } from 'react';
import { UserProfile, MemoryFact } from '../domain/models';
import { api } from '../lib/api';
import {
  User,
  ShieldAlert,
  Brain,
  Check,
  X,
  RefreshCw,
  Save,
  Dumbbell,
  Target,
  Sparkles,
  AlertCircle,
  FileCheck,
  HeartPulse,
  Plus,
} from 'lucide-react';

interface ProfileViewProps {
  onNavigateToFleetBot: () => void;
  onSignOut: () => void;
  showToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToFleetBot, onSignOut, showToast }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [primaryFocus, setPrimaryFocus] = useState<UserProfile['fitnessGoal']['primaryFocus']>('fat_loss');
  const [equipmentInput, setEquipmentInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');
  const [injuryDesc, setInjuryDesc] = useState('');
  const [injurySeverity, setInjurySeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [dietaryInput, setDietaryInput] = useState('');
  const [medicalDisclaimer, setMedicalDisclaimer] = useState(true);
  const [dataConsent, setDataConsent] = useState(true);

  const fetchProfileAndMemory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileData, memoryData] = await Promise.all([
        api.getProfile(),
        api.getMemoryFacts(),
      ]);

      setProfile(profileData);
      setMemoryFacts(memoryData);

      // Populate form fields
      setName(profileData.name || '');
      setEmail(profileData.email || '');
      setGoalTitle(profileData.fitnessGoal?.title || '');
      setGoalDesc(profileData.fitnessGoal?.targetDescription || '');
      setPrimaryFocus(profileData.fitnessGoal?.primaryFocus || 'fat_loss');
      setEquipmentInput(profileData.equipmentAccess?.join(', ') || '');
      setExcludedInput(profileData.exercisePreferences?.excludedExercises?.join(', ') || '');
      setDietaryInput(profileData.dietaryRestrictions?.join(', ') || '');
      setMedicalDisclaimer(profileData.userConsent?.medicalDisclaimerAccepted ?? true);
      setDataConsent(profileData.userConsent?.dataStorageConsent ?? true);
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      const msg = err instanceof Error ? err.message : 'Unable to connect to FleetBuild API';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndMemory();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const equipmentArray = equipmentInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const excludedArray = excludedInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const dietaryArray = dietaryInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updatePayload = {
        name,
        email,
        fitnessGoal: {
          id: profile?.fitnessGoal?.id || 'fg-1',
          title: goalTitle,
          targetDescription: goalDesc,
          primaryFocus,
        },
        equipmentAccess: equipmentArray,
        exercisePreferences: {
          preferredExercises: profile?.exercisePreferences?.preferredExercises || [],
          excludedExercises: excludedArray,
          equipment: equipmentArray,
        },
        dietaryRestrictions: dietaryArray,
        userConsent: {
          medicalDisclaimerAccepted: medicalDisclaimer,
          dataStorageConsent: dataConsent,
          consentDate: new Date().toISOString(),
        },
      };

      const updatedProfile = await api.updateProfile(updatePayload);
      setProfile(updatedProfile);
      showToast('Profile and onboarding parameters saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInjury = async () => {
    if (!injuryDesc.trim() || !profile) return;
    const newConstraint = {
      id: `hc-${Date.now()}`,
      category: 'injury' as const,
      description: injuryDesc.trim(),
      severity: injurySeverity,
      active: true,
      notes: 'Added manually via Profile Onboarding screen.',
    };

    const updatedConstraints = [...profile.healthConstraints, newConstraint];
    setProfile({ ...profile, healthConstraints: updatedConstraints });
    setInjuryDesc('');

    try {
      await api.updateProfile({ healthConstraints: updatedConstraints });
      showToast('Added health constraint/injury profile.');
    } catch (err) {
      console.error('Error adding injury:', err);
      showToast('Failed to save health constraint.');
    }
  };

  const handleConfirmMemoryFact = async (factId: string, action: 'confirm' | 'reject') => {
    try {
      await api.confirmMemory(factId, action);

      // Update state locally
      setMemoryFacts((prev) =>
        prev.map((f) => (f.id === factId ? { ...f, status: action === 'confirm' ? 'confirmed' : 'rejected' } : f))
      );

      if (action === 'confirm') {
        showToast('Confirmed AI Memory Fact! Persistent memory updated.');
        // Refresh profile if medical constraint was updated
        fetchProfileAndMemory();
      } else {
        showToast('Rejected memory candidate.');
      }
    } catch (err) {
      console.error('Memory confirm error:', err);
      showToast('Failed to update memory status.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4 p-8">
        <RefreshCw className="w-10 h-10 text-[#FF5722] animate-spin" />
        <p className="text-sm font-semibold text-white/70">Syncing Profile & AI Memory Repository...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-[#1E1E1E] border border-red-500/30 max-w-2xl mx-auto text-center space-y-4 my-8">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Failed to Load Profile</h3>
        <p className="text-xs text-white/60">{error}</p>
        <button
          onClick={fetchProfileAndMemory}
          className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const candidateFacts = memoryFacts.filter((f) => f.status === 'candidate');
  const confirmedFacts = memoryFacts.filter((f) => f.status === 'confirmed');

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1E1E1E] to-[#161616] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FF5722]/20 text-[#FF5722] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3 h-3" />
              Authenticated Athlete Profile
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Durable AI Memory Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Profile & Biomechanical Memory Engine
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-2xl">
            Configure your core fitness parameters, health constraints, equipment access, and review sensitive AI memory facts needing your explicit confirmation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToFleetBot}
            className="px-5 py-3 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-[#FF5722]/30 transition-all cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            <span>Chat with FleetBot</span>
          </button>
          <button
            onClick={onSignOut}
            className="px-4 py-3 rounded-2xl bg-[#121212] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-white hover:text-red-400 font-bold text-xs transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Candidate Memory Confirmation Required Banner (Crucial Requirement) */}
      {candidateFacts.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#1E1E1E] border-2 border-[#FFC107] shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFC107]/20 text-[#FFC107] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>AI Memory Confirmation Required</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFC107]/20 text-[#FFC107] text-[10px]">
                    {candidateFacts.length} Pending
                  </span>
                </h3>
                <p className="text-xs text-white/60">
                  FleetBot inferred these sensitive facts from your recent conversations. Confirm to save them permanently to your profile memory.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {candidateFacts.map((fact) => (
              <div
                key={fact.id}
                className="p-4 rounded-2xl bg-[#121212] border border-white/10 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-[#FFC107] uppercase tracking-wider">{fact.category} Fact</span>
                    <span className="text-white/40">Requires Consent</span>
                  </div>
                  <p className="text-xs text-white/90 font-medium">{fact.fact}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleConfirmMemoryFact(fact.id, 'confirm')}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Persist</span>
                  </button>
                  <button
                    onClick={() => handleConfirmMemoryFact(fact.id, 'reject')}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Profile Form Grid */}
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 & 2: Main Personal & Fitness Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Basic Details */}
          <div className="p-6 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#FF5722]" />
              Athlete Identity & Account
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3 text-sm text-white focus:border-[#FF5722] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3 text-sm text-white focus:border-[#FF5722] outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fitness Goal & Primary Focus */}
          <div className="p-6 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#FF5722]" />
              Primary Fitness Goal & Focus
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">Goal Title</label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3 text-sm text-white focus:border-[#FF5722] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">Primary Training Focus</label>
                  <select
                    value={primaryFocus}
                    onChange={(e) => setPrimaryFocus(e.target.value as any)}
                    className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3 text-sm text-white focus:border-[#FF5722] outline-none cursor-pointer"
                  >
                    <option value="fat_loss">Lean Fat Loss & Definition</option>
                    <option value="hypertrophy">Muscle Hypertrophy</option>
                    <option value="strength">Raw Strength Development</option>
                    <option value="endurance">Cardiovascular Endurance</option>
                    <option value="rehab">Joint Rehab & Recovery</option>
                    <option value="general_fitness">General Health & Longevity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">Goal Description & Milestones</label>
                <textarea
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3 text-sm text-white focus:border-[#FF5722] outline-none resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Equipment Access & Excluded Exercises */}
          <div className="p-6 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#FF5722]" />
              Equipment Access & Exercise Exclusions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">Equipment Available (Comma Separated)</label>
                <input
                  type="text"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  placeholder="Full Gym, Dumbbells, Cables, Resistance Bands"
                  className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3 text-sm text-white focus:border-[#FF5722] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">Excluded Exercises / Dislikes (Comma Separated)</label>
                <input
                  type="text"
                  value={excludedInput}
                  onChange={(e) => setExcludedInput(e.target.value)}
                  placeholder="Barbell Squats, Overhead Press, Burpees"
                  className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3 text-sm text-white focus:border-[#FF5722] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1.5">Dietary Restrictions & Preferences</label>
              <input
                type="text"
                value={dietaryInput}
                onChange={(e) => setDietaryInput(e.target.value)}
                placeholder="High Protein, Gluten-Free, Low Lactose"
                className="w-full bg-[#121212] border border-white/10 rounded-2xl p-3 text-sm text-white focus:border-[#FF5722] outline-none"
              />
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-4 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-extrabold text-sm flex items-center gap-3 shadow-2xl shadow-[#FF5722]/40 transition-all cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>

        {/* Column 3: Health Constraints & Active AI Memories */}
        <div className="space-y-6">
          {/* Health Constraints & Injuries */}
          <div className="p-6 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#FF5722]" />
              Health Constraints & Injury Profile
            </h2>

            {/* List Active Constraints */}
            <div className="space-y-2">
              {profile?.healthConstraints && profile.healthConstraints.length > 0 ? (
                profile.healthConstraints.map((hc) => (
                  <div
                    key={hc.id}
                    className="p-3.5 rounded-2xl bg-[#121212] border border-[#FF5722]/30 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>⚠️ {hc.description}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#FF5722]/20 text-[#FF5722]">
                          {hc.severity}
                        </span>
                      </div>
                      {hc.notes && <p className="text-[11px] text-white/50 mt-1">{hc.notes}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-[#121212] text-xs text-white/40 text-center">
                  No active medical or injury constraints recorded.
                </div>
              )}
            </div>

            {/* Inline Add Injury */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <span className="text-xs font-bold text-white/80 block">Add New Injury / Joint Constraint</span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={injuryDesc}
                  onChange={(e) => setInjuryDesc(e.target.value)}
                  placeholder="e.g. Left Knee Patellar Tendinitis"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#FF5722] outline-none"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={injurySeverity}
                    onChange={(e) => setInjurySeverity(e.target.value as any)}
                    className="flex-1 bg-[#121212] border border-white/10 rounded-xl p-2 text-xs text-white focus:border-[#FF5722] outline-none cursor-pointer"
                  >
                    <option value="mild">Mild (Slight soreness)</option>
                    <option value="moderate">Moderate (Modify heavy exercises)</option>
                    <option value="severe">Severe (Avoid loading joint)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddInjury}
                    disabled={!injuryDesc.trim()}
                    className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Confirmed AI Memory Facts */}
          <div className="p-6 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#FF5722]" />
                Confirmed AI Memories ({confirmedFacts.length})
              </h2>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
              {confirmedFacts.length > 0 ? (
                confirmedFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-3 rounded-2xl bg-[#121212] border border-white/10 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#FF5722] font-bold uppercase">{fact.category}</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Confirmed
                      </span>
                    </div>
                    <p className="text-white/80 font-medium">{fact.fact}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-[#121212] text-xs text-white/40 text-center">
                  No confirmed memory facts. Chat with FleetBot to build memory over time.
                </div>
              )}
            </div>
          </div>

          {/* Consent & Safety Compliance */}
          <div className="p-6 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Safety & Data Consent
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={medicalDisclaimer}
                  onChange={(e) => setMedicalDisclaimer(e.target.checked)}
                  className="mt-0.5 accent-[#FF5722] w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-white/70 leading-relaxed">
                  I understand FleetBot provides AI guidance, not medical diagnosis. I agree to consult a doctor for physical pain.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataConsent}
                  onChange={(e) => setDataConsent(e.target.checked)}
                  className="mt-0.5 accent-[#FF5722] w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-white/70 leading-relaxed">
                  Allow persistent storage of encrypted workout metrics and AI memory facts.
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
