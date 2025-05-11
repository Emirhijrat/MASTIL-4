import React, { useState } from 'react';

interface SettingsScreenProps {
  onBack: () => void;
  initialVolume?: number;
  initialMusicEnabled?: boolean;
  initialSoundEnabled?: boolean;
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  onSaveSettings?: (settings: GameSettings) => void;
}

interface GameSettings {
  volume: number;
  musicEnabled: boolean;
  soundEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  onBack,
  initialVolume = 70,
  initialMusicEnabled = true,
  initialSoundEnabled = true,
  initialDifficulty = 'medium',
  onSaveSettings
}) => {
  const [volume, setVolume] = useState(initialVolume);
  const [musicEnabled, setMusicEnabled] = useState(initialMusicEnabled);
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);
  const [difficulty, setDifficulty] = useState(initialDifficulty);

  const handleSave = () => {
    const settings: GameSettings = {
      volume,
      musicEnabled,
      soundEnabled,
      difficulty
    };
    
    if (onSaveSettings) {
      onSaveSettings(settings);
    }
    
    onBack();
  };

  return (
    <div 
      className="settings-screen-container fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[#101820] z-50 overflow-hidden"
      style={{
        height: '100vh',
        width: '100vw',
      }}
    >
      {/* Background with darkened overlay */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url("https://iili.io/3kEGMib.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.7)',
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 bg-[#2C1E0F]/80 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-800/50 w-11/12 max-w-md">
        <h2 className="text-3xl font-bold text-amber-200 mb-6 text-center">Einstellungen</h2>
        
        <div className="space-y-6">
          {/* Volume Control */}
          <div>
            <label className="block text-amber-300 mb-2 font-semibold">Lautstärke: {volume}%</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume} 
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-amber-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-amber-300 font-semibold">Musik</label>
            <div 
              className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${musicEnabled ? 'bg-amber-600' : 'bg-gray-600'}`}
              onClick={() => setMusicEnabled(!musicEnabled)}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${musicEnabled ? 'translate-x-6' : 'translate-x-0'}`} 
              />
            </div>
          </div>
          
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-amber-300 font-semibold">Soundeffekte</label>
            <div 
              className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${soundEnabled ? 'bg-amber-600' : 'bg-gray-600'}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} 
              />
            </div>
          </div>
          
          {/* Difficulty Selection */}
          <div>
            <label className="block text-amber-300 mb-2 font-semibold">Schwierigkeitsgrad</label>
            <div className="flex gap-2">
              <button 
                className={`flex-1 py-2 border-2 rounded transition-colors ${difficulty === 'easy' 
                  ? 'bg-green-700/80 border-green-600 text-green-100' 
                  : 'bg-transparent border-green-700/50 text-green-200/70 hover:bg-green-900/30'}`}
                onClick={() => setDifficulty('easy')}
              >
                Leicht
              </button>
              <button 
                className={`flex-1 py-2 border-2 rounded transition-colors ${difficulty === 'medium' 
                  ? 'bg-amber-700/80 border-amber-600 text-amber-100' 
                  : 'bg-transparent border-amber-700/50 text-amber-200/70 hover:bg-amber-900/30'}`}
                onClick={() => setDifficulty('medium')}
              >
                Mittel
              </button>
              <button 
                className={`flex-1 py-2 border-2 rounded transition-colors ${difficulty === 'hard' 
                  ? 'bg-red-700/80 border-red-600 text-red-100' 
                  : 'bg-transparent border-red-700/50 text-red-200/70 hover:bg-red-900/30'}`}
                onClick={() => setDifficulty('hard')}
              >
                Schwer
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-gray-700/70 hover:bg-gray-700 text-gray-200 rounded-md border-2 border-gray-600 shadow-md transition-all duration-300"
          >
            Abbrechen
          </button>
          
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-[#8B4513]/80 hover:bg-[#8B4513] text-amber-200 rounded-md border-2 border-amber-700 shadow-md transition-all duration-300 font-medium"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen; 