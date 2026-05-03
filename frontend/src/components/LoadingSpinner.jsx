import React from "react";

const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
    full: "w-16 h-16 border-4",
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`${currentSize} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
