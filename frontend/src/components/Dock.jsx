'use client';

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize }) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);
  const [showTooltip, setShowTooltip] = useState(false);

  // Removed the magnification effect that was affecting nearby items

  return (
    <motion.div
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", ...spring }}
    >
      {Children.map(children, child => 
        cloneElement(child, { isHovered, showTooltip })
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = '', showTooltip = false, ...rest }) {
  return (
    <AnimatePresence>
      {showTooltip && (
        <motion.div 
          className={`dock-tooltip ${className}`} 
          role="tooltip"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }) {
  return <div className={`flex items-center justify-center text-notion-text ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 50,
  distance = 150,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 40
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );

  return (
    <div className="dock-container">
      <motion.div 
        className="dock-panel"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
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
      </motion.div>
    </div>
  );
}
