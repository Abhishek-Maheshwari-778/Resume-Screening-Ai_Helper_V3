import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

type Role = 'candidate' | 'hr' | 'employer' | 'enterprise' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
  joined: string;
  resumes: number;
}

const roleColor: Record<Role, string> = {
  candidate: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  hr: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  employer: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  enterprise: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  admin: 'bg-red-500/10 border-red-500/20 text-red-400',
};

const MOCK_USERS: User[] = [
  { id: '1', name: 'Abhishek Maheshwari', email: 'abhishek@example.com', role: 'admin', status: 'active', joined: '2024-01-01', resumes: 0 },
  { id: '2', name: 'Priya Sharma', email: 'priya@example.com', role: 'candidate', status: 'active', joined: '2024-03-12', resumes: 5 },
  { id: '3', name: 'Rahul Gupta', email: 'rahul@xyz.com', role: 'hr', status: 'active', joined: '2024-02-20', resumes: 0 },
  { id: '4', name: 'Sneha Patel', email: 'sneha@abc.com', role: 'candidate', status: 'suspended', joined: '2024-04-01', resumes: 2 },
  { id: '5', name: 'Vikram Tech Corp', email: 'hr@vikram.com', role: 'enterprise', status: 'active', joined: '2024-01-15', resumes: 0 },
  { id: '6', name: 'Ananya Joshi', email: 'ananya@email.com', role: 'candidate', status: 'active', joined: '2025-01-10', resumes: 8 },
];

const UserManagement: React.FC = () => {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const resp = await fetch(`${API}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [token]);

  const filtered = users.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleStatus = async (id: string) => {
    // Backend doesn't have a direct toggle yet, but normally it would be a PATCH
    // Placeholder for real logic
  };

  const changeRole = async (id: string, role: Role) => {
    try {
      const resp = await fetch(`${API}/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role })
      });
      if (resp.ok) fetchData();
    } catch (err) {
      console.error('Failed to update role');
    }
  };

  if (isLoading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">👥 User Management</h1>
        <p className="text-gray-400">View, manage, and control all platform users and their roles.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {(['all', 'candidate', 'hr', 'employer', 'enterprise', 'admin'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${roleFilter === r ? 'bg-white/10 border-white/20 text-white' : 'bg-[#161b22] border-gray-800 text-gray-500 hover:text-gray-300'}`}
          >
            <div className="text-lg font-bold text-white">{r === 'all' ? users.length : users.filter(u => u.role === r).length}</div>
            <div className="capitalize">{r}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center text-gray-500">🔍</div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-[#161b22] border border-gray-800 rounded-xl px-10 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Joined</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Resumes</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{user.name}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={e => changeRole(user.id, e.target.value as Role)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium bg-transparent cursor-pointer ${roleColor[user.role]}`}
                    >
                      {(['candidate', 'hr', 'employer', 'enterprise', 'admin'] as Role[]).map(r => (
                        <option key={r} value={r} className="bg-[#161b22] text-white">{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${user.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {user.status === 'active' ? '● Active' : '● Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{user.joined}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm font-semibold">{user.resumes}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all
                        ${user.status === 'active'
                          ? 'border-red-800/30 bg-red-900/10 text-red-400 hover:bg-red-900/20'
                          : 'border-emerald-800/30 bg-emerald-900/10 text-emerald-400 hover:bg-emerald-900/20'
                        }`}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Restore'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-600">No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
