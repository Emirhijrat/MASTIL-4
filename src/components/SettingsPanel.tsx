import React from 'react';
import { X, Sun, Moon, Music, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAudio } from '../hooks/useAudio';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { settings, toggleMusic, toggleSfx, setMasterVolume } = useAudio();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--mastil-bg-secondary)] rounded-xl shadow-xl w-full max-w-md m-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg hover:bg-black/10 
                   active:bg-black/20 transition-colors duration-150"
          aria-label="Close settings"
        >
          <X size={20} className="text-[var(--mastil-text-primary)]" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-[var(--mastil-text-primary)] mb-6">Settings</h2>

          <div className="space-y-6">
            {/* Theme Setting */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--mastil-text-primary)]">Theme</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                         bg-[var(--mastil-bg-primary)] hover:bg-black/10 
                         active:bg-black/20 transition-colors duration-150"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon size={18} className="text-[var(--mastil-text-primary)]" />
                    <span className="text-[var(--mastil-text-primary)]">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun size={18} className="text-[var(--mastil-text-primary)]" />
                    <span className="text-[var(--mastil-text-primary)]">Light</span>
                  </>
                )}
              </button>
            </div>

            {/* Music Setting */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--mastil-text-primary)]">Music</span>
              <button
                onClick={toggleMusic}
                className={`px-3 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2
                  ${settings.musicEnabled 
                    ? 'bg-[var(--mastil-accent)] text-white' 
                    : 'bg-[var(--mastil-bg-primary)] text-[var(--mastil-text-muted)]'}`}
              >
                <Music size={18} />
                <span>{settings.musicEnabled ? 'On' : 'Off'}</span>
              </button>
            </div>

            {/* Sound Effects Setting */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--mastil-text-primary)]">Sound Effects</span>
              <button
                onClick={toggleSfx}
                className={`px-3 py-2 rounded-lg transition-colors duration-150 flex items-center gap-2
                  ${settings.sfxEnabled 
                    ? 'bg-[var(--mastil-accent)] text-white' 
                    : 'bg-[var(--mastil-bg-primary)] text-[var(--mastil-text-muted)]'}`}
              >
                {settings.sfxEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <span>{settings.sfxEnabled ? 'On' : 'Off'}</span>
              </button>
            </div>

            {/* Volume Setting */}
            <div className="space-y-2">
              <span className="text-[var(--mastil-text-primary)]">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-[var(--mastil-bg-primary)] rounded-lg appearance-none cursor-pointer"
                aria-label="Master volume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;