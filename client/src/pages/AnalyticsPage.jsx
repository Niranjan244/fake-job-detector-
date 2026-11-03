import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Layers,
  Sparkles,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import {
  Card,
  StatCard,
  Alert,
  EmptyState,
  Skeleton,
} from '../components/ui';

const PIE_COLORS = {
  Genuine: '#10b981',
  Fraudulent: '#ef4444',
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await api.get('/analysis?limit=100');
        setRecords(response.data.data || []);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || 'Failed to fetch personal analytics data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
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

  if (errorMessage) {
    return (
      <div className="max-w-6xl mx-auto">
        <Alert variant="error" title="Analytics Error">
          {errorMessage}
        </Alert>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <EmptyState
          icon={BarChart3}
          title="No analyses yet"
          description="Your personal detection analytics and fraud risk trends will appear here once you analyze job postings or upload batch CSV files."
          actionLabel="Analyze First Job"
          onAction={() => (window.location.href = '/analyze')}
        />
      </div>
    );
  }

  // Aggregate user statistics
  const total = records.length;
  const genuineCount = records.filter((r) => r.result?.label === 'genuine').length;
  const fraudulentCount = records.filter((r) => r.result?.label === 'fraudulent').length;
  const avgProbability = Math.round(
    (records.reduce((acc, r) => acc + (r.fraudProbability || 0), 0) / total) * 100
  );

  const pieData = [
    { name: 'Genuine', value: genuineCount },
    { name: 'Fraudulent', value: fraudulentCount },
  ];

  // Analyses Timeline (grouped by date)
  const timelineMap = {};
  records.forEach((r) => {
    const dateKey = new Date(r.createdAt).toISOString().split('T')[0];
    if (!timelineMap[dateKey]) {
      timelineMap[dateKey] = { date: dateKey, total: 0, genuine: 0, fraudulent: 0 };
    }
    timelineMap[dateKey].total += 1;
    if (r.result?.label === 'fraudulent') {
      timelineMap[dateKey].fraudulent += 1;
    } else {
      timelineMap[dateKey].genuine += 1;
    }
  });

  const timelineData = Object.values(timelineMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Top Indicator Frequencies
  const indicatorMap = {};
  records.forEach((r) => {
    (r.indicators || []).forEach((ind) => {
      indicatorMap[ind.type] = (indicatorMap[ind.type] || 0) + 1;
    });
  });

  const indicatorData = Object.entries(indicatorMap)
    .map(([type, count]) => ({
      name: type.replace(/_/g, ' '),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
          <Activity className="w-3.5 h-3.5" />
          Personal Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          My Detection Analytics
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-600">
          Personal trend tracking, classification split, and high-risk indicators encountered across your analyzed postings.
        </p>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Analyzed"
          value={total}
          icon={Layers}
        />
        <StatCard
          title="Genuine Postings"
          value={genuineCount}
          icon={ShieldCheck}
          trend={{ value: `${Math.round((genuineCount / total) * 100)}% verified`, positive: true }}
        />
        <StatCard
          title="Fraudulent Flagged"
          value={fraudulentCount}
          icon={ShieldAlert}
          trend={{ value: `${Math.round((fraudulentCount / total) * 100)}% dangerous`, positive: false }}
        />
        <StatCard
          title="Avg Risk Score"
          value={`${avgProbability}%`}
          icon={Percent}
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classification Distribution */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Classification Split
              </h2>
              <p className="text-xs text-slate-500">
                Genuine vs fraudulent distribution
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
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
                            {data.value} listings ({Math.round((data.value / total) * 100)}%)
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
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Analyses Over Time */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Analyses Timeline
              </h2>
              <p className="text-xs text-slate-500">
                Daily evaluation volume by verdict
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
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
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="fraudulent"
                  name="Fraudulent"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#ef4444' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Indicators Encountered */}
      {indicatorData.length > 0 && (
        <Card>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                High-Frequency Fraud Signatures
              </h2>
              <p className="text-xs text-slate-500">
                Most common warning signs identified across your evaluations
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
                          <p className="text-slate-300">Flagged {data.value} times</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Times Flagged"
                  fill="#6366f1"
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
