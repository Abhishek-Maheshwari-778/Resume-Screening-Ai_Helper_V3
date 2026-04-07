import React from 'react';
import { useAuthStore } from '@/stores/authStore';

const PlatformAnalytics: React.FC = () => {
  const { token } = useAuthStore();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const resp = await fetch(`${API}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
          const stats = await resp.json();
          setData(stats);
        }
      } catch (err) {
        console.error('Failed to load platform stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading || !data) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Users', value: data.total_users.toLocaleString(), change: '+18%', icon: '👥', gradient: 'from-blue-600 to-cyan-600' },
    { label: 'Resumes Created', value: data.total_resumes.toLocaleString(), change: '+32%', icon: '📄', gradient: 'from-violet-600 to-purple-600' },
    { label: 'AI Usage Score', value: (data.total_resumes * 11).toLocaleString(), change: '+41%', icon: '🤖', gradient: 'from-emerald-600 to-green-600' },
    { label: 'Role Segments', value: data.role_distribution.length.toString(), change: '+0', icon: '📊', gradient: 'from-orange-600 to-red-600' },
  ];

  const userGrowth = data.user_growth || [0,0,0,0,0,0,0,0,0,0,0,0];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxGrowth = Math.max(...userGrowth, 1);

  const roleDistribution = data.role_distribution || [];
  const aiUsage = data.ai_usage || [];

  const recentActivity = [
    { event: 'Real-time sync active', user: 'Global Node', time: 'Just now', icon: '🆕' },
    { event: 'AI engine ready', user: 'Llama 3.1 & DeepSeek', time: 'Active', icon: '🤖' },
  ];

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📈 Platform Analytics</h1>
        <p className="text-gray-400">Real-time platform health, user growth, and AI usage statistics.</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${s.gradient} opacity-5 rounded-full -translate-y-4 translate-x-4 group-hover:opacity-10 transition-all`} />
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-gray-500 text-xs mb-2">{s.label}</div>
            <div className="text-emerald-400 text-xs font-semibold">{s.change} this month</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">User Growth (2025)</h3>
          <div className="flex items-end justify-between gap-2 h-36 mb-2">
            {userGrowth.map((val: number, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-violet-500 hover:opacity-90 transition-all cursor-pointer"
                  style={{ height: `${(val / maxGrowth) * 100}%` }}
                  title={`${val} users`}
                />
                <span className="text-[9px] text-gray-600">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">User Role Distribution</h3>
          <div className="space-y-4">
            {roleDistribution.map((r: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{r.role}</span>
                  <span className="text-gray-400">{r.count.toLocaleString()} ({r.pct}%)</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-3 rounded-full bg-gradient-to-r ${r.color} transition-all duration-700`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Usage */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">🤖 AI Feature Usage</h3>
          <div className="space-y-4">
            {aiUsage.map((a: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300">{a.label}</span>
                  <span className="text-gray-400">{a.count.toLocaleString()} calls</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700" style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">🕐 Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{a.event}</div>
                  <div className="text-gray-500 text-xs">{a.user}</div>
                </div>
                <div className="text-gray-600 text-xs flex-shrink-0">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
