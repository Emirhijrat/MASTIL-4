import React, { useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "wird gestartet..." }) => {
  const version = "Version 1.0.4"; // Updated version number

  // Ensure proper handling of device orientation changes
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render if needed for orientation changes
      document.documentElement.style.height = `${window.innerHeight}px`;
    };

    // Set initial height
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      className="loading-screen-container fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[#101820] z-50 overflow-hidden"
      style={{
        // Using viewport units to ensure full coverage
        height: '100vh',
        width: '100vw',
      }}
    >
      {/* Background Image Container with proper aspect ratio preservation */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url("https://iili.io/3kEGMib.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Content Container - centered vertically and horizontally */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        {/* You can add a centered logo or title here if needed */}
      </div>

      {/* Loading Message - positioned near bottom */}
      <div 
        className="loading-message fixed flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm z-20"
        style={{
          bottom: 'max(12vh, 60px)',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <span className="text-lg font-medium text-[#FFDB58]">{message}</span>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[#FFDB58] animate-[bounce_1s_infinite]" style={{ animationDelay: '0s' }} />
          <span className="w-2 h-2 rounded-full bg-[#FFDB58] animate-[bounce_1s_infinite]" style={{ animationDelay: '0.2s' }} />
          <span className="w-2 h-2 rounded-full bg-[#FFDB58] animate-[bounce_1s_infinite]" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Version Text - bottom-center with safe area handling */}
      <div 
        className="version-text fixed text-sm text-gray-400/75 backdrop-blur-sm px-3 py-1 rounded-full z-20"
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

export default LoadingScreen;
