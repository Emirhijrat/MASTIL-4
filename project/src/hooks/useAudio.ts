import { useState, useEffect, useCallback } from 'react';

interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  masterVolume: number;
}

const STORAGE_KEY = 'mastil_audio_settings';

const defaultSettings: AudioSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  masterVolume: 0.8,
};

// Create audio elements
const backgroundMusic = new Audio('/audio/background_music.mp3');
backgroundMusic.loop = true;

const attackSound = new Audio('/audio/attack_sfx.wav');

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply volume settings to audio elements
  useEffect(() => {
    backgroundMusic.volume = settings.musicEnabled ? settings.masterVolume : 0;
    attackSound.volume = settings.sfxEnabled ? settings.masterVolume : 0;
  }, [settings]);

  // Start background music when enabled
  useEffect(() => {
    if (settings.musicEnabled) {
      backgroundMusic.play().catch(error => {
        console.warn('Failed to play background music:', error);
      });
    } else {
      backgroundMusic.pause();
    }
  }, [settings.musicEnabled]);

  const playAttackSound = useCallback(() => {
    if (settings.sfxEnabled) {
      attackSound.currentTime = 0;
      attackSound.play().catch(error => {
        console.warn('Failed to play attack sound:', error);
      });
    }
  }, [settings.sfxEnabled]);

  const toggleMusic = useCallback(() => {
    setSettings(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }));
  }, []);

  const toggleSfx = useCallback(() => {
    setSettings(prev => ({ ...prev, sfxEnabled: !prev.sfxEnabled }));
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, masterVolume: volume }));
  }, []);

  return {
    settings,
    toggleMusic,
    toggleSfx,
    setMasterVolume,
    playAttackSound,
  };
}