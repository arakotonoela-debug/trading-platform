import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: 'border-gray-500',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-4 ${colorClasses[color as keyof typeof colorClasses]} border-t-transparent rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

interface LoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  isLoading,
  children,
  fullScreen = false,
}) => {
  if (isLoading) {
    return <Spinner fullScreen={fullScreen} />;
  }

  return <>{children}</>;
};
