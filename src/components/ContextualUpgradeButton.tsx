import React from 'react';
import { ArrowUpCircle } from 'lucide-react';
import { Building } from '../types/gameTypes';

interface ContextualUpgradeButtonProps {
  building: Building;
  upgradeCost: number;
  canUpgrade: boolean;
  onUpgrade: () => void;
}

const ContextualUpgradeButton: React.FC<ContextualUpgradeButtonProps> = ({
  building,
  upgradeCost,
  canUpgrade,
  onUpgrade
}) => {
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 contextual-button">
      <button
        className={`relative bg-[var(--mastil-accent)] hover:bg-[var(--mastil-accent-hover)] 
                   active:bg-[var(--mastil-accent-active)] text-[var(--mastil-text-primary)]
                   p-2.5 rounded-full transition-colors duration-150 shadow-md touch-manipulation
                   disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px]
                   flex items-center justify-center`}
        disabled={!canUpgrade}
        onClick={(e) => {
          e.stopPropagation();
          onUpgrade();
        }}
      >
        <ArrowUpCircle size={24} className="stroke-[2.5]" />
        <span className="absolute -top-1 -right-1 bg-[var(--mastil-accent-hover)] text-xs font-bold 
                       px-1.5 py-0.5 rounded-full border border-[var(--mastil-accent-active)] 
                       shadow-sm min-w-[20px] text-center">
          {upgradeCost}
        </span>
      </button>
    </div>
  );
};

export default ContextualUpgradeButton