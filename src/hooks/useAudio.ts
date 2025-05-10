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
  masterVolume: 0.5, // Default volume lowered a bit
};

// Create audio elements
let backgroundMusic: HTMLAudioElement | null = null;
let attackSound: HTMLAudioElement | null = null;

// Initialize audio elements only in the browser environment
if (typeof window !== 'undefined') {
  backgroundMusic = new Audio('/audio/background_music.mp3'); // Ensure this path is correct
  backgroundMusic.loop = true;

  attackSound = new Audio('/audio/attack_sfx.wav'); // Ensure this path is correct
}

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (backgroundMusic) {
      backgroundMusic.volume = settings.musicEnabled ? settings.masterVolume : 0;
    }
    if (attackSound) {
      attackSound.volume = settings.sfxEnabled ? settings.masterVolume : 0;
    }
  }, [settings]);

  const playBackgroundMusic = useCallback(() => {
    if (backgroundMusic && settings.musicEnabled) {
      backgroundMusic.play().catch(error => {
        console.warn('Failed to play background music initially or on demand:', error);
      });
    }
  }, [settings.musicEnabled]); // Dependency on settings.musicEnabled

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
  }, []);

  // Effect to handle auto-play/pause based on settings.musicEnabled toggle
  useEffect(() => {
    if (settings.musicEnabled) {
      playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [settings.musicEnabled, playBackgroundMusic, stopBackgroundMusic]);

  const playAttackSound = useCallback(() => {
    if (attackSound && settings.sfxEnabled) {
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
    const clampedVolume = Math.max(0, Math.min(1, volume)); // Ensure volume is between 0 and 1
    setSettings(prev => ({ ...prev, masterVolume: clampedVolume }));
  }, []);

  return {
    settings,
    toggleMusic,
    toggleSfx,
    setMasterVolume,
    playAttackSound,
    playBackgroundMusic, // Added
    stopBackgroundMusic, // Added
  };
}