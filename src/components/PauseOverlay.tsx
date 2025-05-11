import React from 'react';

interface PauseOverlayProps {
  isPaused: boolean;
  onResume: () => void;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ isPaused, onResume }) => {
  if (!isPaused) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-yellow-600 p-8 rounded-lg shadow-lg text-center transform transition-all">
        <h2 className="text-3xl font-medieval text-yellow-500 mb-6">GAME PAUSED</h2>
        <p className="text-white mb-8 text-lg">The battle awaits your command, Majestät.</p>
        <button
          onClick={onResume}
          className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-md transition-colors duration-200 transform hover:scale-105"
        >
          Resume Game
        </button>
      </div>
    </div>
  );
};

export default PauseOverlay; 