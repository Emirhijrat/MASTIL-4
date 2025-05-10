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
    <div className="p-3 sm:p-4 bg-black/30 backdrop-blur-lg flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 border-t border-gray-700">
      <button 
        className={`bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold 
                   py-3 px-4 rounded-lg text-sm sm:text-base transition-colors duration-150 
                   shadow-md flex items-center gap-2 w-full sm:w-auto justify-center
                   disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation`}
        disabled={!canUpgrade}
        onClick={onUpgrade}
      >
        <ArrowUpCircle size={18} />
        <span className="whitespace-nowrap">Upgrade ({upgradeCost} E)</span>
      </button>
      <div className="text-sm text-gray-400 text-center sm:text-left">
        {selectedBuilding 
          ? `Building: Lvl ${selectedBuilding.level}, ${selectedBuilding.units} Units` 
          : 'Select a building'}
      </div>
    </div>
  );
};

export default ControlBar;