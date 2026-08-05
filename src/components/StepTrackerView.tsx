import React, { useState, useEffect, useRef } from 'react';
import { 
  Footprints, 
  Flame, 
  Timer, 
  Ruler, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Plus, 
  Award, 
  Activity, 
  Zap, 
  ShieldAlert,
  Save,
  Trash2,
  Sliders
} from 'lucide-react';
import { DailyMetrics } from '../types';
import { api } from '../lib/api';

interface StepTrackerViewProps {
  metrics: DailyMetrics;
  onUpdateMetrics?: (updated: Partial<DailyMetrics>) => void;
  showToast?: (msg: string) => void;
}

interface StepSession {
  id: string;
  date: string;
  steps: number;
  distanceKm: number;
  caloriesBurned: number;
  durationSeconds: number;
}

export const StepTrackerView: React.FC<StepTrackerViewProps> = ({
  metrics,
  onUpdateMetrics,
  showToast,
}) => {
  // Tracking State
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [steps, setSteps] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [stepTarget, setStepTarget] = useState<number>(metrics.stepTarget || 10000);
  const [strideLengthMeters, setStrideLengthMeters] = useState<number>(0.78); // Default 0.78m per step
  const [userWeightKg, setUserWeightKg] = useState<number>(metrics.weight || 75); // Default 75kg
  
  // Motion Sensor State
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [needsPermissionRequest, setNeedsPermissionRequest] = useState<boolean>(false);
  const [motionSupported, setMotionSupported] = useState<boolean>(true);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);

  // AI Guidance State
  const [aiAdviceText, setAiAdviceText] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // History State
  const [sessionHistory, setSessionHistory] = useState<StepSession[]>(() => {
    try {
      const saved = localStorage.getItem('fleetbuild_step_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Manual Customization Modal
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [manualAddInput, setManualAddInput] = useState<string>('500');

  // Refs for tracking sensor buffers and timers
  const lastStepTimeRef = useRef<number>(0);
  const accelerationBufferRef = useRef<number[]>([]);
  const timerRef = useRef<any>(null);
  const simulationRef = useRef<any>(null);

  // Calculate Distance & Calories
  // Standard formula: Calories burned = steps * weightInKg * strideInMeters * 0.0008 (approx ~0.045 kcal per step for 70kg)
  const distanceMeters = steps * strideLengthMeters;
  const distanceKm = distanceMeters / 1000;
  const caloriesBurned = Math.round(steps * (userWeightKg / 70) * 0.042);
  const currentPaceCadence = durationSeconds > 0 ? Math.round((steps / durationSeconds) * 60) : 0; // Steps per minute

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fleetbuild_step_sessions', JSON.stringify(sessionHistory));
    } catch (e) {
      console.error('Failed to save session history', e);
    }
  }, [sessionHistory]);

  // Check Motion Sensor Compatibility on Mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      const DME = window.DeviceMotionEvent as any;
      if (typeof DME.requestPermission === 'function') {
        setNeedsPermissionRequest(true);
      } else {
        setPermissionGranted(true);
      }
    } else {
      setMotionSupported(false);
    }
  }, []);

  // Duration Timer Loop
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking]);

  // Simulation Walker Loop
  useEffect(() => {
    if (simulationActive && isTracking) {
      simulationRef.current = setInterval(() => {
        setSteps((prev) => prev + 2); // 2 steps per second simulation
      }, 1000);
    } else {
      if (simulationRef.current) clearInterval(simulationRef.current);
    }
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [simulationActive, isTracking]);

  // Device Motion Event Listener
  useEffect(() => {
    if (!isTracking || !permissionGranted) return;

    const stepThreshold = 12.5; // Acceleration threshold m/s^2
    const minStepIntervalMs = 320; // Min time between human steps
    const bufferSize = 10;

    const handleMotionEvent = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

      accelerationBufferRef.current.push(magnitude);
      if (accelerationBufferRef.current.length > bufferSize) {
        accelerationBufferRef.current.shift();
      }

      if (accelerationBufferRef.current.length < bufferSize) return;

      const currentTime = Date.now();
      const timeSinceLast = currentTime - lastStepTimeRef.current;

      if (magnitude > stepThreshold && timeSinceLast > minStepIntervalMs) {
        setSteps((prev) => prev + 1);
        lastStepTimeRef.current = currentTime;

        if (navigator.vibrate) {
          try {
            navigator.vibrate(30);
          } catch (_) {}
        }
      }
    };

    window.addEventListener('devicemotion', handleMotionEvent);
    return () => {
      window.removeEventListener('devicemotion', handleMotionEvent);
    };
  }, [isTracking, permissionGranted]);

  // Request Motion Permission (specifically for iOS/Web)
  const handleRequestPermission = async () => {
    const DME = (window as any).DeviceMotionEvent;
    if (DME && typeof DME.requestPermission === 'function') {
      try {
        const response = await DME.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setNeedsPermissionRequest(false);
          if (showToast) showToast('Motion sensor access granted!');
        } else {
          if (showToast) showToast('Motion permission denied by browser settings.');
        }
      } catch (err) {
        if (showToast) showToast('Could not request motion permission.');
      }
    } else {
      setPermissionGranted(true);
      setNeedsPermissionRequest(false);
    }
  };

  // Start / Pause / Stop Tracking
  const toggleTracking = () => {
    if (!isTracking) {
      setIsTracking(true);
      if (showToast) showToast('Step counter tracking started!');
    } else {
      setIsTracking(false);
      setSimulationActive(false);
      if (showToast) showToast('Step counter paused.');
    }
  };

  const resetCounter = () => {
    setIsTracking(false);
    setSimulationActive(false);
    setSteps(0);
    setDurationSeconds(0);
    if (showToast) showToast('Step counter reset to zero.');
  };

  const handleManualAddSteps = (amount: number) => {
    setSteps((prev) => prev + amount);
    if (showToast) showToast(`Added +${amount} steps!`);
  };

  const handleSaveSession = () => {
    if (steps === 0) {
      if (showToast) showToast('No steps recorded in current session.');
      return;
    }

    const newSession: StepSession = {
      id: `session-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      steps,
      distanceKm: Number(distanceKm.toFixed(2)),
      caloriesBurned,
      durationSeconds,
    };

    setSessionHistory((prev) => [newSession, ...prev]);

    // Update global FleetBuild metrics
    if (onUpdateMetrics) {
      onUpdateMetrics({
        stepsCount: (metrics.stepsCount || 0) + steps,
      });
    }

    if (showToast) showToast(`Session Saved! ${steps} steps & ~${caloriesBurned} kcal logged.`);
    resetCounter();
  };

  const handleClearHistory = () => {
    setSessionHistory([]);
    localStorage.removeItem('fleetbuild_step_sessions');
    if (showToast) showToast('Cleared step session history.');
  };

  // Fetch FleetBot AI Motion & Calorie Guidance
  const handleFetchAiGuidance = async () => {
    setIsLoadingAi(true);
    setAiAdviceText(null);
    try {
      const prompt = `As FleetBot AI Motion Coach, evaluate this step tracking session:
Current Steps: ${steps} / Goal: ${stepTarget}
Distance Covered: ${distanceKm.toFixed(2)} km
Calories Burned: ${caloriesBurned} kcal
Pace: ${currentPaceCadence} steps/min
User Weight: ${userWeightKg} kg

Provide 3 concise, highly actionable tips on calorie burn optimization, posture, and pacing for walking/running.`;

      const response = await api.sendChatMessage(prompt, []);
      setAiAdviceText(response.reply);
    } catch (err) {
      setAiAdviceText('FleetBot AI is momentarily offline. Try again in a moment.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min(100, Math.round((steps / stepTarget) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E1E1E] via-[#281815] to-[#1E1E1E] p-6 sm:p-8 border border-[#FF5722]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF5722] text-xs font-bold uppercase tracking-wider">
              <Footprints className="w-3.5 h-3.5" />
              <span>Real-Time Pedometer Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Motion & Calorie Step Counter
            </h1>
            <p className="text-sm text-white/70 leading-relaxed">
              Track live steps, real-time distance covered, and active calorie burn using hardware motion sensors or interactive pace simulation.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#FF5722]" />
              <span>Calibrate Sensor</span>
            </button>

            <button
              onClick={handleFetchAiGuidance}
              disabled={isLoadingAi}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF5722] hover:bg-[#FF7043] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF5722]/25 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoadingAi ? 'Analyzing...' : 'FleetBot Motion Insights'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Permission Warning Banner if needed */}
      {needsPermissionRequest && !permissionGranted && (
        <div className="rounded-2xl bg-amber-500/15 border border-amber-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-200">Hardware Motion Permission Needed</p>
              <p className="text-[11px] text-amber-300/80">iOS Safari requires explicit permission to read accelerometer step data.</p>
            </div>
          </div>
          <button
            onClick={handleRequestPermission}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            Grant Motion Access
          </button>
        </div>
      )}

      {/* Calibration Modal / Settings Panel */}
      {showSettings && (
        <div className="rounded-2xl bg-[#1E1E1E] p-6 border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF5722]" />
            <span>Pedometer Calibration & Metrics Setup</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-white/60 mb-1 font-medium">Daily Step Goal</label>
              <input
                type="number"
                value={stepTarget}
                onChange={(e) => setStepTarget(Math.max(1000, Number(e.target.value)))}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:border-[#FF5722] outline-none"
              />
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-medium">Stride Length (meters)</label>
              <input
                type="number"
                step="0.01"
                value={strideLengthMeters}
                onChange={(e) => setStrideLengthMeters(Math.max(0.4, Number(e.target.value)))}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:border-[#FF5722] outline-none"
              />
              <span className="text-[10px] text-white/40">Avg adult stride is 0.70m - 0.82m</span>
            </div>

            <div>
              <label className="block text-white/60 mb-1 font-medium">Body Weight (kg)</label>
              <input
                type="number"
                value={userWeightKg}
                onChange={(e) => setUserWeightKg(Math.max(30, Number(e.target.value)))}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:border-[#FF5722] outline-none"
              />
              <span className="text-[10px] text-white/40">Used for accurate calorie calculation</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
            >
              Done Calibrating
            </button>
          </div>
        </div>
      )}

      {/* Main Display Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Big Hero Step Counter Ring & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-10 border border-white/10 shadow-xl flex flex-col items-center justify-center text-center space-y-6 relative">
            
            {/* Circular Progress & Huge Counter */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-white/10"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Active Gradient Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#FF5722] transition-all duration-500 ease-out"
                  strokeWidth="8"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (263.89 * progressPercentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center mb-1">
                  <Footprints className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {steps.toLocaleString()}
                </span>
                <span className="text-xs uppercase font-bold text-white/50 tracking-widest">
                  Target: {stepTarget.toLocaleString()} steps
                </span>
                <div className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#FF5722] mt-1">
                  {progressPercentage}% Goal Reached
                </div>
              </div>
            </div>

            {/* Primary Tracking Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md pt-2">
              <button
                onClick={toggleTracking}
                className={`flex-1 min-w-[140px] py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isTracking 
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                    : 'bg-[#FF5722] hover:bg-[#FF7043] shadow-[#FF5722]/30'
                }`}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Tracking</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Tracking</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveSession}
                className="px-5 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>Save Session</span>
              </button>

              <button
                onClick={resetCounter}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                title="Reset steps"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Simulation & Quick Add Controls (Great for Desktop Preview) */}
            <div className="pt-4 border-t border-white/10 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-medium">Web Simulation Mode:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (!isTracking) setIsTracking(true);
                    setSimulationActive(!simulationActive);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    simulationActive 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                      : 'bg-white/5 border-white/10 hover:border-white/30 text-white/80'
                  }`}
                >
                  {simulationActive ? 'Pause Auto Walk' : 'Simulate Walk (2 steps/s)'}
                </button>

                <button
                  onClick={() => handleManualAddSteps(100)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#FF5722]" />
                  <span>+100 Steps</span>
                </button>

                <button
                  onClick={() => handleManualAddSteps(1000)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#FF5722]" />
                  <span>+1,000 Steps</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3 Primary Metrics Cards (Distance, Calories, Duration) */}
        <div className="space-y-4">
          
          {/* Calories Burned Card */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl relative overflow-hidden group hover:border-[#FF5722]/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">Active Calorie Burn</span>
              <div className="w-10 h-10 rounded-2xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{caloriesBurned}</span>
              <span className="text-sm font-semibold text-[#FF5722]">kcal</span>
            </div>
            <p className="text-[11px] text-white/50 mt-2">
              Calculated based on {userWeightKg}kg body weight & stride kinematics (~0.042 kcal/step).
            </p>
          </div>

          {/* Distance Covered Card */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">Distance Covered</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Ruler className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {distanceKm >= 1 ? distanceKm.toFixed(2) : distanceMeters.toFixed(0)}
              </span>
              <span className="text-sm font-semibold text-blue-400">
                {distanceKm >= 1 ? 'km' : 'meters'}
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-2">
              Calculated using {strideLengthMeters}m per step stride calibration.
            </p>
          </div>

          {/* Duration & Cadence Card */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">Session Time & Cadence</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Timer className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-white">{formatDuration(durationSeconds)}</span>
                <span className="text-xs text-white/50 block">Elapsed Time</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-emerald-400">{currentPaceCadence}</span>
                <span className="text-[10px] text-white/50 block uppercase font-semibold">Steps / min</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FleetBot AI Motion Coach Insights Response */}
      {aiAdviceText && (
        <div className="rounded-3xl bg-gradient-to-r from-[#1E1E1E] via-[#241a17] to-[#1E1E1E] p-6 sm:p-8 border border-[#FF5722]/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-[#FF5722]">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">FleetBot Motion & Calorie Analysis</h3>
          </div>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-line font-medium">
            {aiAdviceText}
          </p>
        </div>
      )}

      {/* Saved Session History Log */}
      <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-lg font-bold text-white tracking-tight">Step Session History</h2>
          </div>

          {sessionHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs font-semibold text-white/40 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {sessionHistory.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Footprints className="w-8 h-8 text-white/20 mx-auto" />
            <p className="text-xs text-white/50">No saved step sessions yet.</p>
            <p className="text-[11px] text-white/30">Start tracking steps and click "Save Session" to log your workouts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessionHistory.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-2xl bg-[#121212] border border-white/10 hover:border-[#FF5722]/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{sess.date}</span>
                  <span className="text-[10px] text-white/40">{formatDuration(sess.durationSeconds)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                  <div>
                    <span className="text-base font-black text-white">{sess.steps.toLocaleString()}</span>
                    <span className="text-[9px] uppercase font-bold text-white/40 block">Steps</span>
                  </div>
                  <div>
                    <span className="text-base font-black text-blue-400">{sess.distanceKm}</span>
                    <span className="text-[9px] uppercase font-bold text-white/40 block">km</span>
                  </div>
                  <div>
                    <span className="text-base font-black text-[#FF5722]">{sess.caloriesBurned}</span>
                    <span className="text-[9px] uppercase font-bold text-white/40 block">kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
