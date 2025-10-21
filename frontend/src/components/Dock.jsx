'use client';

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize }) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        isHovered.set(1);
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        isHovered.set(0);
        setShowTooltip(false);
      }}
      onFocus={() => {
        isHovered.set(1);
        setShowTooltip(true);
      }}
      onBlur={() => {
        isHovered.set(0);
        setShowTooltip(false);
      }}
      onClick={onClick}
      className={`dock-item ${className}`}
      style={{ 
        width: baseItemSize + 'px', 
        height: baseItemSize + 'px' 
      }}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, child => 
        cloneElement(child, { isHovered, showTooltip })
      )}
    </div>
  );
}

function DockLabel({ children, className = '', showTooltip = false, ...rest }) {
  return (
    <>
      {showTooltip && (
        <div className={`dock-tooltip ${className}`} role="tooltip">
          {children}
        </div>
      )}
    </>
  );
}

function DockIcon({ children, className = '' }) {
  return <div className={`flex items-center justify-center text-notion-text ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );

  return (
    <div className="dock-container">
      <div className="dock-panel">
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className || ''}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </div>
    </div>
  );
}
