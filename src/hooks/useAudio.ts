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

let backgroundMusic: HTMLAudioElement | null = null;
let attackSound: HTMLAudioElement | null = null;

if (typeof window !== 'undefined') {
  try {
    backgroundMusic = new Audio('/audio/background_music.mp3'); 
    backgroundMusic.loop = true;
  } catch (e) {
    console.error("Error creating backgroundMusic Audio object:", e);
  }
  try {
    attackSound = new Audio('/audio/attack_sfx.wav'); 
  } catch (e) {
    console.error("Error creating attackSound Audio object:", e);
  }
}

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      try {
        return saved ? JSON.parse(saved) : defaultSettings;
      } catch (e) {
        console.error("Error parsing audio settings from localStorage:", e);
        return defaultSettings;
      }
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
        console.warn('Failed to play background music. Name:', error.name, 'Message:', error.message, error);
      });
    }
  }, [settings.musicEnabled, settings.masterVolume]); // Added masterVolume as play might be affected by it indirectly

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
  }, []);

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
      // Check if audio context is suspended (common issue with autoplay policies)
      if (attackSound.paused && attackSound.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
         // Attempt to resume audio context if necessary, though this is more for background music usually
      }
      attackSound.play().catch(error => {
        console.warn('Failed to play attack sound. Name:', error.name, 'Message:', error.message, 'Full error:', error);
      });
    }
  }, [settings.sfxEnabled, settings.masterVolume]); // Added masterVolume as play might be affected by it indirectly

  const toggleMusic = useCallback(() => {
    setSettings(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }));
  }, []);

  const toggleSfx = useCallback(() => {
    setSettings(prev => ({ ...prev, sfxEnabled: !prev.sfxEnabled }));
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setSettings(prev => ({ ...prev, masterVolume: clampedVolume }));
  }, []);

  return {
    settings,
    toggleMusic,
    toggleSfx,
    setMasterVolume,
    playAttackSound,
    playBackgroundMusic,
    stopBackgroundMusic,
  };
}