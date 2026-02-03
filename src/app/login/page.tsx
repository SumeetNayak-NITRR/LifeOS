"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup, login, loginAsGuest } from '@/lib/auth';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      const result = await signup(email, password);
      if (result.success) {
        router.push('/?welcome=true');
      } else {
        setError(result.error || 'Signup failed.');
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Login failed.');
      }
    }
    setLoading(false);
  };

  const handleGuestMode = () => {
    loginAsGuest();
    router.push('/?guest=true');
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex flex-col md:flex-row">
      {/* Visual Side Panel */}
      <div className="hidden md:flex md:w-[60%] lg:w-[65%] relative overflow-hidden bg-[#0a0a0a] border-r border-white/5 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-5xl text-white mb-6 leading-tight">
              From Chaos to <span className="text-white/40 italic">Consistency</span>.
            </h2>
            <p className="text-xl text-white/40 mb-12 font-light leading-relaxed">
              Initialize your personal architecture. Track performance, master skills, and design your reality with the premier student operating system.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <span className="text-sm font-bold">01</span>
                </div>
                <h4 className="text-white font-medium">Daily Velocity</h4>
                <p className="text-white/30 text-sm">Real-time performance analytics for your studies and habits.</p>
              </div>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <span className="text-sm font-bold">02</span>
                </div>
                  <h4 className="text-white font-medium">Neural Timeline</h4>
                <p className="text-white/30 text-sm">Organize your knowledge and track skill progression.</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Floating Mockup Element */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[80%] aspect-video bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden opacity-40 rotate-[-5deg]">
          <div className="w-full h-8 border-b border-white/5 flex items-center px-4 gap-2">
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
          </div>
          <div className="p-8 space-y-6">
            <div className="h-4 w-1/3 bg-white/5 rounded" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
              <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
              <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Auth Panel */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 md:text-left">
            <h1 className="font-display text-3xl text-white mb-2">LifeOS</h1>
            <p className="text-white/40 text-sm">System Access</p>
          </div>

          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'login' 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'signup' 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-colors pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="Re-enter password"
                  />
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-3 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5">
              <button
                onClick={handleGuestMode}
                className="w-full bg-white/5 text-white/60 py-3 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
              >
                Continue as Guest
              </button>
              <p className="text-white/20 text-xs text-center mt-3">
                Guest data is temporary and will not persist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
