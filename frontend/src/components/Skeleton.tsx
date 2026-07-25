import React from 'react';

/**
 * A single shimmering placeholder block. Compose these into loading states so
 * the layout stays put while data streams in (no spinner-then-jump).
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-[#EFE7DA] ${className}`} />
);
