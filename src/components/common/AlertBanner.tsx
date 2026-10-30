import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AlertBannerProps {
  type?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  message: string | React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  title,
  message,
  actionText,
  onAction,
  className = ''
}) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-300 text-amber-900',
    danger: 'bg-rose-50 border-rose-200 text-rose-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  }[type];

  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
  }[type];

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${styles} ${className}`}>
      {icons}
      <div className="flex-1">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div className="text-slate-700 leading-relaxed">{message}</div>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
