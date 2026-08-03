import React, { useState, useEffect } from 'react';
import { ViewType, MemoryContext, ChatMessage, WorkoutPlan, WeightDataPoint, DailyMetrics } from './types';
import {
  initialMemoryContext,
  initialChatMessages,
  defaultWorkoutPlan,
  adaptiveWorkoutPlan,
  weight7DayHistory,
  initialDailyMetrics,
} from './data/mockData';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FleetBotView } from './components/FleetBotView';
import { WorkoutPlannerView } from './components/WorkoutPlannerView';
import { HealthTrackerView } from './components/HealthTrackerView';
import { Check, Zap, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation & State
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Core State
  const [memoryContext, setMemoryContext] = useState<MemoryContext>(initialMemoryContext);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<WorkoutPlan>(defaultWorkoutPlan);
  const [weightHistory, setWeightHistory] = useState<WeightDataPoint[]>(weight7DayHistory);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics>(initialDailyMetrics);

  // Routine loaded state tracker
  const [isAdaptiveRoutineLoaded, setIsAdaptiveRoutineLoaded] = useState(false);
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

  // Load Adaptive Knee-Safe Routine
  const handleLoadAdaptiveRoutine = () => {
    setCurrentWorkoutPlan(adaptiveWorkoutPlan);
    setIsAdaptiveRoutineLoaded(true);
    showToast('⚡ FleetBot Low-Impact Core & Upper Routine Loaded!');
  };

  const handleRestoreOriginalPlan = () => {
    setCurrentWorkoutPlan(defaultWorkoutPlan);
    setIsAdaptiveRoutineLoaded(false);
    showToast('Restored standard Pull Day plan.');
  };

  // Exercise set completion toggle
  const handleToggleExerciseComplete = (exerciseId: string) => {
    setCurrentWorkoutPlan((prev) => {
      const updatedExercises = prev.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const newState = !ex.isCompleted;
          if (newState) {
            startTimer(90); // Auto start 90s rest
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
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsGeneratingAiResponse(true);

    try {
      // Call /api/chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          memoryContext,
          chatHistory: chatMessages,
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'fleetbot',
        text: data.reply || "Understood. I've updated your training parameters.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasAction: userText.toLowerCase().includes('knee') || userText.toLowerCase().includes('leg'),
        actionType: 'load_routine',
        actionLabel: '⚡ Load Low-Impact Core & Upper Routine',
      };

      setChatMessages((prev) => [...prev, aiMsg]);

      // Update memory if returned
      if (data.updatedMemory) {
        setMemoryContext(data.updatedMemory);
      }
    } catch (err) {
      console.error('Error communicating with FleetBot API:', err);
      // Local fallback reply
      const lower = userText.toLowerCase();
      let replyText = "Understood. I've logged this in your active memory context and adjusted set target velocities.";
      let hasAction = false;

      if (lower.includes('knee') || lower.includes('leg') || lower.includes('pain')) {
        replyText = "I've updated your medical profile regarding the left knee pain. I am recalculating today's schedule. Let's pivot to a low-impact upper body mobility and core session. I've also removed barbell squats from your future plans until you are cleared. Should I load the new routine?";
        hasAction = true;
        setMemoryContext((prev) => ({
          ...prev,
          injury: 'Left Knee Pain (Active Adaptation)',
          hates: 'Barbell Squats',
        }));
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-fallback-${Date.now()}`,
        sender: 'fleetbot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasAction,
        actionType: 'load_routine',
        actionLabel: '⚡ Load Low-Impact Core & Upper Routine',
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
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1] = { ...copy[copy.length - 1], weightKg: newWeight };
      }
      return copy;
    });
    showToast(`Logged new weight: ${newWeight} kg`);
  };

  // Update Water
  const handleUpdateWater = (liters: number) => {
    setDailyMetrics((prev) => ({ ...prev, waterLiters: parseFloat(liters.toFixed(2)) }));
  };

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
          streakDays={dailyMetrics.streakDays}
          memoryContext={memoryContext}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          
          {/* Header Bar */}
          <Header
            currentView={currentView}
            streakDays={dailyMetrics.streakDays}
            memoryContext={memoryContext}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            activeTimerSeconds={isTimerRunning ? restTimerSeconds : null}
            onOpenTimer={() => setCurrentView('workout')}
            onNavigateToFleetBot={() => setCurrentView('fleetbot')}
          />

          {/* View Container */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                streakDays={dailyMetrics.streakDays}
                currentWorkoutPlan={currentWorkoutPlan}
                weightHistory={weightHistory}
                memoryContext={memoryContext}
                dailyMetrics={dailyMetrics}
                onStartWorkout={() => setCurrentView('workout')}
                onNavigateToView={setCurrentView}
                onRestoreOriginalWorkout={handleRestoreOriginalPlan}
              />
            )}

            {currentView === 'fleetbot' && (
              <FleetBotView
                messages={chatMessages}
                memoryContext={memoryContext}
                onSendMessage={handleSendMessage}
                onUpdateMemoryContext={(updated) => setMemoryContext((prev) => ({ ...prev, ...updated }))}
                onLoadAdaptiveRoutine={handleLoadAdaptiveRoutine}
                isRoutineLoaded={isAdaptiveRoutineLoaded}
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
                onRestoreOriginalPlan={handleRestoreOriginalPlan}
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
          </main>
        </div>

      </div>
    </div>
  );
}
