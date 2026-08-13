import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-dark-card border border-dark-border/40 rounded-ms animate-pulse ${className}`}
        />
      ))}
    </>
  );
};
