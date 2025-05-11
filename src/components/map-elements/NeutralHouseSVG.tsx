import React from 'react';

export interface NeutralHouseSVGProps {
  variation: 1 | 2 | 3;
  selected?: boolean;
  isSource?: boolean;
  isTarget?: boolean;
}

/**
 * Visual SVG component for neutral houses with variations
 */
const NeutralHouseSVG: React.FC<NeutralHouseSVGProps> = ({ 
  variation = 1, 
  selected = false,
  isSource = false,
  isTarget = false 
}) => {
  const getHousePath = () => {
    switch (variation) {
      case 1:
        return `
          M 20,80 
          L 20,40 
          L 50,20 
          L 80,40 
          L 80,80 
          L 20,80 
          Z
          M 35,80 
          L 35,50 
          L 45,50 
          L 45,80 
          Z
          M 55,80 
          L 55,50 
          L 65,50 
          L 65,80 
          Z
        `;
      case 2:
        return `
          M 25,80 
          L 25,35 
          L 50,15 
          L 75,35 
          L 75,80 
          L 25,80 
          Z
          M 40,80 
          L 40,45 
          L 60,45 
          L 60,80 
          Z
          M 45,45 
          L 45,35 
          L 55,35 
          L 55,45 
          Z
        `;
      case 3:
        return `
          M 30,80 
          L 30,30 
          L 50,10 
          L 70,30 
          L 70,80 
          L 30,80 
          Z
          M 35,80 
          L 35,40 
          L 45,40 
          L 45,80 
          Z
          M 55,80 
          L 55,40 
          L 65,40 
          L 65,80 
          Z
          M 45,40 
          L 45,30 
          L 55,30 
          L 55,40 
          Z
        `;
    }
  };

  // Function to get chimney path based on variation
  const getChimneyPath = () => {
    switch (variation) {
      case 1:
        return "M 70,38 L 70,25 L 75,25 L 75,40 Z";
      case 2:
        return "M 65,33 L 65,20 L 70,20 L 70,35 Z";
      case 3:
        return "M 63,28 L 63,15 L 67,15 L 67,30 Z";
      default:
        return "";
    }
  };

  // Get decorative elements based on variation
  const getDecorativeElements = () => {
    switch (variation) {
      case 1:
        return (
          <>
            {/* Flower boxes under windows */}
            <rect x="33" y="60" width="14" height="3" fill="#84CC16" stroke="var(--mastil-neutral-dark)" strokeWidth="0.5" />
            <rect x="53" y="60" width="14" height="3" fill="#84CC16" stroke="var(--mastil-neutral-dark)" strokeWidth="0.5" />
            
            {/* Chimney smoke */}
            <path d="M 73,25 C 76,20 74,15 70,12 C 72,10 74,8 73,5" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="1,2" />
          </>
        );
      case 2:
        return (
          <>
            {/* Small flag on roof */}
            <path d="M 50,15 L 50,5 L 57,8 L 50,11 Z" fill="#EF4444" />
            <line x1="50" y1="5" x2="50" y2="15" stroke="var(--mastil-neutral-dark)" strokeWidth="0.7" />
            
            {/* Small fence */}
            <path d="M 15,80 L 15,70 L 20,70 L 25,70 L 25,80" stroke="var(--mastil-neutral-dark)" strokeWidth="1" fill="none" />
            <line x1="15" y1="75" x2="25" y2="75" stroke="var(--mastil-neutral-dark)" strokeWidth="1" />
          </>
        );
      case 3:
        return (
          <>
            {/* Well next to house */}
            <circle cx="20" cy="70" r="5" fill="var(--mastil-neutral-light)" stroke="var(--mastil-neutral-dark)" strokeWidth="1" />
            <path d="M 15,70 L 25,70" stroke="var(--mastil-neutral-dark)" strokeWidth="1" />
            <path d="M 20,65 L 20,63 L 17,60 L 23,60 L 20,63" stroke="var(--mastil-neutral-dark)" strokeWidth="0.7" fill="var(--mastil-neutral-light)" />
            
            {/* Weathervane */}
            <line x1="50" y1="10" x2="50" y2="5" stroke="var(--mastil-neutral-dark)" strokeWidth="0.5" />
            <path d="M 49,5 L 51,5 L 50,3 Z" fill="var(--mastil-neutral-light)" />
            <line x1="48" y1="5" x2="52" y2="5" stroke="var(--mastil-neutral-dark)" strokeWidth="0.5" />
          </>
        );
      default:
        return null;
    }
  };

  // Get appropriate highlight filter based on building role
  const getHighlightFilter = () => {
    if (isSource) {
      return 'drop-shadow(0 0 10px var(--mastil-source, #10B981)) brightness(1.2)';
    } 
    else if (isTarget) {
      return 'drop-shadow(0 0 10px var(--mastil-target, #7C3AED)) brightness(1.2)';
    }
    else if (selected) {
      return 'drop-shadow(0 0 8px var(--mastil-accent))';
    }
    return 'none';
  };

  // Get animation class for highlight effects
  const getAnimationClass = () => {
    if (isSource) return 'animate-pulse-source';
    if (isTarget) return 'animate-pulse-target';
    return '';
  };

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`w-full h-full ${getAnimationClass()}`}
      style={{
        filter: getHighlightFilter()
      }}
    >
      {/* Ground/Base */}
      <ellipse 
        cx="50" 
        cy="82" 
        rx="35" 
        ry="5" 
        fill="var(--mastil-neutral-dark)" 
        opacity="0.2" 
      />
      
      {/* House base */}
      <path
        d={getHousePath()}
        fill="var(--mastil-neutral)"
        stroke="var(--mastil-neutral-light)"
        strokeWidth="2"
      />
      
      {/* Chimney */}
      <path
        d={getChimneyPath()}
        fill="var(--mastil-neutral-dark)"
        stroke="var(--mastil-neutral-light)"
        strokeWidth="1"
      />
      
      {/* Roof texture */}
      <path
        d="M 20,40 L 50,20 L 80,40"
        fill="none"
        stroke="var(--mastil-neutral-light)"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
      
      {/* Window details with frames */}
      <rect
        x="34"
        y="49"
        width="12"
        height="12"
        fill="var(--mastil-neutral-light)"
        opacity="0.2"
        stroke="var(--mastil-neutral-dark)"
        strokeWidth="0.5"
      />
      <line x1="40" y1="49" x2="40" y2="61" stroke="var(--mastil-neutral-dark)" strokeWidth="0.5" />
      <line x1="34" y1="55" x2="46" y2="55" stroke="var(--mastil-neutral-dark)" strokeWidth="0.5" />
      
      <rect
        x="54"
        y="49"
        width="12"
        height="12"
        fill="var(--mastil-neutral-light)"
        opacity="0.2"
        stroke="var(--mastil-neutral-dark)"
        strokeWidth="0.5"
      />
      <line x1="60" y1="49" x2="60" y2="61" stroke="var(--mastil-neutral-dark)" strokeWidth="0.5" />
      <line x1="54" y1="55" x2="66" y2="55" stroke="var(--mastil-neutral-dark)" strokeWidth="0.5" />
      
      {/* Door with details */}
      <rect
        x="43"
        y="60"
        width="14"
        height="20"
        fill="var(--mastil-neutral-dark)"
        opacity="0.6"
        stroke="var(--mastil-neutral-dark)"
        strokeWidth="0.7"
      />
      <circle cx="46" cy="70" r="1" fill="var(--mastil-neutral-light)" /> {/* Door handle */}
      
      {/* Wooden beam details on house */}
      <line x1="20" y1="60" x2="80" y2="60" stroke="var(--mastil-neutral-dark)" strokeWidth="1" opacity="0.7" />
      
      {/* Decorative elements specific to each variation */}
      {getDecorativeElements()}
    </svg>
  );
};

export default NeutralHouseSVG; 