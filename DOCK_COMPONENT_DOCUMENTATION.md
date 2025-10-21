# Dock Component Documentation

A React component that creates a macOS-style dock interface with smooth animations and hover effects.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Dependencies](#dependencies)
- [Component Structure](#component-structure)
- [Code Implementation](#code-implementation)
- [Styling](#styling)
- [Usage Example](#usage-example)
- [Props](#props)
- [Customization](#customization)
- [Accessibility](#accessibility)

## Overview

The Dock component is a modern, animated dock interface inspired by macOS. It provides a collection of interactive items with smooth hover animations, tooltips, and magnification effects.

## Features

- ✨ Smooth hover animations using Framer Motion
- 🎯 Interactive dock items with click handlers
- 💡 Tooltip labels on hover
- 📐 Customizable sizing and magnification
- ♿ Accessibility support with proper ARIA attributes
- 🎨 Flexible styling with Tailwind CSS classes
- 📱 Responsive design

## Dependencies

```json
{
  "framer-motion": "^11.x.x",
  "react": "^18.x.x"
}
```

## Component Structure

The Dock component consists of four main sub-components:

1. **DockItem** - Individual dock items with hover states
2. **DockLabel** - Tooltip labels that appear on hover
3. **DockIcon** - Icon container for dock items
4. **Dock** - Main container component

## Code Implementation

```jsx
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
  spring = { mass: 0.1, stiffness: 100, damping: 12 },
  magnification = 50,
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
```

## Styling

The component uses CSS classes that should be defined in your stylesheets. Here's the recommended styling:

```css
/* Dock Container */
.dock-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

/* Dock Panel */
.dock-panel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Dock Item */
.dock-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dock-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.dock-item:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* Dock Tooltip */
.dock-tooltip {
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
}

.dock-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

/* Dark Theme Adjustments */
@media (prefers-color-scheme: dark) {
  .dock-panel {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .dock-item {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .dock-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}
```

## Usage Example

```jsx
import Dock from './components/Dock';
import { Home, User, Settings, Mail, Calendar } from 'lucide-react';

function App() {
  const dockItems = [
    {
      icon: <Home size={24} />,
      label: 'Home',
      onClick: () => console.log('Home clicked'),
      className: 'dock-item-home'
    },
    {
      icon: <User size={24} />,
      label: 'Profile',
      onClick: () => console.log('Profile clicked')
    },
    {
      icon: <Mail size={24} />,
      label: 'Messages',
      onClick: () => console.log('Messages clicked')
    },
    {
      icon: <Calendar size={24} />,
      label: 'Calendar',
      onClick: () => console.log('Calendar clicked')
    },
    {
      icon: <Settings size={24} />,
      label: 'Settings',
      onClick: () => console.log('Settings clicked')
    }
  ];

  return (
    <div className="app">
      {/* Your app content */}
      <Dock 
        items={dockItems}
        magnification={80}
        baseItemSize={60}
        spring={{ mass: 0.1, stiffness: 200, damping: 15 }}
      />
    </div>
  );
}
```

## Props

### Dock Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<DockItem>` | `[]` | Array of dock items to display |
| `className` | `string` | `''` | Additional CSS classes |
| `spring` | `object` | `{ mass: 0.1, stiffness: 150, damping: 12 }` | Spring animation configuration |
| `magnification` | `number` | `70` | Magnification factor for hover effect |
| `distance` | `number` | `200` | Distance threshold for magnification |
| `panelHeight` | `number` | `64` | Height of the dock panel |
| `dockHeight` | `number` | `256` | Total dock height |
| `baseItemSize` | `number` | `50` | Base size of dock items in pixels |

### DockItem Object Structure

```typescript
interface DockItem {
  icon: ReactNode;           // Icon component or element
  label: string;             // Tooltip label text
  onClick: () => void;       // Click handler function
  className?: string;        // Optional additional CSS classes
}
```

## Customization

### Animation Settings

Customize the spring animation by modifying the `spring` prop:

```jsx
<Dock 
  spring={{ 
    mass: 0.2,      // Higher = slower animation
    stiffness: 100, // Higher = snappier animation
    damping: 10     // Higher = less bouncy
  }}
/>
```

### Sizing

Adjust the size and magnification:

```jsx
<Dock 
  baseItemSize={70}        // Larger base size
  magnification={100}      // More dramatic hover effect
  distance={300}           // Larger interaction area
/>
```

### Theming

The component supports both light and dark themes through CSS custom properties:

```css
:root {
  --dock-bg: rgba(255, 255, 255, 0.1);
  --dock-border: rgba(255, 255, 255, 0.2);
  --dock-item-bg: rgba(255, 255, 255, 0.1);
  --dock-item-hover: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] {
  --dock-bg: rgba(0, 0, 0, 0.3);
  --dock-border: rgba(255, 255, 255, 0.1);
  --dock-item-bg: rgba(255, 255, 255, 0.05);
  --dock-item-hover: rgba(255, 255, 255, 0.1);
}
```

## Accessibility

The component includes several accessibility features:

- **Keyboard Navigation**: Items are focusable with `tabIndex={0}`
- **ARIA Attributes**: Proper `role` and `aria-haspopup` attributes
- **Screen Reader Support**: Tooltip content is accessible
- **Focus Management**: Visual focus indicators for keyboard users

### Keyboard Shortcuts

- `Tab` - Navigate between dock items
- `Enter` or `Space` - Activate focused item
- `Escape` - Remove focus from dock

## Browser Support

- Chrome 88+
- Firefox 87+
- Safari 14+
- Edge 88+

## Performance Considerations

- Uses `useMotionValue` for efficient animations
- Memoized calculations with `useMemo`
- Proper cleanup of event listeners
- Optimized re-renders with React patterns

## Troubleshooting

### Common Issues

1. **Icons not displaying**: Ensure icon components are properly imported
2. **Tooltips not showing**: Check CSS z-index values
3. **Animations stuttering**: Reduce spring stiffness or increase damping
4. **Click handlers not working**: Verify onClick functions are properly defined

### Debug Mode

Add this to enable debug information:

```jsx
<Dock 
  items={items}
  debug={true}  // Logs hover states and interactions
/>
```

## License

This component is part of the MERN Project and follows the project's licensing terms.

---

*Last updated: October 22, 2025*
