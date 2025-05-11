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
let selectSound: HTMLAudioElement | null = null;
let deploySound: HTMLAudioElement | null = null;
let upgradeSound: HTMLAudioElement | null = null;

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
  try {
    // Simple "click" sound for selection
    selectSound = new Audio('/audio/select_sfx.wav');
    selectSound.volume = 0.4; // Lower volume for frequent feedback
  } catch (e) {
    console.error("Error creating selectSound Audio object:", e);
  }
  try {
    // Sound for unit deployment/sending
    deploySound = new Audio('/audio/deploy_sfx.wav');
  } catch (e) {
    console.error("Error creating deploySound Audio object:", e);
  }
  try {
    // Sound for successful upgrades
    upgradeSound = new Audio('/audio/upgrade_sfx.wav');
  } catch (e) {
    console.error("Error creating upgradeSound Audio object:", e);
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
    if (selectSound) {
      selectSound.volume = settings.sfxEnabled ? settings.masterVolume * 0.4 : 0;
    }
    if (deploySound) {
      deploySound.volume = settings.sfxEnabled ? settings.masterVolume * 0.6 : 0;
    }
    if (upgradeSound) {
      upgradeSound.volume = settings.sfxEnabled ? settings.masterVolume * 0.7 : 0;
    }
  }, [settings]);

  const playBackgroundMusic = useCallback(() => {
    if (backgroundMusic && settings.musicEnabled) {
      backgroundMusic.play().catch(error => {
        console.warn('Failed to play background music. Name:', error.name, 'Message:', error.message, error);
      });
    }
  }, [settings.musicEnabled, settings.masterVolume]);

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

  // Helper function to play any sound effect
  const playSoundEffect = useCallback((sound: HTMLAudioElement | null) => {
    if (sound && settings.sfxEnabled) {
      sound.currentTime = 0;
      if (sound.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        sound.play().catch(error => {
          console.warn(`Failed to play sound effect. Name: ${error.name}, Message: ${error.message}`);
        });
      }
    }
  }, [settings.sfxEnabled]);

  const playAttackSound = useCallback(() => {
    playSoundEffect(attackSound);
  }, [playSoundEffect]);

  const playSelectSound = useCallback(() => {
    playSoundEffect(selectSound);
  }, [playSoundEffect]);

  const playDeploySound = useCallback(() => {
    playSoundEffect(deploySound);
  }, [playSoundEffect]);

  const playUpgradeSound = useCallback(() => {
    playSoundEffect(upgradeSound);
  }, [playSoundEffect]);

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
    playSelectSound,
    playDeploySound,
    playUpgradeSound,
    playBackgroundMusic,
    stopBackgroundMusic,
  };
}