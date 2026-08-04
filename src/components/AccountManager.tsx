import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, NotificationPreferences, PrivacySettings } from '../domain/models';
import { api, UserSummary } from '../lib/api';
import {
  User,
  KeyRound,
  Camera,
  Sliders,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Upload,
  Lock,
  Mail,
  Dumbbell,
  Bell,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  ExternalLink,
  Info,
} from 'lucide-react';

interface AccountManagerProps {
  user: UserSummary | null;
  profile: UserProfile;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
  showToast: (message: string) => void;
  onClose?: () => void;
  onSignOut?: () => void;
}

type TabType = 'overview' | 'edit-profile' | 'security' | 'avatar' | 'preferences' | 'danger-zone';

export const AccountManager: React.FC<AccountManagerProps> = ({
  user,
  profile,
  onProfileUpdated,
  showToast,
  onClose,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State for Profile Edits
  const [name, setName] = useState(profile.name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [email, setEmail] = useState(profile.email || '');
  const [age, setAge] = useState<string>(profile.age ? String(profile.age) : '');
  const [gender, setGender] = useState<UserProfile['gender']>(profile.gender || 'prefer_not_to_say');
  const [heightCm, setHeightCm] = useState<string>(profile.heightCm ? String(profile.heightCm) : '');
  const [weightKg, setWeightKg] = useState<string>(profile.weightKg ? String(profile.weightKg) : '');
  const [experienceLevel, setExperienceLevel] = useState<UserProfile['experienceLevel']>(profile.experienceLevel || 'intermediate');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(profile.activityLevel || 'moderately_active');
  const [preferredSplit, setPreferredSplit] = useState<UserProfile['preferredSplit']>(profile.preferredSplit || 'push_pull_legs');
  const [preferredDays, setPreferredDays] = useState<string[]>(profile.preferredWorkoutDays || ['Mon', 'Wed', 'Fri']);
  const [unitPreference, setUnitPreference] = useState<'metric' | 'imperial'>(profile.unitPreference || 'metric');

  // Fitness Goal
  const [goalTitle, setGoalTitle] = useState(profile.fitnessGoal?.title || '');
  const [goalFocus, setGoalFocus] = useState(profile.fitnessGoal?.primaryFocus || 'general_fitness');
  const [goalDescription, setGoalDescription] = useState(profile.fitnessGoal?.targetDescription || '');

  // Preferences & Tags
  const [preferredExercisesText, setPreferredExercisesText] = useState(
    (profile.exercisePreferences?.preferredExercises || []).join(', ')
  );
  const [excludedExercisesText, setExcludedExercisesText] = useState(
    (profile.exercisePreferences?.excludedExercises || []).join(', ')
  );
  const [equipmentText, setEquipmentText] = useState(
    (profile.equipmentAccess || []).join(', ')
  );
  const [dietaryText, setDietaryText] = useState(
    (profile.dietaryRestrictions || []).join(', ')
  );
  const [injuryNotes, setInjuryNotes] = useState(
    (profile.healthConstraints || []).map((hc) => hc.description).join('; ')
  );

  // Notifications
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    workoutReminders: profile.notificationPreferences?.workoutReminders ?? true,
    recoveryAlerts: profile.notificationPreferences?.recoveryAlerts ?? true,
    weeklyProgressReport: profile.notificationPreferences?.weeklyProgressReport ?? true,
    aiCoachTips: profile.notificationPreferences?.aiCoachTips ?? true,
  });

  // Privacy
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    shareAnalytics: profile.privacySettings?.shareAnalytics ?? false,
    allowAiContextMemory: profile.privacySettings?.allowAiContextMemory ?? true,
    publicProfile: profile.privacySettings?.publicProfile ?? false,
  });

  // Avatar Upload State
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Danger Zone / Account Deletion State
  const [deletionPassword, setDeletionPassword] = useState('');
  const [deletionConfirmText, setDeletionConfirmText] = useState('');
  const [isExecutingDeletion, setIsExecutingDeletion] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);

  // Sync state if profile changes externally
  useEffect(() => {
    setName(profile.name || '');
    setUsername(profile.username || '');
    setEmail(profile.email || '');
    setAge(profile.age ? String(profile.age) : '');
    setGender(profile.gender || 'prefer_not_to_say');
    setHeightCm(profile.heightCm ? String(profile.heightCm) : '');
    setWeightKg(profile.weightKg ? String(profile.weightKg) : '');
    setExperienceLevel(profile.experienceLevel || 'intermediate');
    setActivityLevel(profile.activityLevel || 'moderately_active');
    setPreferredSplit(profile.preferredSplit || 'push_pull_legs');
    setPreferredDays(profile.preferredWorkoutDays || ['Mon', 'Wed', 'Fri']);
    setUnitPreference(profile.unitPreference || 'metric');
    setGoalTitle(profile.fitnessGoal?.title || '');
    setGoalFocus(profile.fitnessGoal?.primaryFocus || 'general_fitness');
    setGoalDescription(profile.fitnessGoal?.targetDescription || '');
    setPreferredExercisesText((profile.exercisePreferences?.preferredExercises || []).join(', '));
    setExcludedExercisesText((profile.exercisePreferences?.excludedExercises || []).join(', '));
    setEquipmentText((profile.equipmentAccess || []).join(', '));
    setDietaryText((profile.dietaryRestrictions || []).join(', '));
    setInjuryNotes((profile.healthConstraints || []).map((hc) => hc.description).join('; '));
    setAvatarPreview(profile.avatarUrl);
  }, [profile]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (preferredDays.includes(day)) {
      setPreferredDays(preferredDays.filter((d) => d !== day));
    } else {
      setPreferredDays([...preferredDays, day]);
    }
  };

  // Avatar File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 1.5MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result as string;
      setAvatarPreview(base64Str);
      setErrorMessage(null);
      setSuccessMessage('Avatar updated! Click "Save All Changes" to persist across the header and profile.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    setSuccessMessage('Avatar removed. Click "Save All Changes" to finalize.');
  };

  // Save Main Profile Handler
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const preferredArray = preferredExercisesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const excludedArray = excludedExercisesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const equipmentArray = equipmentText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const dietaryArray = dietaryText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const healthConstraintsArray = injuryNotes.trim()
        ? [
            {
              id: `hc-${Date.now()}`,
              category: 'injury' as const,
              description: injuryNotes.trim(),
              severity: 'moderate' as const,
              active: true,
            },
          ]
        : [];

      const parsedAge = age ? parseInt(age, 10) : undefined;
      const parsedHeight = heightCm ? parseFloat(heightCm) : undefined;
      const parsedWeight = weightKg ? parseFloat(weightKg) : undefined;

      const updatePayload: Partial<UserProfile> = {
        name: name.trim(),
        username: username.trim() || undefined,
        email: email.trim(),
        avatarUrl: avatarPreview,
        age: parsedAge && !isNaN(parsedAge) ? parsedAge : undefined,
        gender,
        heightCm: parsedHeight && !isNaN(parsedHeight) ? parsedHeight : undefined,
        weightKg: parsedWeight && !isNaN(parsedWeight) ? parsedWeight : undefined,
        experienceLevel,
        activityLevel,
        preferredSplit,
        preferredWorkoutDays: preferredDays,
        unitPreference,
        fitnessGoal: {
          id: profile.fitnessGoal?.id || 'fg-1',
          title: goalTitle || 'General Fitness',
          targetDescription: goalDescription || goalTitle,
          primaryFocus: goalFocus,
        },
        equipmentAccess: equipmentArray,
        exercisePreferences: {
          preferredExercises: preferredArray,
          excludedExercises: excludedArray,
          equipment: equipmentArray,
        },
        healthConstraints: healthConstraintsArray,
        dietaryRestrictions: dietaryArray,
        notificationPreferences: notifications,
        privacySettings: privacy,
      };

      const updated = await api.updateProfile(updatePayload);
      onProfileUpdated(updated);
      setSuccessMessage('Account preferences and profile image saved successfully!');
      showToast('Account settings updated!');
    } catch (err: any) {
      console.error('Failed to update account:', err);
      setErrorMessage(err.message || 'Failed to save account settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword) {
      setPasswordStatus({ type: 'error', msg: 'Please enter your current password.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', msg: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Password changed successfully!');
    } catch (err: any) {
      setPasswordStatus({ type: 'error', msg: err.message || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Danger Zone: Execute Account Deletion
  const handleConfirmDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeletionError(null);

    const normalized = deletionConfirmText.trim().toLowerCase();
    if (normalized !== 'delete my account' && normalized !== 'delete my fleetbuild account' && normalized !== 'delete account') {
      setDeletionError('Please type "delete my account" in the confirmation box below.');
      return;
    }

    if (!deletionPassword) {
      setDeletionError('Please enter your account password.');
      return;
    }

    setIsExecutingDeletion(true);
    try {
      await api.deleteAccount({
        password: deletionPassword,
        confirmationText: deletionConfirmText.trim(),
      });

      showToast('Account permanently deleted.');
      if (onSignOut) {
        onSignOut();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setDeletionError(err.message || 'Account deletion failed. Verify your password.');
    } finally {
      setIsExecutingDeletion(false);
    }
  };

  // Password strength calculation helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-zinc-800' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-zinc-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10 relative">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-amber-500/40 flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/10">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-amber-500 uppercase tracking-wider">
                    {profile.name ? profile.name.slice(0, 2) : 'FB'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveTab('avatar')}
                className="absolute -bottom-2 -right-2 p-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg shadow-md transition-transform transform hover:scale-105"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-100">{profile.name || 'FleetBuild Member'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user?.role === 'admin' ? 'Administrator' : 'PRO Member'}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                {profile.email}
                {username && <span className="text-amber-500/80">(@{username})</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-300">
                <span className="bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                  Goal: <strong className="text-amber-400">{profile.fitnessGoal?.title || 'General Fitness'}</strong>
                </span>
                <span className="bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                  Level: <strong className="capitalize text-zinc-200">{experienceLevel}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-semibold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Changes
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors font-medium text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          Profile Summary
        </button>

        <button
          onClick={() => setActiveTab('edit-profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'edit-profile'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          Personal & Fitness Profile
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Password & Security
        </button>

        <button
          onClick={() => setActiveTab('avatar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'avatar'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Camera className="w-4 h-4" />
          Profile Picture
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          App & Privacy
        </button>

        <button
          onClick={() => setActiveTab('danger-zone')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ml-auto ${
            activeTab === 'danger-zone'
              ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
              : 'text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Danger Zone
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {/* Quick Metrics & Bio */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Personalization Card
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
                <span className="text-xs text-zinc-400 block">Height</span>
                <span className="text-lg font-bold text-zinc-100 mt-0.5 block">
                  {heightCm
                    ? unitPreference === 'imperial'
                      ? `${(parseFloat(heightCm) / 2.54 / 12).toFixed(1)} ft`
                      : `${heightCm} cm`
                    : 'Not set'}
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
                <span className="text-xs text-zinc-400 block">Weight</span>
                <span className="text-lg font-bold text-zinc-100 mt-0.5 block">
                  {weightKg
                    ? unitPreference === 'imperial'
                      ? `${(parseFloat(weightKg) * 2.20462).toFixed(1)} lbs`
                      : `${weightKg} kg`
                    : 'Not set'}
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
                <span className="text-xs text-zinc-400 block">Age</span>
                <span className="text-lg font-bold text-zinc-100 mt-0.5 block">
                  {age ? `${age} yrs` : 'Not set'}
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
                <span className="text-xs text-zinc-400 block">Workout Split</span>
                <span className="text-sm font-semibold text-amber-400 mt-0.5 block uppercase tracking-wider">
                  {preferredSplit.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
                <span className="text-xs text-zinc-400 block">Activity Level</span>
                <span className="text-sm font-semibold text-zinc-200 mt-0.5 block capitalize">
                  {activityLevel.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
                <span className="text-xs text-zinc-400 block">Units</span>
                <span className="text-sm font-semibold text-zinc-200 mt-0.5 block uppercase">
                  {unitPreference}
                </span>
              </div>
            </div>

            {/* Target Fitness Goal Summary */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                  Primary Fitness Objective
                </span>
                <button
                  onClick={() => setActiveTab('edit-profile')}
                  className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1"
                >
                  Edit <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-base font-bold text-zinc-100">{goalTitle || 'General Health & Fitness'}</p>
              <p className="text-xs text-zinc-400">{goalDescription || 'No description provided.'}</p>
            </div>

            {/* Health Constraints / Injuries */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                Injury & Health Constraints
              </h3>
              {profile.healthConstraints && profile.healthConstraints.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.healthConstraints.map((hc) => (
                    <span
                      key={hc.id}
                      className="px-3 py-1 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs font-medium"
                    >
                      ⚠️ {hc.description} ({hc.severity})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No injury limitations flagged.</p>
              )}
            </div>
          </div>

          {/* Side Card: Preferences Snapshot */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-500" />
              Gym Routine
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-zinc-400 block mb-1 font-medium">Preferred Days</span>
                <div className="flex flex-wrap gap-1.5">
                  {weekDays.map((d) => (
                    <span
                      key={d}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        preferredDays.includes(d)
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1 font-medium">Equipment Access</span>
                <p className="text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                  {equipmentText || 'Full Gym Access'}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1 font-medium">Disliked / Excluded Exercises</span>
                <p className="text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                  {excludedExercisesText || 'None excluded'}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1 font-medium">Dietary Restrictions</span>
                <p className="text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                  {dietaryText || 'None specified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE */}
      {activeTab === 'edit-profile' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Personal & Fitness Details</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Update your physical specs, workout split, and preferences for maximum AI personalization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="John Doe"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Display Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="johndoe_fit"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="user@example.com"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="e.g. 28"
                min="13"
                max="120"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary</option>
              </select>
            </div>

            {/* Measurement Unit Preference */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Unit Preference</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUnitPreference('metric')}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                    unitPreference === 'metric'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitPreference('imperial')}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                    unitPreference === 'imperial'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  Imperial (lb/in)
                </button>
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Height ({unitPreference === 'metric' ? 'cm' : 'inches'})
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder={unitPreference === 'metric' ? '178' : '70'}
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Weight ({unitPreference === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder={unitPreference === 'metric' ? '75' : '165'}
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Workout Experience</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="beginner">Beginner (&lt; 1 yr)</option>
                <option value="intermediate">Intermediate (1 - 3 yrs)</option>
                <option value="advanced">Advanced (3+ yrs)</option>
              </select>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Daily Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="sedentary">Sedentary (Desk job, minimal movement)</option>
                <option value="lightly_active">Lightly Active (1-2 days/wk)</option>
                <option value="moderately_active">Moderately Active (3-4 days/wk)</option>
                <option value="very_active">Very Active (5+ days/wk)</option>
                <option value="extra_active">Extra Active (Hard training / physical job)</option>
              </select>
            </div>

            {/* Preferred Workout Split */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Preferred Workout Split</label>
              <select
                value={preferredSplit}
                onChange={(e) => setPreferredSplit(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="push_pull_legs">Push / Pull / Legs (PPL)</option>
                <option value="upper_lower">Upper / Lower</option>
                <option value="full_body">Full Body</option>
                <option value="bro_split">Body Part Split (Bro Split)</option>
                <option value="custom">Custom Hybrid Split</option>
              </select>
            </div>

            {/* Primary Fitness Goal */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Primary Goal Title</label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Build Muscle & Strength"
              />
            </div>
          </div>

          {/* Preferred Workout Days Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-300">Preferred Training Days</label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const isSelected = preferredDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise & Dietary Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Preferred Exercises (Comma Separated)</label>
              <input
                type="text"
                value={preferredExercisesText}
                onChange={(e) => setPreferredExercisesText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="Bench Press, Pull-ups, Incline Dumbbell Press"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Disliked / Excluded Exercises (Comma Separated)</label>
              <input
                type="text"
                value={excludedExercisesText}
                onChange={(e) => setExcludedExercisesText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="Burpees, Behind-the-neck Press"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Available Equipment (Comma Separated)</label>
              <input
                type="text"
                value={equipmentText}
                onChange={(e) => setEquipmentText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="Barbell, Dumbbells, Power Rack, Cable Machine"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Dietary Restrictions (Comma Separated)</label>
              <input
                type="text"
                value={dietaryText}
                onChange={(e) => setDietaryText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="High Protein, Lactose-Free, Vegetarian"
              />
            </div>
          </div>

          {/* Injury & Health Constraints */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">Injury / Health Constraints Notes</label>
            <textarea
              value={injuryNotes}
              onChange={(e) => setInjuryNotes(e.target.value)}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              placeholder="e.g. Mild lower back tightness, right shoulder impingement when overhead pressing"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl animate-fadeIn">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Change Password
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Ensure your account stays secure with an encrypted password (at least 8 characters).
            </p>
          </div>

          {passwordStatus && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
                passwordStatus.type === 'error'
                  ? 'bg-red-950/60 border-red-800/60 text-red-200'
                  : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200'
              }`}
            >
              {passwordStatus.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <span>{passwordStatus.msg}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="At least 8 characters"
              />

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Strength:</span>
                    <span className="font-semibold text-zinc-200">{passStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passStrength.color} transition-all duration-300`}
                      style={{ width: `${(passStrength.score / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                placeholder="Re-enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isChangingPassword ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PROFILE PICTURE UPLOAD */}
      {activeTab === 'avatar' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl animate-fadeIn">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              Upload Profile Picture
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Upload a clear photo (JPEG, PNG, WebP under 1.5MB). It will immediately display in the top header and profile card.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
            <div className="w-28 h-28 rounded-2xl bg-zinc-900 border-2 border-amber-500/50 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-amber-500">
                  {profile.name ? profile.name.slice(0, 2) : 'FB'}
                </span>
              )}
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow"
                >
                  <Upload className="w-4 h-4" />
                  Choose Image File
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-4 py-2 bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 rounded-xl text-xs flex items-center gap-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Avatar
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                Supports JPG, PNG or WebP. Max file size: 1.5MB.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl shadow transition-all flex items-center gap-2"
            >
              {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Avatar to Header
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: APP PREFERENCES & PRIVACY */}
      {activeTab === 'preferences' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              Notifications & Privacy Settings
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Customize alerts, AI memory storage, and data privacy options.
            </p>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Notification Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-all">
                <div>
                  <span className="text-sm font-medium text-zinc-200 block">Workout Reminders</span>
                  <span className="text-xs text-zinc-500">Daily prompts for scheduled training sessions.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.workoutReminders}
                  onChange={(e) => setNotifications({ ...notifications, workoutReminders: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-all">
                <div>
                  <span className="text-sm font-medium text-zinc-200 block">Recovery Alerts</span>
                  <span className="text-xs text-zinc-500">Notifies when fatigue flags suggest deloading.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.recoveryAlerts}
                  onChange={(e) => setNotifications({ ...notifications, recoveryAlerts: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-all">
                <div>
                  <span className="text-sm font-medium text-zinc-200 block">Weekly Progress Report</span>
                  <span className="text-xs text-zinc-500">Summary of sets, tonnage, and body weight logs.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weeklyProgressReport}
                  onChange={(e) => setNotifications({ ...notifications, weeklyProgressReport: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-all">
                <div>
                  <span className="text-sm font-medium text-zinc-200 block">AI Coach Proactive Tips</span>
                  <span className="text-xs text-zinc-500">FleetBot insights on progressive overload.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.aiCoachTips}
                  onChange={(e) => setNotifications({ ...notifications, aiCoachTips: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              Data & Privacy Controls
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-all">
                <div>
                  <span className="text-sm font-medium text-zinc-200 block">Allow AI Context Memory</span>
                  <span className="text-xs text-zinc-500">
                    Stores confirmed facts (injuries, preferences) to tailor AI responses.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.allowAiContextMemory}
                  onChange={(e) => setPrivacy({ ...privacy, allowAiContextMemory: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-all">
                <div>
                  <span className="text-sm font-medium text-zinc-200 block">Anonymous Performance Analytics</span>
                  <span className="text-xs text-zinc-500">
                    Helps improve workout algorithm precision without personal identifiers.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.shareAnalytics}
                  onChange={(e) => setPrivacy({ ...privacy, shareAnalytics: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl shadow transition-all flex items-center gap-2"
            >
              {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: DANGER ZONE (ACCOUNT DELETION) */}
      {activeTab === 'danger-zone' && (
        <div className="bg-zinc-900 border border-red-900/60 rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl animate-fadeIn">
          {/* Header Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">
                  Delete {profile.name || profile.username || 'FleetBuild Account'}
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  {profile.email || 'satviksinghal07@gmail.com'}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-zinc-800/60">
              Permanently delete your account, workout history, custom routine plans, and AI coach context memory facts. This action cannot be undone.
            </p>
          </div>

          {deletionError && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{deletionError}</span>
            </div>
          )}

          <form onSubmit={handleConfirmDeletion} className="space-y-5 bg-zinc-950 border border-zinc-800 rounded-xl p-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-2">
                To confirm, type <span className="text-amber-400 font-mono select-all">"delete my account"</span> in the box below
              </label>
              <input
                type="text"
                value={deletionConfirmText}
                onChange={(e) => setDeletionConfirmText(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500/80 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
                placeholder="delete my account"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-2">
                Account Password
              </label>
              <input
                type="password"
                value={deletionPassword}
                onChange={(e) => setDeletionPassword(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500/80 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
                placeholder="Enter your account password"
              />
            </div>

            <button
              type="submit"
              disabled={isExecutingDeletion || deletionConfirmText.trim().toLowerCase() !== 'delete my account' || !deletionPassword}
              className={`w-full py-3 font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                deletionConfirmText.trim().toLowerCase() === 'delete my account' && deletionPassword
                  ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-red-950/50'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
              }`}
            >
              {isExecutingDeletion ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete this account
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
