import React from 'react';
import { ArrowUpCircle } from 'lucide-react';
import { Building } from '../types/gameTypes'; // Import Building type

interface ContextualUpgradeButtonProps {
  building: Building; // Expecting the full building object
  isVisible: boolean; // Controlled by parent
  canUpgrade: boolean;
  upgradeCost: number;
  onUpgrade: () => void;
}

const ContextualUpgradeButton: React.FC<ContextualUpgradeButtonProps> = ({
  building,
  isVisible,
  canUpgrade,
  upgradeCost,
  onUpgrade
}) => {
  console.log('[ContextualUpgradeButton] Rendering. Props:', 
    { 
      buildingId: building.id, 
      isVisible, 
      canUpgrade, 
      upgradeCost, 
      onUpgradeType: typeof onUpgrade 
    }
  );

  // Always-visible placeholder for debugging if the component itself renders
  // const debugPlaceholder = (
  //   <div style={{position: 'fixed', bottom: '10px', left: '10px', padding: '5px', backgroundColor: 'lightcoral', zIndex: 9999, fontSize: '12px'}}>
  //     CUB Rendered for: {building.id} | isVisible: {isVisible.toString()} | canUpgrade: {canUpgrade.toString()}
  //   </div>
  // );

  if (!isVisible) {
    // console.log('[ContextualUpgradeButton] isVisible is false, not rendering button for', building.id);
    return null; // Or a placeholder if you prefer to debug its non-visible state
  }

  return (
    <>
      {/* {debugPlaceholder} Uncomment to see the placeholder */} 
      <div 
        className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 contextual-button transition-opacity duration-300 opacity-100"
        style={{ 
          // Ensure visibility if other styles might hide it
          // visibility: 'visible', 
          // opacity: 1, 
          // display: 'block' 
        }}
      >
        <button
          className={`relative bg-white hover:bg-gray-100 active:bg-gray-200
                     text-gray-800
                     p-2 rounded-full transition-all duration-200 ease-in-out shadow-md touch-manipulation
                     disabled:opacity-50 disabled:cursor-not-allowed min-w-[38px] min-h-[38px]
                     flex items-center justify-center hover:scale-105`}
          disabled={!canUpgrade}
          onClick={(e) => {
            e.stopPropagation(); // Prevent click from bubbling to the building/game area
            console.log('[ContextualUpgradeButton] Upgrade button clicked for building:', building.id);
            onUpgrade();
          }}
          title={`Upgrade Lvl ${building.level + 1} Cost: ${upgradeCost}`}
        >
          <ArrowUpCircle size={20} className="stroke-[2.5]" />
          <span className="absolute -top-1 -right-1 bg-gray-100 text-gray-800 text-xs font-bold
                         px-1.5 py-0.5 rounded-full border border-gray-300
                         shadow-sm min-w-[20px] text-center">
            {upgradeCost}
          </span>
        </button>
      </div>
    </>
  );
};

export default ContextualUpgradeButton;
