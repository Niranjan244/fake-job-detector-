import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({
  children,
  variant = 'error',
  title,
  className = '',
}) {
  const configs = {
    error: {
      bg: 'bg-red-50/90 border-red-200 text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      bg: 'bg-amber-50/90 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    success: {
      bg: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
    },
    info: {
      bg: 'bg-indigo-50/90 border-indigo-200 text-indigo-900',
      icon: Info,
      iconColor: 'text-indigo-500',
    },
  };

  const current = configs[variant] || configs.error;
  const Icon = current.icon;

  return (
    <div
      className={`p-4 rounded-xl border text-sm flex gap-3 items-start ${current.bg} ${className}`}
      role="alert"
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="space-y-0.5 flex-1">
        {title && <h5 className="font-semibold text-xs tracking-tight">{title}</h5>}
        <div className="text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
