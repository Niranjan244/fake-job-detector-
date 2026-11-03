import { useState } from 'react';
import {
  LayoutDashboard,
  Database,
  Cpu,
  Users,
  FileText,
  Shield,
  ChevronRight,
} from 'lucide-react';
import AdminDashboardTab from './AdminDashboardTab';
import AdminDatasetsTab from './AdminDatasetsTab';
import AdminTrainingTab from './AdminTrainingTab';
import AdminUsersTab from './AdminUsersTab';
import AdminRecordsTab from './AdminRecordsTab';

const TABS = [
  { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard },
  { id: 'datasets', label: 'Datasets', icon: Database },
  { id: 'training', label: 'Model Training', icon: Cpu },
  { id: 'users', label: 'User Directory', icon: Users },
  { id: 'records', label: 'Detection Records', icon: FileText },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 mb-1.5">
            <Shield className="w-3.5 h-3.5" />
            Admin Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            System Administration
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Orchestrate machine learning datasets, model retraining, user roles, and global fraud telemetry.
          </p>
        </div>
      </div>

      {/* Main Admin Layout: Left Sidebar Navigation on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar (Desktop) / Horizontal Tabs (Mobile) */}
        <aside className="lg:col-span-3">
          {/* Desktop Navigation Menu */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-soft p-3 space-y-1.5 sticky top-24">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Admin Modules
            </div>
            {TABS.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </button>
              );
            })}
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden bg-white rounded-2xl border border-slate-200 shadow-soft p-1.5 overflow-x-auto">
            <nav className="flex space-x-1.5 min-w-max">
              {TABS.map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Tab Content Panel */}
        <main className="lg:col-span-9 min-w-0">
          {activeTab === 'dashboard' && <AdminDashboardTab />}
          {activeTab === 'datasets' && <AdminDatasetsTab />}
          {activeTab === 'training' && <AdminTrainingTab />}
          {activeTab === 'users' && <AdminUsersTab />}
          {activeTab === 'records' && <AdminRecordsTab />}
        </main>
      </div>
    </div>
  );
}
