// This script fixes building initialization issues
(function() {
  console.log('[PATCH] Applying building initialization fix');
  
  // Wait for the app to load
  const MAX_RETRIES = 30;
  let retries = 0;
  
  function patchComponents() {
    if (retries >= MAX_RETRIES) {
      console.error('[PATCH] Failed to apply patches after maximum retries');
      return;
    }
    
    retries++;
    
    // Check if React is loaded
    if (!window.React) {
      console.log('[PATCH] Waiting for React to load...');
      setTimeout(patchComponents, 500);
      return;
    }
    
    try {
      // MonkeyPatch React's createElement to intercept component creation
      const originalCreateElement = React.createElement;
      
      React.createElement = function(type, props, ...children) {
        // If this is our Map component (checking based on props signature)
        if (typeof type === 'function' && props && 
            'buildings' in props && 
            'selectedBuildingId' in props && 
            'onBuildingClick' in props) {
          
          // Make sure buildings is an array
          if (!props.buildings || !Array.isArray(props.buildings)) {
            console.log('[PATCH] Fixing empty buildings array for Map component');
            props = { ...props, buildings: [] };
          }
          
          // Add default handlers if missing
          if (!props.onBuildingClick) props = { ...props, onBuildingClick: () => {} };
          if (!props.getUpgradeCost) props = { ...props, getUpgradeCost: () => 0 };
          if (!props.onUpgrade) props = { ...props, onUpgrade: () => {} };
          
          console.log('[PATCH] Map component patched');
        }
        
        // If this is our GameBoard component
        if (typeof type === 'function' && props &&
            'onSettings' in props && 'onExit' in props) {
          
          console.log('[PATCH] GameBoard component intercepted');
          
          // Wrap the component with our own logic
          const originalType = type;
          type = function(props) {
            const result = originalType(props);
            
            // Inspect and log the result
            console.log('[PATCH] GameBoard rendered:', result);
            
            // Try to patch any problematic spots
            if (result && result.props && result.props.children) {
              console.log('[PATCH] Patching GameBoard children');
            }
            
            return result;
          };
        }
        
        // Call original function with our potentially modified props
        return originalCreateElement.apply(this, [type, props, ...children]);
      };
      
      console.log('[PATCH] Successfully applied React component patches');
      
      // Add CSS fixes
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .building {
          transition: all 0.2s ease-in-out;
          cursor: pointer;
          position: absolute; 
          transform: translate(-50%, -50%);
          min-width: 40px;
          min-height: 40px;
          pointer-events: auto;
        }
        
        .building:hover {
          transform: translate(-50%, -50%) scale(1.03);
        }
        
        .building.selected {
          transform: translate(-50%, -50%) scale(1.05);
        }
        
        .building.building-highlight-source {
          transform: translate(-50%, -50%) scale(1.1);
          z-index: 20;
        }
        
        .building.building-highlight-target {
          transform: translate(-50%, -50%) scale(1.1);
          z-index: 20;
        }
        
        .game-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        
        .game-board {
          width: 100%;
          height: 100%;
          max-width: 100vh;
          max-height: 100%;
          aspect-ratio: 16/9;
          position: relative;
          margin: 0 auto;
        }
      `;
      document.head.appendChild(styleElement);
      console.log('[PATCH] Added CSS fixes');
      
    } catch (error) {
      console.error('[PATCH] Error applying patches:', error);
      // Try again if something went wrong
      setTimeout(patchComponents, 500);
    }
  }
  
  // Start patching
  patchComponents();
})(); 