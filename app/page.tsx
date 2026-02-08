'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Plus,
  LayoutDashboard,
  Gamepad2,
  ExternalLink,
  Settings,
  Trash2,
  LogOut,
  ChevronRight,
  Monitor,
  Calendar,
  Layers,
  Search,
  Loader2,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Scenario } from '@/types';
import clsx from 'clsx';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    fetchScenarios(user.id);
  };

  const fetchScenarios = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setScenarios(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);

    try {
      const { data, error } = await supabase.from('scenarios').insert({
        user_id: user.id,
        name: `New Event ${scenarios.length + 1}`,
        chroma_key_color: '#00FF00'
      }).select().single();

      if (error) throw error;

      // Init Game State
      await supabase.from('game_state').insert({
        scenario_id: data.id,
        current_scene: 'INTRO'
      });

      toast.success('Event created!');
      router.push(`/control/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error creating scenario');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId || !user) return;

    const { error } = await supabase.from('scenarios').delete().eq('id', deleteId);

    if (error) {
      toast.error("Failed to delete tournament");
    } else {
      toast.success("Tournament moved to archives");
      fetchScenarios(user.id);
    }
    setDeleteId(null);
  };

  const filteredScenarios = scenarios.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Waking up neural engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
      {/* SIDEBAR NAVIGATION */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col hidden lg:flex z-50">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Gamepad2 className="text-zinc-950" size={18} />
            </div>
            <span className="font-bold tracking-tighter text-lg uppercase">FightControl</span>
          </div>

          <nav className="space-y-1">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', active: true },
              { icon: Layers, label: 'Templates' },
              { icon: Monitor, label: 'Broadcasts' },
              { icon: Settings, label: 'Global Settings' },
            ].map((item, i) => (
              <button
                key={i}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  item.active ? "bg-white text-zinc-950 shadow-lg shadow-white/5" : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 pt-0">
          <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-zinc-950">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{user?.email || 'Loading...'}</p>
                <p className="text-[10px] text-zinc-500 font-medium">Free Plan</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-red-500/10 hover:text-red-500 transition-all border border-zinc-700 hover:border-red-500/20"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="lg:pl-64 min-h-screen">
        <header className="h-24 flex items-center justify-between px-8 lg:px-12">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Main Dashboard</h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">Event Management</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Create Event
            </button>
          </div>
        </header>

        <section className="px-8 lg:px-12 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-900 border border-zinc-800 rounded-3xl" />)}
            </div>
          ) : filteredScenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredScenarios.map((scen, i) => (
                  <motion.div
                    key={scen.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-zinc-900/40 border border-zinc-900 hover:border-zinc-700 rounded-[32px] p-8 transition-all hover:shadow-2xl hover:shadow-black/50 relative overflow-hidden flex flex-col justify-end min-h-[280px]"
                  >
                    {/* Event Background Image */}
                    {scen.background_url && (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={scen.background_url}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                      </div>
                    )}

                    <div className="absolute top-0 right-0 p-6 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end z-20">
                      <div
                        onClick={() => router.push(`/control/${scen.id}`)}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Settings size={18} />
                      </div>
                      <div
                        onClick={() => handleDelete(scen.id)}
                        className="w-10 h-10 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10 w-full">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                        <Calendar size={24} />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold tracking-tight mb-1 group-hover:text-white transition-colors uppercase-no drop-shadow-lg">{scen.name}</h3>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-widest drop-shadow-md">Live Uplink Active</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => router.push(`/control/${scen.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-all shadow-xl shadow-white/5 active:scale-95"
                        >
                          <Gamepad2 size={16} /> Open Control
                        </button>
                        <a
                          href={`/visor/${scen.id}`}
                          target="_blank"
                          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-black/60 transition-all active:scale-95"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </div>

                    {/* Hover Pattern */}
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full group-hover:bg-emerald-500/10 transition-all" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mb-6 text-zinc-700">
                <Trophy size={40} strokeWidth={1} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No events found</h2>
              <p className="text-zinc-500 max-w-xs mb-8">Ready to start your first tournament? Create a new scenario to get started.</p>
              <button
                onClick={handleCreate}
                className="bg-zinc-100 text-zinc-950 px-8 py-3 rounded-2xl font-bold hover:bg-white transition-all shadow-xl shadow-white/5"
              >
                Initialize First Event
              </button>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER STATS */}
      <footer className="fixed bottom-0 right-0 left-64 h-12 bg-zinc-950/80 backdrop-blur border-t border-zinc-900 flex items-center justify-between px-12 text-[10px] font-bold text-zinc-600 uppercase tracking-widest hidden lg:flex">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Database: Connected</span>
          <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Server Region: North America</span>
        </div>
        <div>
          FightControl Cloud Platform v3.0.0
        </div>
      </footer>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Tournament?"
        message="This will permanently remove the scenario and all its data. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete Permanently"
        isDestructive
      />
    </div>
  );
}
