import React from 'react';
import { ArrowUpCircle } from 'lucide-react';
import { Building } from '../types/gameTypes';

interface ControlBarProps {
  selectedBuilding: Building | undefined;
  upgradeCost: number;
  canUpgrade: boolean;
  onUpgrade: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ 
  selectedBuilding, 
  upgradeCost, 
  canUpgrade, 
  onUpgrade 
}) => {
  return (
    <div className="w-full absolute bottom-0 left-0 z-30">
      <button 
        className={`w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold 
                   py-4 text-center text-lg transition-colors duration-150 
                   shadow-md flex items-center justify-center gap-2
                   disabled:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation`}
        disabled={!canUpgrade}
        onClick={onUpgrade}
      >
        <ArrowUpCircle size={20} />
        <span className="whitespace-nowrap">Upgrade ({upgradeCost})</span>
      </button>
    </div>
  );
};

export default ControlBar;