import React from 'react';
import { Pause, Play } from 'lucide-react';

interface GameControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ isPaused, onTogglePause }) => {
  return (
    <div className="absolute top-4 right-4 z-40">
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