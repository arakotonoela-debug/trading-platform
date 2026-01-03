import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>

          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}

          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' && <ArrowUp size={16} />}
              {trend === 'down' && <ArrowDown size={16} />}
              {trendValue}
            </div>
          )}
        </div>

        {icon && (
          <div className="text-blue-600 opacity-20">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
