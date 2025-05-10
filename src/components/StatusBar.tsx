import React, { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';

interface StatusBarProps {
  playerBuildingCount: number;
  enemyBuildingCount: number;
  onOpenSettings: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  playerBuildingCount, 
  enemyBuildingCount,
  onOpenSettings
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startHideTimer = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  useEffect(() => {
    startHideTimer();
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleInteraction = () => {
    setIsVisible(true);
    startHideTimer();
  };

  return (
    <>
      {/* Invisible touch area at the top */}
      <div 
        className="fixed top-0 left-0 w-full h-8 z-20 cursor-pointer"
        onClick={handleInteraction}
        aria-label="Show status bar"
      />

      {/* Status bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-10 transition-transform duration-500 ease-in-out
                   ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="p-2 sm:p-4 bg-black/30 backdrop-blur-lg flex flex-col sm:flex-row sm:justify-between 
                      items-center gap-2 sm:gap-0 border-b border-[var(--mastil-border)]">
          <h1 className="text-base sm:text-xl font-semibold tracking-tight">
            MASTIL
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="text-sm sm:text-base flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--mastil-player)]"></span>
                <span>Player: <span className="font-semibold">{playerBuildingCount}</span></span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--mastil-enemy)]"></span>
                <span>Enemy: <span className="font-semibold">{enemyBuildingCount}</span></span>
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
                handleInteraction();
              }}
              className="p-2 rounded-lg hover:bg-[var(--mastil-bg-secondary)] 
                       active:bg-[var(--mastil-bg-primary)] transition-colors duration-150"
              aria-label="Open settings"
            >
              <Settings size={20} className="text-[var(--mastil-text-primary)]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusBar;