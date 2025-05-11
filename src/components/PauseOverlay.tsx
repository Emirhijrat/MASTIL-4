import React from 'react';

interface PauseOverlayProps {
  isPaused: boolean;
  onResume: () => void;
  onBackToMainMenu?: () => void;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ 
  isPaused, 
  onResume,
  onBackToMainMenu
}) => {
  if (!isPaused) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-yellow-600 p-8 rounded-lg shadow-lg text-center transform transition-all">
        <h2 className="text-3xl font-medieval text-yellow-500 mb-6">SPIEL PAUSIERT</h2>
        <p className="text-white mb-8 text-lg">Die Schlacht wartet auf Euren Befehl, Majestät.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onResume}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-md transition-colors duration-200 transform hover:scale-105"
          >
            Spiel fortsetzen
          </button>
          
          {onBackToMainMenu && (
            <button
              onClick={onBackToMainMenu}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-md transition-colors duration-200 transform hover:scale-105"
            >
              Zum Hauptmenü
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PauseOverlay; 