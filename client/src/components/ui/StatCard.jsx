import React from 'react';
import Card from './Card';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'indigo',
  className = '',
}) {
  const iconThemes = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const textThemes = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
    slate: 'text-slate-900',
  };

  return (
    <Card padding="sm" className={`flex flex-col justify-between p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`p-2 rounded-xl border ${
              iconThemes[variant] || iconThemes.indigo
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <p
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            textThemes[variant] || textThemes.slate
          }`}
        >
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 font-normal">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
