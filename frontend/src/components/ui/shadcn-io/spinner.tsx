import React from 'react';

// A lightweight spinner compatible with shadcn style usage. Exported as
// { Spinner } so it matches the import suggested by the user.
export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => {
  const s = size;
  return (
    <svg
      role="status"
      className={`animate-spin text-primary ${className}`}
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-100" />
    </svg>
  );
};

export default Spinner;
