import React from 'react';
import { Pause, Play, Menu } from 'lucide-react';

interface GameControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onBackToMainMenu?: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  isPaused, 
  onTogglePause,
  onBackToMainMenu 
}) => {
  return (
    <div className="absolute top-4 right-4 z-40 flex gap-2">
      {onBackToMainMenu && (
        <button 
          onClick={onBackToMainMenu}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
          title="Main Menu"
        >
          <Menu className="text-amber-500" />
        </button>
      )}
      
      <button 
        onClick={onTogglePause}
        className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
        title={isPaused ? "Resume Game" : "Pause Game"}
      >
        {isPaused ? (
          <Play className="text-green-500" />
        ) : (
          <Pause className="text-yellow-500" />
        )}
      </button>
    </div>
  );
};

export default GameControls; 