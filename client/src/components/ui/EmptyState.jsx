import React from 'react';
import Card from './Card';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <Card
      padding="lg"
      className={`text-center flex flex-col items-center justify-center space-y-4 py-12 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 shadow-2xs">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="max-w-md space-y-1">
        <h4 className="text-base font-bold text-slate-900 font-heading">
          {title}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </Card>
  );
}
