import React, { useEffect } from 'react';

interface ImpactEffectProps {
  x: number;
  y: number;
  onDone: () => void;
  size?: number;
  duration?: number; // ms
}

const ImpactEffect: React.FC<ImpactEffectProps> = ({ x, y, onDone, size = 64, duration = 700 }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, duration);
    return () => clearTimeout(timer);
  }, [onDone, duration]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      <div className="impact-fire-animation" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default ImpactEffect; 