/**
 * Emergency Game Fix Script
 * This fixes critical issues with building rendering and interaction
 */
(function() {
  console.log('[GAME_FIX] Initializing emergency game fixes');
  
  const MAP_BACKGROUND = 'https://iili.io/3vhdSja.png';
  let fixAttempts = 0;
  const MAX_ATTEMPTS = 30;
  
  // Fix attempt function that runs periodically
  function attemptGameFix() {
    fixAttempts++;
    
    if (fixAttempts > MAX_ATTEMPTS) {
      console.log('[GAME_FIX] Maximum fix attempts reached');
      return;
    }
    
    console.log(`[GAME_FIX] Attempt #${fixAttempts} to fix game issues`);
    
    // Set the game area background
    const gameAreas = document.querySelectorAll('.game-area');
    if (gameAreas.length > 0) {
      console.log(`[GAME_FIX] Setting background on ${gameAreas.length} game areas`);
      gameAreas.forEach(gameArea => {
        gameArea.style.backgroundImage = `url(${MAP_BACKGROUND})`;
        gameArea.style.backgroundSize = 'cover';
        gameArea.style.backgroundPosition = 'center';
        gameArea.style.backgroundRepeat = 'no-repeat';
      });
    }
    
    // Fix building positioning and visibility
    const buildings = document.querySelectorAll('.building');
    if (buildings.length > 0) {
      console.log(`[GAME_FIX] Fixing ${buildings.length} buildings`);
      buildings.forEach(building => {
        // Ensure the building is visible
        building.style.opacity = '1';
        building.style.visibility = 'visible';
        building.style.display = 'block';
        building.style.transform = 'translate(-50%, -50%)';
        
        // Ensure building has a minimum size
        building.style.minWidth = '40px';
        building.style.minHeight = '40px';
        
        // Make sure it's clickable
        building.style.pointerEvents = 'auto';
        building.style.cursor = 'pointer';
        
        // Apply different styles based on owner
        const owner = building.getAttribute('data-owner');
        if (owner === 'player') {
          building.style.filter = 'drop-shadow(0 0 3px blue)';
        } else if (owner === 'enemy') {
          building.style.filter = 'drop-shadow(0 0 3px red)';
        } else if (owner === 'neutral') {
          building.style.filter = 'drop-shadow(0 0 3px gray)';
        }
        
        // Ensure images inside buildings are visible
        const images = building.querySelectorAll('img');
        if (images.length > 0) {
          images.forEach(img => {
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            img.style.display = 'block';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
          });
        }
      });
    }
    
    // Check if we need to continue trying
    if (gameAreas.length === 0 || buildings.length === 0) {
      console.log('[GAME_FIX] Game elements not fully loaded, retrying in 1 second');
      setTimeout(attemptGameFix, 1000);
    } else {
      console.log('[GAME_FIX] Game fixes applied successfully');
      
      // Add a MutationObserver to keep applying fixes when DOM changes
      setupMutationObserver();
    }
  }
  
  // Create CSS rules to ensure proper styling
  function addEmergencyCSSRules() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .game-area {
        background-image: url('${MAP_BACKGROUND}') !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        width: 100% !important;
        height: 100% !important;
        position: relative !important;
      }
      
      .buildings {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 10 !important;
      }
      
      .building {
        position: absolute !important;
        transform: translate(-50%, -50%) !important;
        min-width: 40px !important;
        min-height: 40px !important;
        cursor: pointer !important;
        pointer-events: auto !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
        z-index: 20 !important;
      }
      
      .building img {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
      }
      
      .building[data-owner="player"] {
        filter: drop-shadow(0 0 3px blue) !important;
      }
      
      .building[data-owner="enemy"] {
        filter: drop-shadow(0 0 3px red) !important;
      }
      
      .building[data-owner="neutral"] {
        filter: drop-shadow(0 0 3px gray) !important;
      }
    `;
    document.head.appendChild(styleElement);
    console.log('[GAME_FIX] Added emergency CSS rules');
  }
  
  // Setup mutation observer to watch for DOM changes
  function setupMutationObserver() {
    if (!window.MutationObserver) {
      console.log('[GAME_FIX] MutationObserver not supported');
      return;
    }
    
    const observer = new MutationObserver((mutations) => {
      let shouldFix = false;
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          // New nodes were added, check if any are relevant to us
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) { // Element node
              const elem = node as Element;
              if (elem.classList && 
                  (elem.classList.contains('game-area') || 
                   elem.classList.contains('building') ||
                   elem.querySelector('.game-area') ||
                   elem.querySelector('.building'))) {
                shouldFix = true;
                break;
              }
            }
          }
        }
      });
      
      if (shouldFix) {
        console.log('[GAME_FIX] DOM changed, reapplying fixes');
        attemptGameFix();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('[GAME_FIX] MutationObserver setup complete');
  }
  
  // Add a click event handler to the document to log clicks
  document.addEventListener('click', function(e) {
    const clickedElement = e.target as HTMLElement;
    
    // Check if we clicked on a building or its child
    let buildingElement = clickedElement.closest('.building');
    if (buildingElement) {
      const buildingId = buildingElement.getAttribute('data-id');
      const owner = buildingElement.getAttribute('data-owner');
      console.log(`[GAME_FIX] Building clicked: ${buildingId} (owner: ${owner})`);
    }
  }, true);
  
  // Start fixing
  addEmergencyCSSRules();
  attemptGameFix();
  
  console.log('[GAME_FIX] Emergency game fixes initialized');
})(); 