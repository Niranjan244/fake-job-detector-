import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  PieChart as PieIcon,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { Card, StatCard, Alert, Skeleton } from '../../components/ui';

const PIE_COLORS = {
  Genuine: '#10b981',
  Fraudulent: '#ef4444',
};

export default function AdminDashboardTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load administrative statistics.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Statistics Error">
        {error}
      </Alert>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: 'Genuine', value: stats.genuineCount || 0 },
    { name: 'Fraudulent', value: stats.fraudulentCount || 0 },
  ];

  const indicatorData = (stats.topIndicators || []).map((item) => ({
    name: item._id.replace(/_/g, ' '),
    count: item.count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Registered Users"
          value={stats.totalUsers}
          icon={Users}
        />
        <StatCard
          title="Total Analyses"
          value={stats.totalAnalyses}
          icon={Layers}
        />
        <StatCard
          title="Genuine Detected"
          value={stats.genuineCount}
          icon={ShieldCheck}
          trend={{
            value: `${Math.round(((stats.genuineCount || 0) / (stats.totalAnalyses || 1)) * 100)}% verified`,
            positive: true,
          }}
        />
        <StatCard
          title="Fraudulent Detected"
          value={stats.fraudulentCount}
          icon={ShieldAlert}
          trend={{
            value: `${Math.round(((stats.fraudulentCount || 0) / (stats.totalAnalyses || 1)) * 100)}% dangerous`,
            positive: false,
          }}
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Detection Trend */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Detection Trend (Last 30 Days)
              </h3>
              <p className="text-xs text-slate-500">
                System volume categorized by classification verdict
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            {stats.analysesPerDay && stats.analysesPerDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.analysesPerDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg space-y-1">
                            <p className="font-semibold text-slate-200">{label}</p>
                            {payload.map((p) => (
                              <div key={p.name} className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: p.stroke }}
                                />
                                <span className="text-slate-300">{p.name}: {p.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="genuine"
                    name="Genuine"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fraudulent"
                    name="Fraudulent"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No analyses logged in the last 30 days.
              </div>
            )}
          </div>
        </Card>

        {/* Classification Breakdown */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Classification Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Global proportion of genuine vs fraudulent listings
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            {stats.totalAnalyses > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={PIE_COLORS[entry.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-slate-300">
                              {data.value} listings ({Math.round((data.value / stats.totalAnalyses) * 100)}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No detection records in system.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Flagged Risk Indicators System-Wide */}
      {indicatorData.length > 0 && (
        <Card>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Top Flagged Risk Indicators System-Wide
              </h3>
              <p className="text-xs text-slate-500">
                High-frequency triggers flagged by the NLP engine
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={160}
                  tick={{ fontSize: 11, fill: '#334155' }}
                  stroke="#cbd5e1"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
                          <p className="font-semibold">{data.payload.name}</p>
                          <p className="text-slate-300">Flagged {data.value} times globally</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Total Triggered"
                  fill="#4f46e5"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
