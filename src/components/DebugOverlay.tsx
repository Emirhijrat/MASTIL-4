import React, { useState, useEffect } from 'react';
import { Building } from '../types/gameTypes';

interface DebugOverlayProps {
  buildings: Building[];
  onCoordinateUpdate?: (fieldId: string, x: number, y: number) => void;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ buildings, onCoordinateUpdate }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' && e.ctrlKey) {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const gameArea = document.querySelector('.game-area');
      if (!gameArea) return;

      const rect = gameArea.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePos({ x, y });
    };

    if (isVisible) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible]);

  if (!isVisible) return null;

  const handleFieldClick = (fieldId: string) => {
    setSelectedField(fieldId);
  };

  const handleCoordinateUpdate = (fieldId: string) => {
    if (onCoordinateUpdate) {
      onCoordinateUpdate(fieldId, mousePos.x, mousePos.y);
      console.log(`New coordinates for ${fieldId}: { x: ${mousePos.x.toFixed(2)}, y: ${mousePos.y.toFixed(2)} }`);
    }
  };

  return (
    <div className="fixed top-0 left-0 bg-black/80 text-white p-4 z-50 font-mono text-sm">
      <div className="mb-2">
        <span className="font-bold">Debug Mode (Ctrl+D to toggle)</span>
      </div>
      <div className="mb-2">
        Mouse Position: x: {mousePos.x.toFixed(2)}, y: {mousePos.y.toFixed(2)}
      </div>
      <div className="mb-2">
        <span className="font-bold">Fields:</span>
        <div className="mt-1 max-h-40 overflow-y-auto">
          {buildings.map(building => (
            <div 
              key={building.id}
              className={`cursor-pointer hover:bg-white/20 p-1 ${selectedField === building.id ? 'bg-white/30' : ''}`}
              onClick={() => handleFieldClick(building.id)}
            >
              {building.id}: {building.owner} - x: {building.position.x.toFixed(2)}, y: {building.position.y.toFixed(2)}
            </div>
          ))}
        </div>
      </div>
      {selectedField && (
        <button
          className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded mt-2"
          onClick={() => handleCoordinateUpdate(selectedField)}
        >
          Update {selectedField} to current position
        </button>
      )}
    </div>
  );
};

export default DebugOverlay; 