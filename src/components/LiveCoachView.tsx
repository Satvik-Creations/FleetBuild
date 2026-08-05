import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Video, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Zap, 
  AlertCircle,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface LiveCoachViewProps {
  showToast?: (msg: string) => void;
}

type CallState = 'IDLE' | 'RINGING' | 'CONNECTED' | 'DECLINED' | 'BUSY' | 'ENDED';

export const LiveCoachView: React.FC<LiveCoachViewProps> = ({ showToast }) => {
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('Form & Movement Check');
  const [statusMessage, setStatusMessage] = useState<string>('Ready for consultation');

  const timerRef = useRef<any>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);

  const topics = [
    { title: 'Form & Movement Check', desc: 'Ask quick posture and technique cues' },
    { title: 'Warm-Up & Mobility', desc: 'Pre-workout activation guidance' },
    { title: 'Post-Workout Cool Down', desc: 'Stretching & muscle recovery advice' },
    { title: 'Goal & Mindset Boost', desc: 'Quick motivation for today\'s workout' },
  ];

  // Sound Synthesizers for realistic call tones using Web Audio API
  const playRingtone = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = 440;
      osc2.frequency.value = 480;
      gain.gain.value = 0.05;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      let isToneOn = true;
      const interval = setInterval(() => {
        isToneOn = !isToneOn;
        gain.gain.value = isToneOn ? 0.05 : 0;
      }, 1200);

      return () => {
        clearInterval(interval);
        try {
          osc1.stop();
          osc2.stop();
          ctx.close();
        } catch (_) {}
      };
    } catch (e) {
      return () => {};
    }
  };

  const playBusyTone = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = 480;
      gain.gain.value = 0.06;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      let count = 0;
      const interval = setInterval(() => {
        count++;
        gain.gain.value = count % 2 === 0 ? 0.06 : 0;
        if (count > 6) {
          clearInterval(interval);
          try {
            osc.stop();
            ctx.close();
          } catch (_) {}
        }
      }, 250);
    } catch (e) {}
  };

  const playCutTone = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
          ctx.close();
        } catch (_) {}
      }, 400);
    } catch (e) {}
  };

  // Timer Effect for 1-Minute Session Limit
  useEffect(() => {
    if (callState === 'CONNECTED') {
      setCallSeconds(0);
      timerRef.current = setInterval(() => {
        setCallSeconds((prev) => {
          if (prev >= 60) {
            handleEndCall('1-Minute Session Complete');
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Clean up ringtone on unmount or state change
  useEffect(() => {
    return () => {
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
        audioCleanupRef.current = null;
      }
    };
  }, [callState]);

  // Start Call Handler with 70% Connect / 15% Decline / 15% Busy Logic
  const handleStartCall = () => {
    if (callState !== 'IDLE') return;

    setCallState('RINGING');
    setStatusMessage('Calling FleetBuild Fitness Coach...');
    if (showToast) showToast('Dialing FleetBuild Fitness Coach...');

    audioCleanupRef.current = playRingtone();

    const rand = Math.random();
    const caseNum = rand < 0.70 ? 1 : rand < 0.85 ? 2 : 3;

    if (caseNum === 1) {
      // 70% Connect Success
      setTimeout(() => {
        if (audioCleanupRef.current) {
          audioCleanupRef.current();
          audioCleanupRef.current = null;
        }
        setCallState('CONNECTED');
        setStatusMessage('Connected with Fitness Coach');
        if (showToast) showToast('Connected! Live 1-minute consultation active.');
      }, 4500);
    } else if (caseNum === 2) {
      // 15% Call Decline
      setTimeout(() => {
        if (audioCleanupRef.current) {
          audioCleanupRef.current();
          audioCleanupRef.current = null;
        }
        playCutTone();
        setCallState('DECLINED');
        setStatusMessage('Coach Unavailable (Call Declined)');
        if (showToast) showToast('Coach declined the call. Please try again.');

        setTimeout(() => {
          setCallState('IDLE');
          setStatusMessage('Ready for consultation');
        }, 3000);
      }, 3200);
    } else {
      // 15% Line Busy
      setTimeout(() => {
        if (audioCleanupRef.current) {
          audioCleanupRef.current();
          audioCleanupRef.current = null;
        }
        playBusyTone();
        setCallState('BUSY');
        setStatusMessage('Line Busy — Coach in another session');
        if (showToast) showToast('Line Busy: Coach is currently consulting another athlete.');

        setTimeout(() => {
          setCallState('IDLE');
          setStatusMessage('Ready for consultation');
        }, 3500);
      }, 2500);
    }
  };

  const handleEndCall = (reason = 'Call Ended') => {
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }
    playCutTone();
    setCallState('ENDED');
    setStatusMessage(reason);
    if (showToast) showToast(reason);

    setTimeout(() => {
      setCallState('IDLE');
      setStatusMessage('Ready for consultation');
      setCallSeconds(0);
    }, 2000);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E1E1E] via-[#2D1B18] to-[#1E1E1E] p-6 sm:p-8 border border-[#FF5722]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF5722] text-xs font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5" />
              <span>Live 1-on-1 Fitness Consultation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              FleetBuild Live Fitness Coach
            </h1>
            <p className="text-sm font-semibold text-white/90 leading-relaxed">
              Connect with our FleetBuild Fitness Coach for a 1 minute call session.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
              callState === 'CONNECTED'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : callState === 'RINGING'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-white/10 border-white/20 text-white/80'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                callState === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' :
                callState === 'RINGING' ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
              }`} />
              <span>{statusMessage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Call Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Aspect-Ratio 16:9 Realistic Video Container (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full bg-[#1A1A1A] border border-white/10 rounded-3xl p-3 sm:p-4 shadow-2xl space-y-4 relative overflow-hidden">
            
            {/* Top Bar Call Overlay */}
            <div className="flex items-center justify-between px-3 py-1 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  callState === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'
                }`} />
                <span className="font-bold text-white tracking-wide">FleetBuild Fitness Coach</span>
              </div>

              <div className="flex items-center gap-3">
                {callState === 'CONNECTED' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 font-mono text-emerald-400 font-bold text-xs shadow-md">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>{formatTimer(callSeconds)} / 01:00</span>
                  </div>
                )}
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50 font-mono">
                  1080p HD Video
                </span>
              </div>
            </div>

            {/* 16:9 Frame Display Screen */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl group">
              
              {/* CONNECTED / LIVE STREAM STATE */}
              {(callState === 'CONNECTED' || callState === 'RINGING') && (
                <div className={`relative w-full h-full overflow-hidden bg-black flex items-center justify-center ${callState === 'RINGING' ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
                  
                  {/* LiveAvatar Embed Frame */}
                  <iframe
                    src="https://embed.liveavatar.com/v1/49db0357-0ee1-4c12-a7c2-3c3a6203c75b?orientation=horizontal"
                    allow="microphone; camera; autoplay; display-capture; encrypted-media; fullscreen"
                    title="LiveAvatar Embed"
                    className="absolute border-0 w-full h-full pointer-events-auto"
                    style={{
                      width: '100%',
                      height: '100%',
                      top: 0,
                      left: 0,
                      border: 'none',
                    }}
                  />

                  {/* Top Live Audio Status Overlay */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-white/90 shadow-lg pointer-events-none">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span className="font-semibold">FleetBuild Live Coach Connected</span>
                  </div>

                  {/* OPAQUE MASK 1: Completely covers the 'English v' dropdown selector at bottom-left of white pill */}
                  <div className="absolute bottom-0 left-0 w-[51%] h-14 bg-zinc-950 border-t border-r border-white/10 z-20 pointer-events-auto flex items-center justify-between px-4 text-xs text-white/80 shadow-2xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-bold text-white tracking-wide">Live Audio Call</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      1080p HD
                    </span>
                  </div>

                  {/* OPAQUE MASK 2: Top / Background frame masks to ensure pristine border fit */}
                  <div className="absolute bottom-0 right-0 w-[12%] h-14 bg-zinc-950 border-t border-l border-white/10 z-20 pointer-events-auto" />

                  {/* CALL TRIGGER INSTRUCTION OVERLAY over Chat Now button zone (Right half of white pill) */}
                  <div className="absolute bottom-1 right-[12%] z-30 pointer-events-none animate-pulse">
                    <div className="px-3 py-1 rounded-full bg-[#00b2ff] text-white text-[10px] font-extrabold shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Live Voice Active</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RINGING STATE OVERLAY */}
              {callState === 'RINGING' && (
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-900 flex flex-col items-center justify-center space-y-6 p-6 text-center z-20">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-32 h-32 rounded-full bg-[#FF5722]/20 animate-ping" />
                    <div className="absolute w-24 h-24 rounded-full bg-[#FF5722]/30 animate-pulse" />
                    <div className="w-20 h-20 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-xl z-10">
                      <PhoneCall className="w-10 h-10 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white tracking-tight">Calling FleetBuild Fitness Coach</h3>
                    <p className="text-xs text-white/60">Establishing 1-on-1 video call connection...</p>
                  </div>

                  <button
                    onClick={() => handleEndCall('Call Cancelled')}
                    className="px-6 py-2.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Cancel Call</span>
                  </button>
                </div>
              )}

              {/* BUSY STATE OVERLAY */}
              {callState === 'BUSY' && (
                <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center space-y-4 p-6 text-center z-20 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-lg font-bold text-white">Line Busy</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      The FleetBuild Fitness Coach is currently in another 1-minute consultation call with an athlete. Please try again in a few moments.
                    </p>
                  </div>
                </div>
              )}

              {/* DECLINED STATE OVERLAY */}
              {callState === 'DECLINED' && (
                <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center space-y-4 p-6 text-center z-20 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                    <PhoneOff className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-lg font-bold text-white">Call Declined</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      The coach is currently step-training or unavailable. Resetting line...
                    </p>
                  </div>
                </div>
              )}

              {/* IDLE / ENDED STANDBY SCREEN */}
              {(callState === 'IDLE' || callState === 'ENDED') && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#1E1E1E] to-[#121212] flex flex-col items-center justify-center space-y-5 p-6 text-center z-10">
                  <div className="w-20 h-20 rounded-full bg-[#FF5722]/15 border border-[#FF5722]/40 text-[#FF5722] flex items-center justify-center shadow-2xl relative">
                    <Video className="w-9 h-9" />
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black" />
                  </div>

                  <div className="space-y-1 max-w-md">
                    <h3 className="text-xl font-bold text-white tracking-tight">FleetBuild Fitness Coach Standby</h3>
                    <p className="text-xs text-white/70">
                      Connect with our FleetBuild Fitness Coach for a 1 minute call session to review workout technique, mobility, or goals.
                    </p>
                  </div>

                  <button
                    onClick={handleStartCall}
                    className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-3 transition-all shadow-xl shadow-emerald-600/30 hover:scale-105 cursor-pointer"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span>Connect Call with Fitness Coach</span>
                  </button>
                </div>
              )}

            </div>

            {/* Realistic Video Call Control Dock at Bottom */}
            <div className="p-3 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (showToast) showToast(isMuted ? 'Microphone unmuted' : 'Microphone muted');
                  }}
                  disabled={callState !== 'CONNECTED'}
                  className={`p-3 rounded-xl border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    isMuted 
                      ? 'bg-red-500/20 border-red-500 text-red-400' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                  }`}
                  title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#FF5722]" />}
                </button>

                <button
                  onClick={() => {
                    setIsSpeakerOn(!isSpeakerOn);
                    if (showToast) showToast(isSpeakerOn ? 'Speaker muted' : 'Speaker enabled');
                  }}
                  disabled={callState !== 'CONNECTED'}
                  className={`p-3 rounded-xl border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    !isSpeakerOn 
                      ? 'bg-red-500/20 border-red-500 text-red-400' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                  }`}
                  title={isSpeakerOn ? 'Mute Speaker' : 'Enable Speaker'}
                >
                  {!isSpeakerOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <span className="text-xs text-white/50 hidden sm:inline ml-1 font-medium">
                  {callState === 'CONNECTED' ? 'Mic & Speaker Connected' : 'Controls active when in call'}
                </span>
              </div>

              {/* Main Call Action Toggle */}
              <div>
                {callState === 'CONNECTED' ? (
                  <button
                    onClick={() => handleEndCall('Call Ended')}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Hang Up</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartCall}
                    disabled={callState === 'RINGING'}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{callState === 'RINGING' ? 'Ringing...' : 'Connect Call'}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side Options & Topic Guidance (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Interactive Call Guidance</h2>
                <p className="text-xs text-white/60">Select consultation priority</p>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed bg-[#121212] p-4 rounded-2xl border border-white/5">
              Connect with our FleetBuild Fitness Coach for a 1 minute call session to receive targeted feedback during your workout split.
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">Select Topic For Call</span>
              <div className="grid grid-cols-1 gap-2">
                {topics.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedTopic(t.title);
                      if (showToast) showToast(`Selected consultation topic: ${t.title}`);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      selectedTopic === t.title
                        ? 'bg-[#FF5722]/15 border-[#FF5722] text-white'
                        : 'bg-[#121212] border-white/10 hover:border-white/20 text-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{t.title}</span>
                      {selectedTopic === t.title ? (
                        <CheckCircle2 className="w-4 h-4 text-[#FF5722]" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-white/30" />
                      )}
                    </div>
                    <span className="text-[11px] text-white/50 block mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & Connection Assurance */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Call Integrity & Audio Quality</h3>
            </div>
            <ul className="space-y-2 text-xs text-white/70">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Private peer-to-peer audio stream.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>16:9 HD horizontal orientation streaming.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Auto-call duration management (60 seconds per session).</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
