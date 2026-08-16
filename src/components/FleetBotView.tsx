import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MemoryContext } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Check, 
  Edit2, 
  Zap, 
  Cpu, 
  User, 
  Lock, 
  CreditCard, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  X,
  Receipt,
  RotateCcw
} from 'lucide-react';

interface FleetBotViewProps {
  messages: ChatMessage[];
  memoryContext: MemoryContext;
  onSendMessage: (text: string) => void;
  onUpdateMemoryContext: (updated: Partial<MemoryContext>) => void;
  onLoadAdaptiveRoutine: () => void;
  isRoutineLoaded: boolean;
  isGenerating: boolean;
  isPaid: boolean;
  paymentDetails: { paymentId?: string; paidAt?: string; expiresAt?: string; planName?: string } | null;
  onVerifyPayment: (paymentId?: string) => Promise<boolean>;
  onResetPayment?: () => void;
  showToast?: (msg: string) => void;
}

export const FleetBotView: React.FC<FleetBotViewProps> = ({
  messages,
  memoryContext,
  onSendMessage,
  onUpdateMemoryContext,
  onLoadAdaptiveRoutine,
  isRoutineLoaded,
  isGenerating,
  isPaid,
  paymentDetails,
  onVerifyPayment,
  onResetPayment,
  showToast,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEditingMemory, setIsEditingMemory] = useState(false);
  const [editGoal, setEditGoal] = useState(memoryContext.goal);
  const [editInjury, setEditInjury] = useState(memoryContext.injury);
  const [editHates, setEditHates] = useState(memoryContext.hates);
  const [editCalories, setEditCalories] = useState(memoryContext.calories);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Payment Gateway Verification Modal & ID Entry State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentIdInput, setPaymentIdInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const NEW_RAZORPAY_URL = 'https://rzp.io/rzp/FleetBuild';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isPaid) {
      scrollToBottom();
    }
  }, [messages, isGenerating, isPaid]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSaveMemory = () => {
    onUpdateMemoryContext({
      goal: editGoal,
      injury: editInjury,
      hates: editHates,
      calories: editCalories,
      lastUpdated: 'Just updated',
    });
    setIsEditingMemory(false);
  };

  const handleCheckPaymentStatus = async (explicitPaymentId?: string) => {
    setIsVerifying(true);
    setVerificationError(null);
    const targetId = explicitPaymentId || paymentIdInput.trim() || undefined;

    try {
      const verified = await onVerifyPayment(targetId);
      if (verified) {
        setShowCheckoutModal(false);
        setShowSuccessModal(true);
        if (showToast) showToast('🎉 FleetBot AI 1-Year Access Successfully Verified!');
      } else {
        setVerificationError('Razorpay payment verification failed. Access cannot be granted without completed payment on the gateway.');
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Payment verification failed. Please verify your payment ID.');
    } finally {
      setIsVerifying(false);
    }
  };

  const quickPrompts = [
    "I can't do my leg workout today, my left knee is acting up.",
    "Suggest a 15-min core finisher to replace squats",
    "How is my recovery score looking today?",
    "Update my goal to lean fat loss & definition",
  ];

  const formattedExpiryDate = paymentDetails?.expiresAt 
    ? new Date(paymentDetails.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '1 Year from Activation Date';

  // --- UNPAID PAYWALL VIEW ---
  if (!isPaid) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Paywall Header Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-[#FF5722]/20 border border-[#FF5722]/40 rounded-3xl p-6 md:p-10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5722]/20 border border-[#FF5722]/50 text-[#FF5722] text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              FleetBot AI • 1-Year Subscription (₹49.00/year)
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              ✓ All Other App Features Are 100% FREE
            </span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] to-amber-400">FleetBot AI Neural Coach</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              FleetBot AI is our specialized personal fitness trainer and biomechanical memory engine. Get 1 full year of unlimited AI workout coaching, real-time exercise feedback, and injury adaptations for <strong className="text-white font-mono">₹49.00 / Year (365 Days Access)</strong>.
            </p>
          </div>

          {/* Pricing Highlight Box */}
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">FleetBuild Premium Annual Subscription</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white font-mono">₹49.00</span>
                <span className="text-sm text-zinc-400 font-semibold">/ year</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">1-Year Pass • Server Verified via Razorpay Gateway</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <a
                href={NEW_RAZORPAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#FF5722] to-[#E64A19] hover:from-[#E64A19] hover:to-[#D84315] text-white font-bold text-sm rounded-xl shadow-xl shadow-[#FF5722]/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <CreditCard className="w-4 h-4" />
                <span>Get FleetBot – 1 Year Access (₹49)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                type="button"
                onClick={() => setShowCheckoutModal(true)}
                className="w-full sm:w-auto px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm rounded-xl border border-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verify Payment ID</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF5722] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">24/7 Neural AI Assistant</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Get immediate exercise swaps, weight progressions, and biomechanical feedback tailored specifically to your workout routine.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Active Memory Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              FleetBot remembers your injuries, pain zones, excluded exercises, and target calorie intake across sessions automatically.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Verified Razorpay Gateway</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatic payment verification. Access is unlocked strictly after completed payment is verified on the server.
            </p>
          </div>
        </div>

        {/* Verification Status & ID Entry Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Completed Your Razorpay Payment?
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              After completing payment on Razorpay (<span className="text-amber-400 font-mono">https://rzp.io/rzp/FleetBuild</span>), verify below to unlock your 1-Year pass.
            </p>
          </div>

          {verificationError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <X className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{verificationError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Enter Razorpay Payment ID (e.g. pay_123456789)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={paymentIdInput}
                  onChange={(e) => setPaymentIdInput(e.target.value)}
                  placeholder="e.g. pay_P2aK8mN9xQ..."
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722]"
                />
                <button
                  type="button"
                  onClick={() => handleCheckPaymentStatus()}
                  disabled={isVerifying}
                  className="px-6 py-3 bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF5722]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-w-[180px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isVerifying ? 'Verifying...' : 'Verify & Unlock Access'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateway Modal Window */}
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
              
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-[#FF5722]/20 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF5722] flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">FleetBot 1-Year Pass Checkout Gateway</h3>
                    <p className="text-[11px] text-zinc-400">Secured by Razorpay • 256-Bit SSL Encryption</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-800/50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="p-6 space-y-5">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-zinc-800">
                    <span className="text-zinc-400 font-medium">Subscription Item:</span>
                    <span className="font-bold text-white">FleetBot AI Neural Coach</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-zinc-800">
                    <span className="text-zinc-400 font-medium">Subscription Term:</span>
                    <span className="font-bold text-amber-400">1 Year (365 Days Access)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Annual Subscription Fee:</span>
                    <span className="font-mono font-black text-xl text-emerald-400">₹49.00 <span className="text-xs font-normal text-zinc-400">INR</span></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-300">Enter Razorpay Payment ID:</label>
                  <input
                    type="text"
                    value={paymentIdInput}
                    onChange={(e) => setPaymentIdInput(e.target.value)}
                    placeholder="e.g. pay_P2aK8mN9xQ..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5722]"
                  />
                </div>

                {verificationError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{verificationError}</span>
                  </div>
                )}

                {/* Gateway Action Buttons */}
                <div className="space-y-3 pt-1">
                  <a
                    href={NEW_RAZORPAY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-gradient-to-r from-[#FF5722] to-[#E64A19] hover:from-[#E64A19] hover:to-[#D84315] text-white font-bold text-sm rounded-xl shadow-xl shadow-[#FF5722]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Open Razorpay Payment Page (₹49.00)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCheckPaymentStatus()}
                    disabled={isVerifying}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl border border-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isVerifying ? 'Verifying Gateway...' : 'Verify Gateway Payment Status'}</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-center text-[11px] text-zinc-500">
                100% Secure • Razorpay SSL Encrypted • Instant Server Verification
              </div>

            </div>
          </div>
        )}

        {/* Payment Success Confirmation Experience */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Payment Verified!</h3>
                <p className="text-xs text-emerald-400 font-semibold mt-1">Your FleetBot Premium access has been activated.</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-left space-y-2.5 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subscription Plan:</span>
                  <span className="font-bold text-white">FleetBot — 1 Year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Payment Status:</span>
                  <span className="font-bold text-emerald-400">Successful</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Access Expiration:</span>
                  <span className="font-bold text-amber-400">{formattedExpiryDate}</span>
                </div>
                {paymentDetails?.paymentId && (
                  <div className="flex justify-between pt-1 border-t border-zinc-800">
                    <span className="text-zinc-400">Transaction ID:</span>
                    <span className="font-mono text-zinc-300">{paymentDetails.paymentId}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Start Using FleetBot
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- PAID FULL FLEETBOT CHAT VIEW ---
  return (
    <div className="flex flex-col h-[calc(100dvh-150px)] sm:h-[calc(100vh-120px)] max-h-[900px] rounded-3xl bg-[#121212] border border-white/10 shadow-2xl overflow-hidden animate-fadeIn">
      
      {/* FleetBot Header */}
      <div className="p-4 sm:p-6 bg-[#1E1E1E] border-b border-white/10 flex flex-col gap-4">
        
        {/* Top Title & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-[#FF5722]/30 relative">
              <Bot className="w-6 h-6" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1E1E1E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">FleetBot Neural Coach</h2>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" />
                  PRO UNLOCKED (₹49 Paid)
                </button>
              </div>
              <p className="text-xs text-white/50">Adaptive Neural Assistant • Real-time Medical & Injury Profiling</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReceiptModal(true)}
              className="p-2 rounded-xl bg-[#121212] hover:bg-white/10 border border-white/10 text-xs font-semibold text-emerald-400 flex items-center gap-1 transition-colors"
              title="View Payment Receipt"
            >
              <Receipt className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsEditingMemory(!isEditingMemory)}
              className="px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#FFC107]" />
              <span className="hidden sm:inline">{isEditingMemory ? 'Close Context Editor' : 'Edit Memory Context'}</span>
            </button>
          </div>
        </div>

        {/* Active Memory Context Badge Bar */}
        {!isEditingMemory ? (
          <div className="p-3.5 rounded-2xl bg-[#121212] border border-[#FF5722]/30 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#FF5722] font-bold shrink-0">
              <Sparkles className="w-4 h-4" />
              <span>Active Memory Context:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-white/90 font-medium">
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                🎯 <strong>Goal:</strong> {memoryContext.goal}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-[#FF5722]/20 border border-[#FF5722]/40 text-white font-semibold">
                ⚠️ <strong>Injury:</strong> {memoryContext.injury}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-[#FFC107]/15 border border-[#FFC107]/30 text-[#FFC107]">
                🚫 <strong>Hates:</strong> {memoryContext.hates}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                🔥 <strong>Cal:</strong> {memoryContext.calories}
              </span>
            </div>
          </div>
        ) : (
          /* Inline Memory Context Editor */
          <div className="p-4 rounded-2xl bg-[#121212] border border-[#FF5722] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#FF5722] font-bold">
              <span>Edit Active Memory Attributes</span>
              <span>Updated in real-time</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Primary Goal</label>
                <input
                  type="text"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl p-2 text-white focus:border-[#FF5722] outline-none"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Injury / Pain Profile</label>
                <input
                  type="text"
                  value={editInjury}
                  onChange={(e) => setEditInjury(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl p-2 text-white focus:border-[#FF5722] outline-none"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Excluded Exercises (Hates)</label>
                <input
                  type="text"
                  value={editHates}
                  onChange={(e) => setEditHates(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl p-2 text-white focus:border-[#FF5722] outline-none"
                />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Daily Calorie Target</label>
                <input
                  type="text"
                  value={editCalories}
                  onChange={(e) => setEditCalories(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl p-2 text-white focus:border-[#FF5722] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsEditingMemory(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-white/70 text-xs hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMemory}
                className="px-4 py-1.5 rounded-xl bg-[#FF5722] text-white font-bold text-xs hover:bg-[#E64A19]"
              >
                Save Memory Context
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Chat History Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-[#FF5722] to-amber-500'
                    : 'bg-[#1E1E1E] border border-white/10 text-[#FF5722]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-[85%]">
                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-[#FF5722] to-[#E64A19] text-white rounded-tr-xs shadow-lg shadow-[#FF5722]/20 font-medium'
                      : 'bg-[#1E1E1E] text-white border border-white/10 rounded-tl-xs shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Message Actions */}
                  {msg.hasAction && (
                    <div className="mt-4 pt-3 border-t border-white/15">
                      {msg.actionType === 'load_routine' && (
                        isRoutineLoaded ? (
                          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>Low-Impact Routine Successfully Loaded into Dashboard!</span>
                          </div>
                        ) : (
                          <button
                            onClick={onLoadAdaptiveRoutine}
                            className="w-full py-3 px-4 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#FF5722]/40 transition-all transform hover:scale-[1.01] cursor-pointer"
                          >
                            <Zap className="w-4 h-4 fill-white" />
                            <span>{msg.actionLabel || 'Load Adaptive Routine'}</span>
                          </button>
                        )
                      )}

                      {msg.actionType === 'confirm_memory' && (
                        <div className="p-3 rounded-2xl bg-[#121212] border border-[#FFC107]/40 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#FFC107]">
                            <Sparkles className="w-4 h-4" />
                            <span>Candidate AI Memory Inferred</span>
                          </div>
                          <p className="text-xs text-white/70">
                            Confirming this memory will update your profile health constraints & goal preferences permanently.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`flex items-center gap-2 text-[10px] text-white/40 px-2 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && <span className="text-[#FF5722]">• FleetBot AI</span>}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-3 max-w-xl mr-auto">
            <div className="w-9 h-9 rounded-2xl bg-[#1E1E1E] border border-white/10 text-[#FF5722] flex items-center justify-center">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-4 rounded-3xl bg-[#1E1E1E] border border-white/10 text-xs text-white/70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-ping" />
              <span>FleetBot is recalculating biomechanical parameters...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 bg-[#121212] border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-white/40 shrink-0">Quick Prompts:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full bg-[#1E1E1E] hover:bg-white/10 border border-white/10 text-xs text-white/80 whitespace-nowrap transition-colors shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-[#1E1E1E] border-t border-white/10 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask FleetBot to adjust workouts, log injuries, or optimize sets..."
          disabled={isGenerating}
          className="flex-1 bg-[#121212] border border-white/10 focus:border-[#FF5722] rounded-2xl px-5 py-3.5 text-sm text-white placeholder-white/40 outline-none transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isGenerating}
          className="w-12 h-12 rounded-2xl bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-[#FF5722]/30 transition-all shrink-0 cursor-pointer"
          aria-label="Send message to FleetBot"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Payment Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Payment Receipt Details</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Service:</span>
                <span className="font-bold text-white">FleetBot AI Neural Coach</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Plan Term:</span>
                <span className="font-bold text-amber-400">1-Year Pass (₹49.00/year)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> PAID & ACTIVE
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Amount Paid:</span>
                <span className="font-mono font-bold text-white">₹49.00 INR</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Payment Gateway:</span>
                <span className="font-bold text-amber-400">Razorpay Verified</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Transaction ID:</span>
                <span className="font-mono text-zinc-300">{paymentDetails?.paymentId || 'pay_verified_49'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Activated At:</span>
                <span className="text-zinc-300">{paymentDetails?.paidAt || 'Active Session'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Valid Until:</span>
                <span className="text-emerald-400 font-medium">
                  {paymentDetails?.expiresAt ? new Date(paymentDetails.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '1 Year from Activation'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
