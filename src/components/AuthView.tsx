import React, { useState } from 'react';
import { api, UserSummary } from '../lib/api';
import { UserProfile } from '../domain/models';
import { Shield, User, Key, Mail, Lock, UserCheck, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (user: UserSummary, profile?: UserProfile) => void;
}

type Mode = 'member_signin' | 'member_signup' | 'admin_signin';

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<Mode>('member_signin');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleModeChange = (newMode: Mode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'member_signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'member_signup') {
        const res = await api.signUp({ name, email, password, confirmPassword });
        onAuthSuccess(res.user, res.profile);
      } else if (mode === 'member_signin') {
        const res = await api.signInUser({ email, password });
        onAuthSuccess(res.user, res.profile);
      } else if (mode === 'admin_signin') {
        const res = await api.signInAdmin({ email, password });
        onAuthSuccess(res.user, res.profile);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#FF5722]/20 via-[#FFC107]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E1E1E] border border-white/10 shadow-xl mb-2 text-[#FF5722]">
            {mode === 'admin_signin' ? <Shield className="w-7 h-7 text-amber-400" /> : <Sparkles className="w-7 h-7 text-[#FF5722]" />}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">FleetBuild</h1>
          <p className="text-xs text-white/60">
            {mode === 'admin_signin'
              ? 'Administrator Access Portal'
              : mode === 'member_signup'
              ? 'Start Your Personal Fitness Journey'
              : 'Sign in to access your personal space'}
          </p>
        </div>

        {/* Portal Mode Switcher Tabs */}
        <div className="bg-[#1E1E1E] p-1.5 rounded-2xl border border-white/10 flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleModeChange('member_signin')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'member_signin' ? 'bg-[#FF5722] text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('member_signup')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'member_signup' ? 'bg-[#FF5722] text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('admin_signin')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'admin_signin'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Auth Form Card */}
        <div className="bg-[#1E1E1E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'member_signup' && (
              <div className="space-y-1.5">
                <label htmlFor="auth-name" className="text-xs font-bold text-white/80 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-[#121212] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5722] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="text-xs font-bold text-white/80 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'admin_signin' ? 'admin@fleetbuild.ai' : 'you@example.com'}
                  className="w-full bg-[#121212] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5722] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="text-xs font-bold text-white/80 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121212] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5722] transition-colors"
                />
              </div>
              {mode === 'member_signup' && (
                <p className="text-[11px] text-white/40">Must be at least 8 characters long.</p>
              )}
            </div>

            {mode === 'member_signup' && (
              <div className="space-y-1.5">
                <label htmlFor="auth-confirm-password" className="text-xs font-bold text-white/80 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#121212] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5722] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl mt-2 ${
                mode === 'admin_signin'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                  : 'bg-[#FF5722] hover:bg-[#E64A19] text-white shadow-[#FF5722]/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'member_signup'
                      ? 'Create Member Account'
                      : mode === 'admin_signin'
                      ? 'Sign In as Administrator'
                      : 'Sign In'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Subtext info */}
          <div className="pt-2 text-center text-xs text-white/50 border-t border-white/10">
            {mode === 'admin_signin' ? (
              <p className="text-[11px] text-amber-400/80">
                Admin accounts are role-restricted and isolated from member profiles.
              </p>
            ) : (
              <p>Your fitness data is strictly isolated to your authenticated account.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
