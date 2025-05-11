import React from 'react';

interface GameOverScreenProps {
  isVisible: boolean;
  message: string;
  isVictory: boolean;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  isVisible, 
  message, 
  isVictory, 
  onRestart 
}) => {
  if (!isVisible) return null;

  const bgColorClass = isVictory ? 'bg-green-900' : 'bg-red-900';
  const borderColorClass = isVictory ? 'border-green-500' : 'border-red-500';
  const titleClass = isVictory ? 'text-green-400' : 'text-red-400';
  const buttonClass = isVictory 
    ? 'bg-green-600 hover:bg-green-500' 
    : 'bg-red-600 hover:bg-red-500';
  const title = isVictory ? 'VICTORY!' : 'DEFEAT!';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className={`${bgColorClass} border-4 ${borderColorClass} p-10 rounded-lg shadow-2xl text-center max-w-xl`}>
        <h2 className={`text-5xl font-medieval ${titleClass} mb-8`}>{title}</h2>
        <p className="text-white mb-10 text-xl">{message}</p>
        <button
          onClick={onRestart}
          className={`px-8 py-4 ${buttonClass} text-white font-bold rounded-md transition-colors duration-200 transform hover:scale-105 text-xl`}
        >
          Start New Campaign
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen; 