import React, { useState } from 'react';
import Silk from './Silk';

const AnimatedCard = ({ 
  children, 
  className = '',
  hoverEffect = true,
  silkVariant = 'subtle',
  glassmorphism = true,
  padding = 'p-6',
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const silkVariants = {
    subtle: {
      color: '#4338ca',
      speed: 1.05,
      scale: 0.3,
      noiseIntensity: 0.5
    },
    accent: {
      color: '#7c3aed',
      speed: 2,
      scale: 0.5,
      noiseIntensity: 0.8
    },
    warm: {
      color: '#dc2626',
      speed: 1.8,
      scale: 0.4,
      noiseIntensity: 0.6
    },
    cool: {
      color: '#0891b2',
      speed: 1.6,
      scale: 0.35,
      noiseIntensity: 0.55
    }
  };

  const silkConfig = silkVariants[silkVariant];

  return (
    <div 
      className={`
        relative group overflow-hidden
        ${glassmorphism ? 'backdrop-blur-sm bg-white/5' : 'bg-notion-surface'}
        border border-white/10 rounded-lg
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:shadow-2xl hover:border-white/20' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Silk Animation Background */}
      <div className={`
        absolute inset-0 opacity-0 transition-opacity duration-500
        ${isHovered ? 'opacity-30' : 'opacity-10'}
      `}>
        <Silk {...silkConfig} />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), transparent)'
      }} />
      
      {/* Content Container with Padding */}
      <div className={`relative z-10 ${padding}`}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedCard;
