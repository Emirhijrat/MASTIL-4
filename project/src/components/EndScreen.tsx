import React from 'react';
import { RotateCcw } from 'lucide-react';

interface EndScreenProps {
  message: string;
  onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ message, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-[var(--mastil-bg-primary)]/90 backdrop-blur-sm 
                    flex flex-col items-center justify-center z-20 animate-fadeIn">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center px-4 text-[var(--mastil-text-primary)]">
        {message}
      </h2>
      <button 
        onClick={onRestart}
        className="bg-[var(--mastil-accent)] hover:bg-[var(--mastil-accent-hover)] active:bg-[var(--mastil-accent-active)]
                  text-[var(--mastil-text-primary)] font-bold py-3 px-6 rounded-lg text-lg
                  flex items-center gap-2 transition-colors duration-150 touch-manipulation"
      >
        <RotateCcw size={20} />
        Restart
      </button>
    </div>
  );
};

export default EndScreen;