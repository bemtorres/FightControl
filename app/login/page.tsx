'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Trophy,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'RECOVERY'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back, fighter!');
        router.push('/');
        router.refresh();
      } else if (authMode === 'SIGNUP') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Check your email to confirm registration!');
        router.push('/');
        router.refresh();
      } else if (authMode === 'RECOVERY') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login?mode=reset`,
        });
        if (error) throw error;
        toast.success('Recovery link sent! Check your email.');
        setAuthMode('LOGIN');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const [newPassword, setNewPassword] = useState('');
  const mode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') : null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'reset') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8 font-sans">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Reset Password</h2>
            <p className="text-zinc-500 text-sm">Enter your new combat credentials.</p>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full bg-white text-zinc-950 rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex overflow-hidden font-sans selection:bg-red-500/30">
      {/* LEFT SIDE: GAME SHOWCASE */}
      <div className="hidden lg:flex w-3/5 relative bg-zinc-950 items-center justify-center p-20 overflow-hidden border-r border-white/5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(220,38,38,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(37,99,235,0.15),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

          {/* Moving decorative lines */}
          <motion.div
            animate={{ x: [-1000, 1000] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
          />
          <motion.div
            animate={{ x: [1000, -1000] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
          />
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.3)] rotate-3">
                <Gamepad2 className="text-white" size={40} />
              </div>
              <div>
                <h1 className="text-7xl font-black tracking-tighter text-white leading-none italic uppercase">
                  Fight<span className="text-red-500">Control</span>
                </h1>
                <p className="text-emerald-500 font-mono text-xs font-bold uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Neural Combat Engine v3.0
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-zinc-100 max-w-md leading-tight">
                Streamline your <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Production Workflow</span> with Realtime Overlays
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, title: "ULTRA LOW LATENCY", value: "Sub-50ms Sync", color: "text-blue-400" },
                  { icon: Trophy, title: "MAJOR READY", value: "Tournament Stable", color: "text-yellow-400" },
                  { icon: ShieldCheck, title: "HYPER SECURE", value: "Encrypted Uplinks", color: "text-emerald-400" },
                  { icon: Gamepad2, title: "MULTI-SCENE", value: "6+ Live Modules", color: "text-purple-400" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                    <stat.icon className={clsx("mb-2 transition-transform group-hover:scale-110", stat.color)} size={24} />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.title}</p>
                    <p className="text-sm font-black text-white italic">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live Feed */}
            <div className="p-1.5 bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-black/40 rounded-xl p-6 relative">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Live Activity</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { user: "ProStreamer_X", action: "initiated Versus Scene", time: "2s ago", icon: "🔥" },
                    { user: "Tournament_Host", action: "locked Player 1: Kenshiro", time: "15s ago", icon: "⚔️" },
                    { user: "Caster_Prime", action: "switched to Combat Module", time: "1m ago", icon: "🎮" }
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs font-mono border-l-2 border-red-600/30 pl-4 py-1">
                      <span className="text-zinc-600">[{log.time}]</span>
                      <span className="text-zinc-300"><span className="text-red-400 font-bold">{log.user}</span> {log.action}</span>
                      <span className="ml-auto">{log.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Backdrop Visual */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-red-600/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full" />
        </div>
      </div>

      {/* RIGHT SIDE: AUTH FORM */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-20 relative bg-zinc-950">
        <div className="w-full max-w-sm relative z-10">
          <div className="mb-12">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Gamepad2 className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Fight<span className="text-red-500">Control</span></h1>
            </div>

            <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase italic">
              {authMode === 'LOGIN' ? 'MISSION BRIEFING' : authMode === 'SIGNUP' ? 'ENLIST NOW' : 'ACCESS RESET'}
            </h2>
            <p className="text-zinc-500 text-sm font-medium">
              {authMode === 'LOGIN'
                ? 'Authorized personnel only. Enter your encrypted credentials.'
                : authMode === 'SIGNUP'
                  ? 'Join the elite network of competitive broadcast professionals.'
                  : 'Specify the target civilian identity for credential restoration.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Uplink Identity (Email)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-zinc-700 italic"
                  placeholder="COMMANDER@BASE.COM"
                />
              </div>
            </div>

            {authMode !== 'RECOVERY' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cipher (Password)</label>
                  {authMode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('RECOVERY')}
                      className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest underline decoration-2 underline-offset-4"
                    >
                      FORGOT?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-zinc-700 font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-red-600 text-white rounded-2xl py-4 font-black uppercase italic tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_40px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  {authMode === 'LOGIN' ? 'INITIALIZE SYSTEM' : authMode === 'SIGNUP' ? 'CONFIRM ENLISTMENT' : 'INITIATE RECOVERY'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
              {authMode === 'LOGIN' ? "New operative?" : "Already verified?"}{' '}
              <button
                onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                className="text-red-500 font-black hover:text-red-400 decoration-2 underline-offset-8 transition-colors"
              >
                {authMode === 'LOGIN' ? 'ENLIST NOW' : 'ACCESS UPLINK'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-4">
          <div className="flex gap-4 opacity-30">
            <div className="w-12 h-1 bg-red-600 rounded-full" />
            <div className="w-12 h-1 bg-zinc-800 rounded-full" />
            <div className="w-12 h-1 bg-zinc-800 rounded-full" />
          </div>
          <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] px-4 text-center">
            FIGHTCONTROL SECURE NODE — 2026 DEEP PRODUCTION
          </p>
        </div>
      </div>
    </div>
  );
}
