import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "wird gestartet..." }) => {
  const version = "Version 1.0.1"; // Updated version number

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#101820]"
      style={{
        backgroundImage: 'url("https://iili.io/3kEGMib.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: 'sans-serif' // A generic sans-serif font for wider compatibility
      }}
    >
      {/* Loading Message at the bottom (existing) */}
      <div className="loading-message fixed bottom-12 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
        <span className="text-lg font-medium text-[#FFDB58]">{message}</span>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[#FFDB58] animate-[bounce_1s_infinite]" style={{ animationDelay: '0s' }} />
          <span className="w-2 h-2 rounded-full bg-[#FFDB58] animate-[bounce_1s_infinite]" style={{ animationDelay: '0.2s' }} />
          <span className="w-2 h-2 rounded-full bg-[#FFDB58] animate-[bounce_1s_infinite]" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Version Text - Positioned at bottom-right */}
      <div 
        className="version-text fixed bottom-4 right-4 text-sm text-gray-400 opacity-75"
        style={{
          // Ensure it's above most things but can be below specific popups if needed
          zIndex: 10, 
        }}
      >
        {version}
      </div>
    </div>
  );
};

export default LoadingScreen;
