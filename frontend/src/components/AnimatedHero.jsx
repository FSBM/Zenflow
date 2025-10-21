import React from 'react';
import Silk from './Silk';

const AnimatedHero = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  silkColor = '#4338ca'
}) => {
  return (
    <div className={`relative w-full min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Primary Silk Background */}
      <div className="absolute inset-0">
        <Silk 
          color={silkColor}
          speed={3}
          scale={1.2}
          noiseIntensity={1.5}
          rotation={0.1}
        />
      </div>
      
      {/* Secondary Silk Layer */}
      <div className="absolute inset-0 opacity-30">
        <Silk 
          color="#7c3aed"
          speed={2}
          scale={0.8}
          noiseIntensity={1}
          rotation={-0.05}
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col justify-center gap-3">
        {title && (
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xl md:text-2xl text-gray-200 mb-8 animate-fade-in-delay">
            {subtitle}
          </p>
        )}
        <div className="animate-fade-in-delay-2 min-w-full mt-4">
          {children}
        </div>
      </div>
      
    </div>
  );
};

export default AnimatedHero;
