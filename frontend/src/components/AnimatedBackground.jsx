import React from 'react';
import Silk from './Silk';

const AnimatedBackground = ({ 
  children, 
  variant = 'default',
  className = '',
  overlayOpacity = 0.95
}) => {
  const variants = {
    default: {
      color: '#1a1a1a',
      speed: 3,
      scale: 0.8,
      noiseIntensity: 1.2
    },
    accent: {
      color: '#4338ca',
      speed: 4,
      scale: 1.2,
      noiseIntensity: 1.5
    },
    subtle: {
      color: '#6b7280',
      speed: 2,
      scale: 0.6,
      noiseIntensity: 0.8
    },
    warm: {
      color: '#dc2626',
      speed: 3.5,
      scale: 1,
      noiseIntensity: 1.3
    },
    cool: {
      color: '#0891b2',
      speed: 2.5,
      scale: 0.9,
      noiseIntensity: 1.1
    }
  };

  const config = variants[variant];

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Silk Animation Background */}
      <div className="absolute inset-0 w-full h-full">
        <Silk {...config} />
      </div>
      
      {/* Content Overlay */}
      <div 
        className="relative z-10 w-full h-full"
        style={{
          backgroundColor: `rgba(15, 23, 42, ${overlayOpacity})`
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
