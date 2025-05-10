import React from 'react';
import { ArrowUpCircle } from 'lucide-react';

interface ContextualUpgradeButtonProps {
  upgradeCost: number;
  canUpgrade: boolean;
  onUpgrade: () => void;
}

const ContextualUpgradeButton: React.FC<ContextualUpgradeButtonProps> = ({
  upgradeCost,
  canUpgrade,
  onUpgrade
}) => {
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 contextual-button transition-opacity duration-300 opacity-100">
      <button
        className={`relative bg-white hover:bg-gray-100 active:bg-gray-200
                   text-gray-800
                   p-2 rounded-full transition-all duration-200 ease-in-out shadow-md touch-manipulation
                   disabled:opacity-50 disabled:cursor-not-allowed min-w-[38px] min-h-[38px]
                   flex items-center justify-center hover:scale-105`}
        disabled={!canUpgrade}
        onClick={(e) => {
          e.stopPropagation();
          onUpgrade();
        }}
      >
        <ArrowUpCircle size={20} className="stroke-[2.5]" />
        <span className="absolute -top-1 -right-1 bg-gray-100 text-gray-800 text-xs font-bold
                       px-1.5 py-0.5 rounded-full border border-gray-300
                       shadow-sm min-w-[20px] text-center">
          {upgradeCost}
        </span>
      </button>
    </div>
  );
};

export default ContextualUpgradeButton