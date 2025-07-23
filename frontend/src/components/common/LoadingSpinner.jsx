import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
  return (
    <div className={`flex items-center justify-center ${fullPage ? 'h-screen' : 'h-40'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );
};

export default LoadingSpinner;