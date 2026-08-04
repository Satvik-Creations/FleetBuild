import React, { useState, useEffect } from 'react';
import { ViewType, WorkoutPlan, WeightDataPoint, DailyMetrics } from './types';
import { api, UserSummary, clearToken, getToken } from './lib/api';
import { UserProfile } from './domain/models';

import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { AdminView } from './components/AdminView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FleetBotView } from './components/FleetBotView';
import { WorkoutPlannerView } from './components/WorkoutPlannerView';
import { HealthTrackerView } from './components/HealthTrackerView';
import { ProfileView } from './components/ProfileView';
import { AccountManager } from './components/AccountManager';
import { Zap, Loader2 } from 'lucide-react';

const defaultEmptyProfile: UserProfile = {
  id: 'profile-default',
  userId: '',
  name: '',
  email: '',
  fitnessGoal: {
    id: 'fg-default',
    title: 'General Health & Fitness',
    targetDescription: 'Maintain energy and general physical strength',
    primaryFocus: 'general_fitness',
  },
  healthConstraints: [],
  exercisePreferences: {
    preferredExercises: [],
    excludedExercises: [],
    equipment: [],
  },
  equipmentAccess: [],
  dietaryRestrictions: [],
  onboardingCompleted: false,
  userConsent: {
    medicalDisclaimerAccepted: true,
    dataStorageConsent: true,
    consentDate: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultEmptyPlan: WorkoutPlan = {
  id: 'plan-1',
  title: 'Custom Training Session',
  type: 'Personal Workout',
  durationMinutes: 45,
  caloriesBurned: 0,
  exercises: [
    {
      id: 'ex-1',
      name: 'Push-ups',
      targetMuscle: 'Chest & Core',
      sets: 3,
      reps: '10-15',
      weight: 'Bodyweight',
    },
    {
      id: 'ex-2',
      name: 'Bodyweight Squats',
      targetMuscle: 'Quads & Glutes',
      sets: 3,
      reps: '15',
      weight: 'Bodyweight',
    },
  ],
};

const defaultEmptyDailyMetrics: DailyMetrics = {
  weight: 0,
  streakDays: 1,
  caloriesConsumed: 0,
  calorieTarget: 2000,
  waterLiters: 0,
  waterTarget: 2.5,
  sleepHours: 8,
  hrvMs: 0,
  recoveryScore: 100,
};

export default function App() {
  // Authentication & Profile State
  const [user, setUser] = useState<UserSummary | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultEmptyProfile);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isOnboardingPending, setIsOnboardingPending] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Core State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<WorkoutPlan>(defaultEmptyPlan);
  const [weightHistory, setWeightHistory] = useState<WeightDataPoint[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics>(defaultEmptyDailyMetrics);

  const [isGeneratingAiResponse, setIsGeneratingAiResponse] = useState(false);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [totalTimerDuration, setTotalTimerDuration] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Check auth session on boot
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsAuthChecking(false);
        return;
      }

      try {
        const { user: userData, profile: profileData } = await api.getMe();
        setUser(userData);
        if (profileData) {
          setUserProfile(profileData);
        }

        if (userData.role === 'admin') {
          setCurrentView('admin');
        } else if (!userData.onboardingCompleted) {
          setIsOnboardingPending(true);
        } else {
          setCurrentView('dashboard');
        }
      } catch (err) {
        clearToken();
        setUser(null);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initAuth();
  }, []);

  // Rest Timer Countdown Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            showToast('⚡ Rest Time Complete! Prepare for your next set.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restTimerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, restTimerSeconds]);

  // Auth Success Handler
  const handleAuthSuccess = (userData: UserSummary, profileData?: UserProfile) => {
    setUser(userData);
    if (profileData) {
      setUserProfile(profileData);
    }

    if (userData.role === 'admin') {
      setCurrentView('admin');
      setIsOnboardingPending(false);
    } else if (!userData.onboardingCompleted) {
      setIsOnboardingPending(true);
    } else {
      setIsOnboardingPending(false);
      setCurrentView('dashboard');
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    await api.signOut();
    setUser(null);
    setUserProfile(defaultEmptyProfile);
    setIsOnboardingPending(false);
    setCurrentView('dashboard');
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    if (user) {
      setUser({ ...user, onboardingCompleted: true });
    }
    setIsOnboardingPending(false);
    setCurrentView('dashboard');
    showToast('Onboarding completed! Welcome to your personal dashboard.');
  };

  // Timer Controls
  const startTimer = (durationSeconds: number = 90) => {
    setRestTimerSeconds(durationSeconds);
    setTotalTimerDuration(durationSeconds);
    setIsTimerRunning(true);
    showToast(`⏱️ Rest Timer started: ${durationSeconds} seconds`);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setRestTimerSeconds(0);
  };

  const addTimerSeconds = (secs: number) => {
    setRestTimerSeconds((prev) => prev + secs);
    setTotalTimerDuration((prev) => prev + secs);
    if (!isTimerRunning) setIsTimerRunning(true);
  };

  // Exercise set completion toggle
  const handleToggleExerciseComplete = (exerciseId: string) => {
    setCurrentWorkoutPlan((prev) => {
      const updatedExercises = prev.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const newState = !ex.isCompleted;
          if (newState) {
            startTimer(90);
          }
          return { ...ex, isCompleted: newState };
        }
        return ex;
      });

      return { ...prev, exercises: updatedExercises };
    });
  };

  // FleetBot Chat Send Handler
  const handleSendMessage = async (userText: string) => {
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsGeneratingAiResponse(true);

    try {
      const data = await api.sendChatMessage(userText, chatMessages);

      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: 'fleetbot' as const,
        text: data.reply || "Understood. I've updated your training parameters.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasAction: data.suggestedActions && data.suggestedActions.length > 0,
        actionType: data.suggestedActions?.[0]?.type as any,
        actionLabel: data.suggestedActions?.[0]?.label,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Error in chat request:', err);
      const aiMsg = {
        id: `msg-ai-error-${Date.now()}`,
        sender: 'fleetbot' as const,
        text: err?.message || 'Unable to connect to FleetBot AI service at this time. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsGeneratingAiResponse(false);
    }
  };

  // Update Weight
  const handleUpdateWeight = (newWeight: number) => {
    setDailyMetrics((prev) => ({ ...prev, weight: newWeight }));
    setWeightHistory((prev) => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      return [...prev, { day: today, weightKg: newWeight, targetKg: newWeight }];
    });
    showToast(`Logged weight entry: ${newWeight} kg`);
  };

  // Update Water
  const handleUpdateWater = (liters: number) => {
    setDailyMetrics((prev) => ({ ...prev, waterLiters: parseFloat(liters.toFixed(2)) }));
  };

  // 1. Loading state during auth boot check
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-[#FF5722] animate-spin mb-4" />
        <p className="text-sm font-semibold text-white/70">Initializing FleetBuild Security...</p>
      </div>
    );
  }

  // 2. Unauthenticated state -> Show Auth View
  if (!user) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // 3. Authenticated member with pending onboarding -> Show Onboarding View
  if (user.role === 'member' && isOnboardingPending) {
    return (
      <OnboardingView
        initialName={user.name}
        onOnboardingComplete={handleOnboardingComplete}
      />
    );
  }

  // 4. Authenticated & Onboarded Workspace
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col antialiased selection:bg-[#FF5722] selection:text-white">
      
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce transition-all">
          <div className="px-5 py-3.5 rounded-2xl bg-[#1E1E1E] border border-[#FF5722] text-white font-bold text-xs shadow-2xl flex items-center gap-3 shadow-[#FF5722]/20">
            <div className="w-7 h-7 rounded-xl bg-[#FF5722]/20 text-[#FF5722] flex items-center justify-center">
              <Zap className="w-4 h-4 fill-[#FF5722]" />
            </div>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1">
        
        {/* Persistent Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          userRole={user.role}
          userName={user.name}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
          onSignOut={handleSignOut}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          
          {/* Header Bar */}
          <Header
            currentView={currentView}
            userName={user.name}
            userAvatarUrl={userProfile.avatarUrl}
            userRole={user.role}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            activeTimerSeconds={isTimerRunning ? restTimerSeconds : null}
            onOpenTimer={() => setCurrentView('workout')}
            onNavigateToFleetBot={() => setCurrentView('fleetbot')}
            onSignOut={handleSignOut}
          />

          {/* View Container */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            {currentView === 'admin' && user.role === 'admin' && (
              <AdminView />
            )}

            {currentView === 'dashboard' && (
              <DashboardView
                userProfile={userProfile}
                onNavigateToView={setCurrentView}
              />
            )}

            {currentView === 'fleetbot' && (
              <FleetBotView
                messages={chatMessages}
                memoryContext={{
                  goal: userProfile.fitnessGoal?.title || 'General Fitness',
                  injury: userProfile.healthConstraints?.[0]?.description || 'None Reported',
                  hates: userProfile.exercisePreferences?.excludedExercises?.join(', ') || 'None',
                  calories: 'Custom Goal',
                  equipment: userProfile.equipmentAccess?.join(', ') || 'None Listed',
                  recoveryScore: 100,
                  lastUpdated: 'Just now',
                }}
                onSendMessage={handleSendMessage}
                onUpdateMemoryContext={(updated) => {
                  if (updated.goal) {
                    setUserProfile((prev) => ({
                      ...prev,
                      fitnessGoal: { ...prev.fitnessGoal, title: updated.goal! },
                    }));
                  }
                }}
                onLoadAdaptiveRoutine={() => showToast('Loaded routine in Workout Planner.')}
                isRoutineLoaded={false}
                isGenerating={isGeneratingAiResponse}
              />
            )}

            {currentView === 'workout' && (
              <WorkoutPlannerView
                currentPlan={currentWorkoutPlan}
                restTimerSeconds={restTimerSeconds}
                totalTimerDuration={totalTimerDuration}
                isTimerRunning={isTimerRunning}
                onStartTimer={startTimer}
                onPauseTimer={pauseTimer}
                onResetTimer={resetTimer}
                onAddTimerSeconds={addTimerSeconds}
                onToggleExerciseComplete={handleToggleExerciseComplete}
                onRestoreOriginalPlan={() => setCurrentWorkoutPlan(defaultEmptyPlan)}
              />
            )}

            {currentView === 'health' && (
              <HealthTrackerView
                weightHistory={weightHistory}
                dailyMetrics={dailyMetrics}
                onUpdateWeight={handleUpdateWeight}
                onUpdateWater={handleUpdateWater}
              />
            )}

            {currentView === 'profile' && (
              <ProfileView
                onNavigateToFleetBot={() => setCurrentView('fleetbot')}
                onNavigateToAccount={() => setCurrentView('account')}
                onSignOut={handleSignOut}
                showToast={showToast}
              />
            )}

            {currentView === 'account' && (
              <AccountManager
                user={user}
                profile={userProfile}
                onProfileUpdated={(updatedProfile) => {
                  setUserProfile(updatedProfile);
                  if (user && updatedProfile.name && updatedProfile.name !== user.name) {
                    setUser({ ...user, name: updatedProfile.name });
                  }
                }}
                showToast={showToast}
                onSignOut={handleSignOut}
              />
            )}
          </main>
        </div>

      </div>
    </div>
  );
}
