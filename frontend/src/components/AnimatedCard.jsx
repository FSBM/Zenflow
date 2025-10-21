import React from 'react';

const AnimatedCard = ({ 
  children, 
  className = '',
  hoverEffect = true,
  padding = 'p-6',
  ...props 
}) => {
  return (
    <div 
      className={`
        minimal-card
        ${hoverEffect ? 'hover:shadow-lg' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
