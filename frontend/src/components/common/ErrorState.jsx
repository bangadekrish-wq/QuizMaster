import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Failed to Load Data',
  description,
  message,
  onRetry,
}) => {
  const contentText =
    description ||
    message ||
    'An error occurred while connecting to the server. Please check your connection or backend API endpoint.';

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-brand-red/5 border border-brand-red/20 rounded-ms-lg my-4">
      <div className="p-4 rounded-full bg-brand-red/10 text-brand-red mb-3">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-100">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
        {contentText}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
