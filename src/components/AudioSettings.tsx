import React from 'react';
import { Volume2, VolumeX, Music, Square } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

const AudioSettings: React.FC = () => {
  const { settings, toggleMusic, toggleSfx, setMasterVolume } = useAudio();

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleMusic}
        className={`p-2 rounded-lg transition-colors duration-150
          ${settings.musicEnabled 
            ? 'bg-[var(--mastil-accent)] text-[var(--mastil-text-primary)]' 
            : 'bg-[var(--mastil-bg-secondary)] text-[var(--mastil-text-muted)]'}`}
        aria-label="Toggle music"
      >
        <Music size={20} />
      </button>

      <button
        onClick={toggleSfx}
        className={`p-2 rounded-lg transition-colors duration-150
          ${settings.sfxEnabled 
            ? 'bg-[var(--mastil-accent)] text-[var(--mastil-text-primary)]' 
            : 'bg-[var(--mastil-bg-secondary)] text-[var(--mastil-text-muted)]'}`}
        aria-label="Toggle sound effects"
      >
        {settings.sfxEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.masterVolume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className="w-24 h-2 bg-[var(--mastil-bg-secondary)] rounded-lg appearance-none cursor-pointer"
          aria-label="Master volume"
        />
      </div>
    </div>
  );
};

export default AudioSettings;