import React from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 flex items-center justify-between ${colors[type]}`}>
      <div className="flex items-center gap-2">
        {icons[type]}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;