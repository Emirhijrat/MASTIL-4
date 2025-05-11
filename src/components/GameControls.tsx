import React from 'react';
import { Pause, Play, Menu, MessageCircle } from 'lucide-react';

interface GameControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onBackToMainMenu?: () => void;
  onForceComment?: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  isPaused, 
  onTogglePause,
  onBackToMainMenu,
  onForceComment
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
      
      {onForceComment && process.env.NODE_ENV !== 'production' && (
        <button 
          onClick={onForceComment}
          className="bg-purple-800 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
          title="Force Commentary (Testing)"
        >
          <MessageCircle className="text-amber-300" />
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