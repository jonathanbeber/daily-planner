import React from 'react';

// Monoline studying dog: round glasses, open book, desk. Inherits currentColor
// so it follows the surrounding text colour; the bookmark is the one accent.
export default function StudyingDog({ className, size = 40 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* head */}
      <path d="M20 22c0-7 5.4-12 12-12s12 5 12 12-5.4 11-12 11-12-4-12-11z" />
      {/* ears */}
      <path d="M22 14c-5.5 1.5-8.5 8-7 16 .5 3 3.2 4 4.8 1.4" /><path d="M42 14c5.5 1.5 8.5 8 7 16-.5 3-3.2 4-4.8 1.4" />
      {/* glasses */}
      <circle cx="27" cy="22" r="3.6" /><circle cx="37" cy="22" r="3.6" /><path d="M30.6 22h2.8" />
      {/* eyes */}
      <circle cx="27.3" cy="22.3" r="1.1" fill="currentColor" stroke="none" /><circle cx="37.3" cy="22.3" r="1.1" fill="currentColor" stroke="none" />
      {/* nose */}
      <path d="M30.4 27.6a1.6 1.3 0 1 0 3.2 0 1.6 1.3 0 1 0-3.2 0z" fill="currentColor" stroke="none" /><path d="M32 29v1.4M30.2 31.4c.9.8 2.7.8 3.6 0" />
      {/* shoulders */}
      <path d="M23 33.5c-3.5 1.5-5.5 4.5-6 10M41 33.5c3.5 1.5 5.5 4.5 6 10" />
      {/* book */}
      <path d="M19 48l3-8c4-1 7.2.4 10 3 2.8-2.6 6-4 10-3l3 8" /><path d="M32 43v5" /><path d="M23 41c3.3-.5 6.3.6 9 2.8M41 41c-3.3-.5-6.3.6-9 2.8" />
      {/* bookmark */}
      <path d="M37 40l1.5 6.5" stroke="#8b1e2d" />
      {/* paws */}
      <path d="M18.5 45.5h5.5a1.8 1.8 0 0 1 0 3.6h-5.5M45.5 45.5h-5.5a1.8 1.8 0 0 0 0 3.6h5.5" />
      {/* desk */}
      <path d="M7 49h50M12 49v10M52 49v10" />
    </svg>
  );
}
