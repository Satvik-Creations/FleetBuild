import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
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
  CheckCircle2,
  Radio,
  Bot,
  User,
  RadioTower,
  AudioLines
} from 'lucide-react';

interface LiveCoachViewProps {
  showToast?: (msg: string) => void;
}

type CallState = 'IDLE' | 'RINGING' | 'CONNECTED' | 'DECLINED' | 'BUSY' | 'ENDED';

interface VoiceTranscriptMessage {
  sender: 'coach' | 'user';
  text: string;
  time: string;
}

export const LiveCoachView: React.FC<LiveCoachViewProps> = ({ showToast }) => {
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('Form & Movement Check');
  const [statusMessage, setStatusMessage] = useState<string>('Ready for voice call');
  
  const [isCoachSpeaking, setIsCoachSpeaking] = useState<boolean>(false);
  const [isUserListening, setIsUserListening] = useState<boolean>(false);
  const [isLoadingReply, setIsLoadingReply] = useState<boolean>(false);
  const [transcripts, setTranscripts] = useState<VoiceTranscriptMessage[]>([]);
  const [voiceInterpretedText, setVoiceInterpretedText] = useState<string>('');

  const timerRef = useRef<any>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const topics = [
    { title: 'Form & Movement Check', desc: 'Posture, spinal alignment & rep cues' },
    { title: 'Warm-Up & Mobility', desc: 'Pre-workout activation guidance' },
    { title: 'Post-Workout Cool Down', desc: 'Stretching & muscle recovery advice' },
    { title: 'Goal & Mindset Boost', desc: 'Quick motivation for today\'s workout' },
  ];

  // Helper to format timestamps
  const getCurrentTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sound Synthesizers for realistic phone call tones using Web Audio API
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

  // Natural Deep Male Voice Speech Synthesis with Web Speech API
  const speakTextDeepMaleVoice = (text: string) => {
    if (!('speechSynthesis' in window) || !isSpeakerOn) return;

    try {
      window.speechSynthesis.cancel(); // Clear any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // Prioritize natural sounding deep male voices across Chrome, Edge, Safari, Firefox
        const deepMaleVoice = voices.find(
          (v) =>
            v.name.toLowerCase().includes('google uk english male') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('alex') ||
            v.name.toLowerCase().includes('daniel') ||
            v.name.toLowerCase().includes('george') ||
            v.name.toLowerCase().includes('male') ||
            (v.lang.startsWith('en') && !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('zira') && !v.name.toLowerCase().includes('susan'))
        );

        if (deepMaleVoice) {
          utterance.voice = deepMaleVoice;
        }
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          setVoice();
        };
      }

      // Tuned parameters for realistic, human-like deep male trainer voice
      utterance.pitch = 0.82; // Warm, deep male pitch
      utterance.rate = 0.96;  // Energetic, confident tempo
      utterance.volume = isSpeakerOn ? 1.0 : 0.0;

      utterance.onstart = () => setIsCoachSpeaking(true);
      utterance.onend = () => setIsCoachSpeaking(false);
      utterance.onerror = () => setIsCoachSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setIsCoachSpeaking(false);
    }
  };

  // Initialize Microphone Speech Recognition for Live Continuous Voice Input
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && callState === 'CONNECTED' && !isMuted) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsUserListening(true);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (interimTranscript) {
            setVoiceInterpretedText(interimTranscript);
          }

          if (finalTranscript.trim()) {
            const spokenMessage = finalTranscript.trim();
            setVoiceInterpretedText('');

            // Stop speech synthesis if coach is currently talking so trainer listens to user
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              setIsCoachSpeaking(false);
            }

            setTranscripts((prev) => [
              ...prev,
              { sender: 'user', text: spokenMessage, time: getCurrentTime() },
            ]);

            fetchCoachVoiceResponse(spokenMessage);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition status:', err?.error);
        };

        recognition.onend = () => {
          setIsUserListening(false);
          // Restart listening if call is still active & not muted
          if (callState === 'CONNECTED' && !isMuted && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (_) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Could not start microphone speech recognition:', err);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
        recognitionRef.current = null;
      }
      setIsUserListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
        recognitionRef.current = null;
      }
    };
  }, [callState, isMuted]);

  // Auto scroll transcript log
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [transcripts, voiceInterpretedText]);

  // Timer Effect for 3-Minute Session Limit (180 seconds)
  useEffect(() => {
    if (callState === 'CONNECTED') {
      setCallSeconds(0);
      timerRef.current = setInterval(() => {
        setCallSeconds((prev) => {
          if (prev >= 180) { // 3 Minutes limit
            handleEndCall('3-Minute AI Voice Consultation Complete');
            return 180;
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

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
        audioCleanupRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [callState]);

  // Fetch AI Coach Response from OpenRouter API
  const fetchCoachVoiceResponse = async (userMsg?: string, topicName?: string) => {
    setIsLoadingReply(true);
    try {
      const res = await fetch('/api/voice-coach/talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          topic: topicName || selectedTopic,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || "FleetBuild AI Fitness Trainer here! Squeeze your core, drive through your feet, and make this rep count!";
        
        setTranscripts((prev) => [
          ...prev,
          { sender: 'coach', text: reply, time: getCurrentTime() },
        ]);

        speakTextDeepMaleVoice(reply);
      } else {
        const fallbackText = "FleetBuild AI Fitness Trainer here! Keep your posture upright, breathe steadily, and execute with maximum control!";
        setTranscripts((prev) => [
          ...prev,
          { sender: 'coach', text: fallbackText, time: getCurrentTime() },
        ]);
        speakTextDeepMaleVoice(fallbackText);
      }
    } catch (err) {
      const fallbackText = "FleetBuild AI Fitness Trainer on the line! Maintain tension in your legs and explode upward!";
      setTranscripts((prev) => [
        ...prev,
        { sender: 'coach', text: fallbackText, time: getCurrentTime() },
      ]);
      speakTextDeepMaleVoice(fallbackText);
    } finally {
      setIsLoadingReply(false);
    }
  };

  // Start Voice Call Handler (70% Connect / 15% Decline / 15% Busy)
  const handleStartCall = () => {
    if (callState !== 'IDLE') return;

    setCallState('RINGING');
    setStatusMessage('Dialing FleetBuild AI Fitness Trainer...');
    if (showToast) showToast('Dialing FleetBuild AI Fitness Trainer...');

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
        setStatusMessage('Voice Call Active (fish-audio/s2.1-pro-free:free)');
        if (showToast) showToast('Connected! Live 3-minute voice consultation active. Speak into your mic!');

        // Initial Greeting from Coach
        const initialGreeting = `Yo athlete! FleetBuild AI Fitness Trainer here. I am listening live to your voice. What are we targeting today: ${selectedTopic}?`;
        setTranscripts([
          { sender: 'coach', text: initialGreeting, time: getCurrentTime() },
        ]);
        speakTextDeepMaleVoice(initialGreeting);
      }, 3800);
    } else if (caseNum === 2) {
      // 15% Call Decline
      setTimeout(() => {
        if (audioCleanupRef.current) {
          audioCleanupRef.current();
          audioCleanupRef.current = null;
        }
        playCutTone();
        setCallState('DECLINED');
        setStatusMessage('Trainer Unavailable (Call Declined)');
        if (showToast) showToast('FleetBuild AI Fitness Trainer declined. Please try again.');

        setTimeout(() => {
          setCallState('IDLE');
          setStatusMessage('Ready for voice call');
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
        setStatusMessage('Line Busy — Trainer in another consultation');
        if (showToast) showToast('Line Busy: FleetBuild AI Fitness Trainer is consulting another athlete.');

        setTimeout(() => {
          setCallState('IDLE');
          setStatusMessage('Ready for voice call');
        }, 3500);
      }, 2500);
    }
  };

  const handleEndCall = (reason = 'Call Ended') => {
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsCoachSpeaking(false);
    setIsUserListening(false);
    playCutTone();
    setCallState('ENDED');
    setStatusMessage(reason);
    if (showToast) showToast(reason);

    setTimeout(() => {
      setCallState('IDLE');
      setStatusMessage('Ready for voice call');
      setCallSeconds(0);
      setTranscripts([]);
      setVoiceInterpretedText('');
    }, 2000);
  };

  // Quick topic trigger during call
  const handleSelectTopic = (topicTitle: string) => {
    setSelectedTopic(topicTitle);
    if (showToast) showToast(`Focus topic set: ${topicTitle}`);

    if (callState === 'CONNECTED') {
      const topicMsg = `Coach, give me your live advice on ${topicTitle}.`;
      setTranscripts((prev) => [
        ...prev,
        { sender: 'user', text: topicMsg, time: getCurrentTime() },
      ]);
      fetchCoachVoiceResponse(topicMsg, topicTitle);
    }
  };

  // Format 3 minute timer `03:00`
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E1E1E] via-[#2A1713] to-[#1E1E1E] p-6 sm:p-8 border border-[#FF5722]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF5722] text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>3-Minute Live Voice Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              FleetBuild AI Fitness Trainer
            </h1>
            <p className="text-sm font-semibold text-white/90 leading-relaxed">
              Speak into your microphone in real time. Powered by <span className="text-[#FF5722] font-bold font-mono">fish-audio/s2.1-pro-free:free</span> deep male voice model.
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

      {/* Main Voice Assistant Call Console Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Voice Stage (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-4">
          <div className="w-full bg-[#1A1A1A] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Top Bar Call Overlay */}
            <div className="flex items-center justify-between px-2 text-xs text-white/80 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="font-bold text-white tracking-wide block">FleetBuild AI Fitness Trainer</span>
                  <span className="text-[10px] text-[#FF5722] font-mono">fish-audio/s2.1-pro-free:free</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {callState === 'CONNECTED' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-emerald-500/30 font-mono text-emerald-400 font-bold text-xs shadow-md">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>{formatTimer(callSeconds)} / 03:00</span>
                  </div>
                )}
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 font-mono">
                  Realtime Mic Input Active
                </span>
              </div>
            </div>

            {/* Voice Stage Screen Frame */}
            <div className="relative w-full min-h-[380px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#121212] via-[#1A1A1A] to-[#121212] border border-white/10 flex flex-col items-center justify-between p-6 shadow-2xl">
              
              {/* CONNECTED LIVE VOICE STATE */}
              {callState === 'CONNECTED' && (
                <div className="w-full h-full flex flex-col items-center justify-between space-y-6 animate-fade-in my-auto">
                  
                  {/* Trainer Avatar & Audio Visualizer Rings */}
                  <div className="relative flex flex-col items-center justify-center space-y-3 pt-2">
                    {/* Live Equalizer Voice Activity Pulse Rings */}
                    <div className={`absolute w-40 h-40 rounded-full bg-[#FF5722]/20 transition-all duration-300 ${isCoachSpeaking ? 'scale-125 opacity-100 animate-ping' : 'scale-100 opacity-20'}`} />
                    <div className={`absolute w-32 h-32 rounded-full bg-[#FF5722]/30 transition-all duration-300 ${isCoachSpeaking ? 'scale-110 opacity-100' : 'scale-100 opacity-40'}`} />
                    
                    <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF5722] to-[#E64A19] border-4 border-black text-white flex items-center justify-center shadow-2xl">
                      <Bot className="w-12 h-12" />
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                        <span>Marcus — FleetBuild AI Trainer</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </h3>
                      <p className="text-xs font-semibold text-[#FF5722] flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Realistic Deep Male Voice</span>
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Voice Assistant Status Indicator */}
                  <div className="w-full max-w-md flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-black/60 border border-white/10">
                    {isCoachSpeaking ? (
                      <div className="flex items-center gap-2 text-[#FF5722] text-xs font-bold animate-pulse">
                        <AudioLines className="w-4 h-4" />
                        <span>FleetBuild Trainer Speaking...</span>
                      </div>
                    ) : isUserListening ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
                        <Mic className="w-4 h-4" />
                        <span>Microphone Active — Speak Now...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                        <RadioTower className="w-4 h-4 text-emerald-400" />
                        <span>Live Voice Stream Ready</span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic HD Waveform Bars */}
                  <div className="flex items-center justify-center gap-1.5 h-10 py-1">
                    {[30, 60, 95, 40, 85, 100, 70, 45, 90, 35, 80, 55, 25].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-150 ${
                          isCoachSpeaking 
                            ? 'bg-gradient-to-t from-[#FF5722] to-[#FFC107] animate-pulse' 
                            : isUserListening 
                            ? 'bg-gradient-to-t from-emerald-500 to-teal-300 animate-pulse'
                            : 'bg-white/20 h-2'
                        }`}
                        style={{
                          height: (isCoachSpeaking || isUserListening) ? `${Math.max(12, (h * (i % 2 === 0 ? 0.9 : 1.1)) % 38)}px` : '8px',
                          animationDelay: `${i * 70}ms`
                        }}
                      />
                    ))}
                  </div>

                  {/* Live Interpreted Voice Stream Transcript Log */}
                  <div className="w-full bg-black/70 border border-white/10 rounded-2xl p-4 max-h-48 overflow-y-auto space-y-3 shadow-inner" ref={chatScrollRef}>
                    {transcripts.length === 0 ? (
                      <div className="text-center py-4 space-y-1">
                        <p className="text-xs text-emerald-400 font-bold">
                          Microphone is listening live!
                        </p>
                        <p className="text-[11px] text-white/50">
                          Speak naturally into your microphone (e.g. "Coach, how do I position my knees during squats?")
                        </p>
                      </div>
                    ) : (
                      transcripts.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-2.5 text-xs ${
                            msg.sender === 'coach' ? 'text-white' : 'text-emerald-300 justify-end'
                          }`}
                        >
                          {msg.sender === 'coach' && (
                            <div className="w-6 h-6 rounded-full bg-[#FF5722] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              FB
                            </div>
                          )}
                          <div className={`p-3 rounded-2xl max-w-[85%] ${
                            msg.sender === 'coach' 
                              ? 'bg-[#1E1E1E] border border-white/10 text-white/90' 
                              : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                          }`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                              {msg.sender === 'coach' ? (
                                <span className="text-[#FF5722]">FleetBuild AI Trainer (Voice Output)</span>
                              ) : (
                                <span className="text-emerald-400">Your Spoken Microphone Input</span>
                              )}
                            </div>
                            <p className="leading-relaxed font-medium text-xs">{msg.text}</p>
                            <span className="text-[9px] text-white/40 block mt-1 text-right">{msg.time}</span>
                          </div>
                          {msg.sender === 'user' && (
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              YOU
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {voiceInterpretedText && (
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
                        <Mic className="w-4 h-4 text-emerald-400" />
                        <span>Hearing you speak: "{voiceInterpretedText}..."</span>
                      </div>
                    )}

                    {isLoadingReply && (
                      <div className="flex items-center gap-2 text-xs text-[#FF5722] animate-pulse py-1">
                        <Bot className="w-4 h-4" />
                        <span>FleetBuild AI Trainer processing voice response...</span>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* RINGING STATE */}
              {callState === 'RINGING' && (
                <div className="my-auto flex flex-col items-center justify-center space-y-6 text-center z-20">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-32 h-32 rounded-full bg-[#FF5722]/20 animate-ping" />
                    <div className="absolute w-24 h-24 rounded-full bg-[#FF5722]/30 animate-pulse" />
                    <div className="w-20 h-20 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-xl z-10">
                      <PhoneCall className="w-10 h-10 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white tracking-tight">Calling FleetBuild AI Fitness Trainer</h3>
                    <p className="text-xs text-white/60">Connecting real-time deep voice assistant...</p>
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

              {/* BUSY STATE */}
              {callState === 'BUSY' && (
                <div className="my-auto flex flex-col items-center justify-center space-y-4 text-center z-20 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-lg font-bold text-white">Line Busy</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      FleetBuild AI Fitness Trainer is currently consulting another athlete. Retrying in moments...
                    </p>
                  </div>
                </div>
              )}

              {/* DECLINED STATE */}
              {callState === 'DECLINED' && (
                <div className="my-auto flex flex-col items-center justify-center space-y-4 text-center z-20 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                    <PhoneOff className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-lg font-bold text-white">Call Declined</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      The trainer is unavailable right now. Resetting connection...
                    </p>
                  </div>
                </div>
              )}

              {/* IDLE / ENDED STANDBY SCREEN */}
              {(callState === 'IDLE' || callState === 'ENDED') && (
                <div className="my-auto flex flex-col items-center justify-center space-y-5 text-center z-10 py-6">
                  <div className="w-20 h-20 rounded-full bg-[#FF5722]/15 border border-[#FF5722]/40 text-[#FF5722] flex items-center justify-center shadow-2xl relative">
                    <Radio className="w-9 h-9 animate-pulse" />
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">FleetBuild AI Fitness Trainer</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Connect for a 3-minute live voice call. Speak directly into your mic to receive real-time exercise & form guidance in a realistic deep male voice.
                    </p>
                  </div>

                  <button
                    onClick={handleStartCall}
                    className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-3 transition-all shadow-xl shadow-emerald-600/30 hover:scale-105 cursor-pointer"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span>Start 3-Min Voice Call</span>
                  </button>
                </div>
              )}

            </div>

            {/* Voice Call Control Dock at Bottom */}
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextMute = !isMuted;
                    setIsMuted(nextMute);
                    if (showToast) showToast(nextMute ? 'Microphone muted' : 'Microphone active — Listening to your voice');
                  }}
                  disabled={callState !== 'CONNECTED'}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    isMuted 
                      ? 'bg-red-500/20 border-red-500 text-red-400' 
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  }`}
                  title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />}
                  <span>{isMuted ? 'Mic Muted' : 'Mic Active'}</span>
                </button>

                <button
                  onClick={() => {
                    const nextSpeaker = !isSpeakerOn;
                    setIsSpeakerOn(nextSpeaker);
                    if (!nextSpeaker && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    if (showToast) showToast(nextSpeaker ? 'Speaker audio enabled' : 'Speaker audio muted');
                  }}
                  disabled={callState !== 'CONNECTED'}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    !isSpeakerOn 
                      ? 'bg-red-500/20 border-red-500 text-red-400' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                  }`}
                  title={isSpeakerOn ? 'Mute Speaker' : 'Enable Speaker'}
                >
                  {!isSpeakerOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              {/* Main Call Action Toggle */}
              <div>
                {callState === 'CONNECTED' ? (
                  <button
                    onClick={() => handleEndCall('Call Ended')}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Voice Call</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartCall}
                    disabled={callState === 'RINGING'}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{callState === 'RINGING' ? 'Ringing...' : 'Connect Voice Call'}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side Topic Guidance & Model Info (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Trainer Focus Topics</h2>
                <p className="text-xs text-white/60">Select target topic for Marcus</p>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed bg-[#121212] p-4 rounded-2xl border border-white/5">
              Select a topic and speak into your microphone. FleetBuild AI Fitness Trainer will listen to your voice and reply with realistic deep male speech.
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">Active Focus</span>
              <div className="grid grid-cols-1 gap-2">
                {topics.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectTopic(t.title)}
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

          {/* Model & Architecture Badge */}
          <div className="rounded-3xl bg-[#1E1E1E] p-6 border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Voice Model Specs</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li className="flex items-center justify-between">
                <span className="text-white/50">Model Engine:</span>
                <span className="font-mono text-[11px] text-[#FF5722] font-bold">fish-audio/s2.1-pro-free:free</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/50">API Provider:</span>
                <span className="font-mono text-[11px] text-white font-semibold">OpenRouter</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/50">Input Mechanism:</span>
                <span className="text-emerald-400 font-semibold">Live Microphone Speech</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/50">Voice Output:</span>
                <span className="text-emerald-400 font-semibold">Realistic Deep Male Trainer</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/50">Session Limit:</span>
                <span className="text-white font-semibold">3 Minutes Auto-Limit</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
