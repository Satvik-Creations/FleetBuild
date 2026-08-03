import React, { useEffect, useState } from 'react';
import { api, UserSummary } from '../lib/api';
import { Shield, Users, UserCheck, ShieldAlert, RefreshCw, CheckCircle2, Clock, Search, Loader2 } from 'lucide-react';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const totalMembers = users.filter((u) => u.role === 'member').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const onboardingCompletedCount = users.filter((u) => u.role === 'member' && u.onboardingCompleted).length;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/15 via-[#FFC107]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System User Directory</h1>
          <p className="text-xs sm:text-sm text-white/60">
            System administration & role isolation management for FleetBuild accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-5 py-3 rounded-2xl bg-[#121212] hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xs text-white/50">Total Registered</p>
          <p className="text-xl font-bold text-white">{totalUsers}</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-xs text-white/50">Active Members</p>
          <p className="text-xl font-bold text-white">{totalMembers}</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs text-white/50">Completed Onboarding</p>
          <p className="text-xl font-bold text-emerald-400">{onboardingCompletedCount}</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <p className="text-xs text-white/50">System Administrators</p>
          <p className="text-xl font-bold text-amber-400">{totalAdmins}</p>
        </div>
      </div>

      {/* User Search & Table Card */}
      <div className="rounded-3xl bg-[#1E1E1E] p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Accounts Directory ({filteredUsers.length})</span>
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-[#121212] border border-white/10 rounded-2xl py-2 pl-9 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-white/50">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <p className="text-xs">Loading user registry...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-white/50 text-xs bg-[#121212] rounded-2xl border border-white/5">
            No accounts match your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider">
                  <th className="pb-3 px-3">User Name</th>
                  <th className="pb-3 px-3">Email Address</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Onboarding</th>
                  <th className="pb-3 px-3">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-white/70">{u.email}</td>
                    <td className="py-3.5 px-3">
                      {u.role === 'admin' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/40">
                          ADMIN
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px] border border-blue-500/40">
                          MEMBER
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {u.onboardingCompleted ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="text-amber-400/80 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-white/40 font-mono text-[11px]">{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
