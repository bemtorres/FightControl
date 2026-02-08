'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  Mail,
  Calendar,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AppUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in?: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        created_at: new Date(u.created_at).toLocaleDateString(),
        last_sign_in: 'Active'
      })));
    }
    setLoading(false);
  };

  const handleDeleteUser = (id: string) => {
    setDeleteId(id);
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('profiles').delete().eq('id', deleteId);

    if (error) {
      toast.error('Failed to revoke access');
    } else {
      toast.success('User access revoked');
      fetchUsers();
    }
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* HEADER */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur sticky top-0 z-10 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-800 rounded-md transition-all text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">User Management</h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Platform Administration</p>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-white text-zinc-950 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors">
          <UserPlus size={16} />
          Invite User
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">System Users</h2>
            <p className="text-sm text-zinc-500">Manage permissions and access for tournament operators.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Search by email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all font-sans"
            />
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">User / Email</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Signed In</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:border-zinc-500 transition-colors">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{user.email}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-zinc-500" />
                      <span className="text-xs font-medium text-zinc-300">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-300">{user.last_sign_in ? `Today` : 'Never'}</span>
                      <span className="text-[10px] text-zinc-500">{user.created_at}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-all"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                      <Search size={32} strokeWidth={1.5} className="mb-2 opacity-20" />
                      <p className="text-sm font-medium">No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SYSTEM STATS */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
            <Mail className="text-zinc-500 mb-4" size={24} />
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Pending Invites</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
            <Shield className="text-zinc-500 mb-4" size={24} />
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Admins Online</h3>
            <p className="text-3xl font-bold text-white">1</p>
          </div>
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
            <Calendar className="text-zinc-500 mb-4" size={24} />
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Operators</h3>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Revoke User Access?"
        message="This user will no longer be able to access the administration panel or control scenarios. This action can be reversed by a new invitation."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Revoke Access"
        isDestructive
      />
    </div>
  );
}
