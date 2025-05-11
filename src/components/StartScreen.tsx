import React from 'react';

interface StartScreenProps {
  onStartGame: () => void;
  onShowCredits: () => void;
  onShowSettings: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ 
  onStartGame, 
  onShowCredits, 
  onShowSettings 
}) => {
  const version = "Version 1.0.4";
  const gameTitle = "MASTIL";
  const subtitle = "Medieval Autonomous Strategy Territorial Interactive Lineage";

  return (
    <div 
      className="start-screen-container fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[#101820] z-50 overflow-hidden"
      style={{
        height: '100vh',
        width: '100vw',
      }}
    >
      {/* Background Image with parallax effect */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url("https://iili.io/3kEGMib.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Overlay with slight darkening */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Game Title with medieval styling */}
      <div className="relative z-10 flex flex-col items-center mb-12 mt-20">
        <h1 className="text-6xl md:text-7xl font-bold text-[#FFDB58] tracking-wider mb-3"
            style={{ 
              textShadow: '0 0 10px rgba(255, 219, 88, 0.6), 0 0 20px rgba(255, 219, 88, 0.4)', 
              fontFamily: 'serif' 
            }}>
          {gameTitle}
        </h1>
        <p className="text-sm md:text-base text-amber-200 text-center max-w-md px-4">
          {subtitle}
        </p>
      </div>

      {/* Menu buttons with medieval style */}
      <div className="relative z-10 flex flex-col items-center gap-4 w-64">
        <button 
          onClick={onStartGame}
          className="w-full py-3 bg-[#8B4513]/80 hover:bg-[#8B4513] text-amber-200 rounded-md border-2 border-amber-700 shadow-md transition-all duration-300 font-medium"
          style={{ 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 219, 88, 0.3)' 
          }}
        >
          Spiel Starten
        </button>
        
        <button 
          onClick={onShowSettings}
          className="w-full py-3 bg-[#654321]/70 hover:bg-[#654321] text-amber-200 rounded-md border-2 border-amber-800/80 shadow-md transition-all duration-300 font-medium"
          style={{ 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 219, 88, 0.2)' 
          }}
        >
          Einstellungen
        </button>
        
        <button 
          onClick={onShowCredits}
          className="w-full py-3 bg-[#4A3428]/70 hover:bg-[#4A3428] text-amber-200 rounded-md border-2 border-amber-900/80 shadow-md transition-all duration-300 font-medium"
          style={{ 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 219, 88, 0.15)' 
          }}
        >
          Credits
        </button>
      </div>

      {/* Medieval decorative element */}
      <div className="relative z-10 mt-10">
        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>
      </div>

      {/* Version text */}
      <div 
        className="version-text fixed text-sm text-amber-200/75 px-3 py-1 rounded-full z-20"
        style={{
          bottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        {version}
      </div>
    </div>
  );
};

export default StartScreen; 