import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

interface UserRow {
  id: string; name: string; email: string; role: string;
  auth_provider: string; company?: string; is_active: boolean; created_at: string;
}

interface PlatformStats {
  total_users: number; candidates: number; employers: number; admins: number; total_resumes: number;
}

const ROLES = ['candidate', 'employer', 'hr', 'enterprise', 'admin'];

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [view, setView] = useState<'users' | 'activity' | 'settings'>('users');

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/app'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResp, statsResp] = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers: authHeaders }),
        fetch(`${API}/api/admin/stats`, { headers: authHeaders }),
      ]);
      if (usersResp.ok) setUsers(await usersResp.json());
      if (statsResp.ok) setStats(await statsResp.json());
    } catch (e) { toast.error('Check backend connection'); }
    setLoading(false);
  };

  const changeRole = async (userId: string, newRole: string) => {
    try {
      const resp = await fetch(`${API}/api/admin/users/${userId}/role`, {
        method: 'PUT', headers: authHeaders,
        body: JSON.stringify({ role: newRole }),
      });
      if (!resp.ok) throw new Error('Failed');
      toast.success(`Role updated to ${newRole}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch { toast.error('Failed to update role'); }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('CRITICAL: Delete this user and all their data permanently?')) return;
    try {
      const resp = await fetch(`${API}/api/admin/users/${userId}`, { method: 'DELETE', headers: authHeaders });
      if (!resp.ok) throw new Error();
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch { toast.error('Failed to delete user'); }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = String(u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleBadgeStyles: Record<string, string> = {
    candidate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    employer: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    hr: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    enterprise: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="min-h-screen bg-[#080b12] p-4 md:p-8 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-red-500/20">
              🛡️
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Admin Portal</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Restricted Access</span>
                <span className="text-gray-500 text-xs">Platform v2.0 by Abhishek Maheshwari</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2">
              ↻ <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {[
              { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'from-blue-600 to-cyan-600' },
              { label: 'Candidates', value: stats.candidates, icon: '👤', color: 'from-blue-600 to-indigo-600' },
              { label: 'Recruiters', value: stats.employers, icon: '🏢', color: 'from-purple-600 to-pink-600' },
              { label: 'Guardians', value: stats.admins, icon: '🛡️', color: 'from-red-600 to-orange-600' },
              { label: 'Total Resumes', value: stats.total_resumes, icon: '📄', color: 'from-emerald-600 to-teal-600' },
            ].map((s, i) => (
              <div key={i} className="bg-[#111420] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all shadow-xl shadow-black/20">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} opacity-[0.03] rounded-full -mr-8 -mt-8`} />
                <div className="text-3xl mb-3 flex items-center justify-between">
                  <span>{s.icon}</span>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${s.color} animate-pulse`} />
                </div>
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1 opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1 bg-[#111420] border border-white/5 p-1 rounded-2xl w-fit mb-8 shadow-inner shadow-black/40">
          <button onClick={() => setView('users')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'users' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Users</button>
          <button onClick={() => setView('activity')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'activity' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Activity</button>
          <button onClick={() => setView('settings')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'settings' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Settings</button>
        </div>

        {/* VIEW: USERS */}
        {view === 'users' && (
          <div className="bg-[#111420] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40">
            <div className="p-8 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h2 className="text-xl font-black">User Management</h2>
                <p className="text-gray-500 text-xs font-medium">Control roles and access for {filteredUsers.length} active records</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">🔍</span>
                  <input
                    type="text" placeholder="Search identity..." value={search} onChange={e => setSearch(e.target.value)}
                    className="bg-black/20 border border-white/10 text-white placeholder-gray-600 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all w-64 shadow-inner"
                  />
                </div>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                  className="bg-black/20 border border-white/10 text-white rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 shadow-inner appearance-none cursor-pointer pr-10 relative">
                  <option value="" className="bg-[#111420]">All Classes</option>
                  {ROLES.map(r => <option key={r} value={r} className="bg-[#111420] capitalize text-white">{r}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-32 text-center">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm font-bold animate-pulse">Synchronizing Records...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/2">
                    <tr>
                      <th className="px-8 py-5">Identity Profile</th>
                      <th className="px-8 py-5">Permissions</th>
                      <th className="px-8 py-5">Corporate Origin</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center font-black shadow-inner">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-bold text-sm tracking-tight">{u.name}</div>
                              <div className="text-gray-500 text-xs font-medium">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <select
                            value={u.role}
                            onChange={e => changeRole(u.id, e.target.value)}
                            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border bg-transparent cursor-pointer hover:bg-white/5 transition-all focus:outline-none ${roleBadgeStyles[u.role]}`}
                            disabled={u.id === user?.id}
                          >
                            {ROLES.map(r => <option key={r} value={r} className="bg-[#111420] text-white">{r}</option>)}
                          </select>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-gray-400 text-sm font-medium">{u.company || 'Direct Consumer'}</span>
                          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">{u.auth_provider === 'google' ? 'Google SSO' : 'Email/Auth'}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-gray-700'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${u.is_active ? 'text-emerald-500' : 'text-gray-600'}`}>
                              {u.is_active ? 'Operational' : 'Restricted'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => deleteUser(u.id)}
                            className={`opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl active:scale-95 ${u.id === user?.id ? 'hidden' : ''}`}
                          >
                            Terminate Access
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW: ACTIVITY */}
        {view === 'activity' && (
          <div className="bg-[#111420] border border-white/5 rounded-[2rem] p-8 min-h-[400px]">
            <h2 className="text-xl font-bold mb-6">System Logs</h2>
            <div className="space-y-4">
              {[
                { time: 'Just now', user: 'System', action: 'Automated cleanup of temporary exports', color: 'text-gray-500' },
                { time: '5 mins ago', user: 'Admin', action: 'Updated recruiter access for TechCorp', color: 'text-emerald-500' },
                { time: '12 mins ago', user: 'System', action: 'New candidate registration: Sarah Jenkins', color: 'text-blue-500' },
                { time: '1 hour ago', user: 'Security', action: 'Detected multiple failed login attempts from IP 192.168.1.1', color: 'text-red-500' },
                { time: '2 hours ago', user: 'DeepSeek AI', action: 'Optimized internal ranking weights for NLP model', color: 'text-purple-500' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 p-4 hover:bg-white/2 rounded-2xl transition-colors">
                  <div className="text-gray-600 font-mono text-xs w-24 flex-shrink-0">{log.time}</div>
                  <div className={`font-black uppercase tracking-widest text-[10px] w-20 ${log.color}`}>{log.user}</div>
                  <div className="text-gray-300 text-sm font-medium">{log.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {view === 'settings' && (
          <div className="bg-[#111420] border border-white/5 rounded-[2rem] p-10">
            <h2 className="text-2xl font-bold mb-8">Platform configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Model Access (Default)</label>
                  <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                    <option>Groq Llama3-70B</option>
                    <option>DeepSeek Coder v2</option>
                    <option>GPT-4o (Reserved)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl">
                  <div>
                    <div className="text-sm font-bold">Maintenance Mode</div>
                    <div className="text-xs text-gray-500">Redirect non-admins to a landing page</div>
                  </div>
                  <div className="w-10 h-6 bg-gray-700 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" /></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-2">Internal Note</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    "Platform v2.0 focuses on Hybrid NLP and TF-IDF engines for bulk screening. Ensure MongoDB Atlas indexes are optimized for $text search before scale." - Analyst
                  </p>
                  <div className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">— Developer Portal</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
