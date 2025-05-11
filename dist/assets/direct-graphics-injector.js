document.addEventListener('DOMContentLoaded', function() {
  console.log('[Direct Graphics Injector] Script loaded');
  
  // Wait for the game to finish loading
  setTimeout(function() {
    if (typeof window.replaceGraphics === 'function') {
      console.log('[Direct Graphics Injector] replaceGraphics function exists, using that');
      window.replaceGraphics();
      return;
    }
    
    console.log('[Direct Graphics Injector] No replaceGraphics function found, using direct injection');
    
    // These styles need to be added to the document for the SVGs to render properly
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --mastil-player: #2563eb;
        --mastil-player-light: #60a5fa;
        --mastil-enemy: #dc2626;
        --mastil-enemy-light: #f87171;
        --mastil-neutral: #64748B;
        --mastil-neutral-light: #94A3B8;
        --mastil-neutral-dark: #475569;
      }
      
      .building-graphics-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 5;
      }
      
      .building-graphics {
        position: absolute;
        width: 40px;
        height: 40px;
        transform: translate(-50%, -50%);
      }
      
      .building-graphics.player {
        filter: drop-shadow(0 0 3px #2563eb);
      }
      
      .building-graphics.enemy {
        filter: drop-shadow(0 0 3px #dc2626);
      }
    `;
    document.head.appendChild(style);
    
    // Create a container for all our graphics
    const graphicsContainer = document.createElement('div');
    graphicsContainer.className = 'building-graphics-container';
    document.body.appendChild(graphicsContainer);
    
    // Helper function to get tower SVG
    function getTowerSVG(owner) {
      const primaryColor = owner === 'player' ? 'var(--mastil-player)' : 'var(--mastil-enemy)';
      const secondaryColor = owner === 'player' ? 'var(--mastil-player-light)' : 'var(--mastil-enemy-light)';
      
      return `
        <svg viewBox="0 0 100 100" width="40" height="40">
          <rect
            x="30"
            y="25"
            width="40"
            height="55"
            fill="${primaryColor}"
            stroke="${secondaryColor}"
            stroke-width="2"
          />
          <path
            d="M 25,25 L 25,20 L 30,20 L 30,25 L 40,25 L 40,20 L 45,20 L 45,25 L 55,25 L 55,20 L 60,20 L 60,25 L 70,25 L 70,20 L 75,20 L 75,25"
            fill="${primaryColor}"
            stroke="${secondaryColor}"
            stroke-width="2"
          />
          <rect
            x="25"
            y="75"
            width="50"
            height="5"
            fill="${primaryColor}"
            stroke="${secondaryColor}"
            stroke-width="2"
          />
          <rect
            x="45"
            y="35"
            width="10"
            height="15"
            fill="${secondaryColor}"
            opacity="0.5"
          />
          <rect
            x="40"
            y="60"
            width="20"
            height="20"
            fill="${secondaryColor}"
            opacity="0.7"
          />
          <path
            d="M 50,60 L 50,80"
            stroke="${primaryColor}"
            stroke-width="1"
          />
        </svg>
      `;
    }
    
    // Helper function to get house SVG
    function getHouseSVG(variation) {
      let housePath = '';
      let chimneyPath = '';
      
      // Choose house variation
      switch (variation) {
        case 1:
          housePath = `
            M 20,80 L 20,40 L 50,20 L 80,40 L 80,80 L 20,80 Z
            M 35,80 L 35,50 L 45,50 L 45,80 Z
            M 55,80 L 55,50 L 65,50 L 65,80 Z
          `;
          chimneyPath = "M 70,38 L 70,25 L 75,25 L 75,40 Z";
          break;
        case 2:
          housePath = `
            M 25,80 L 25,35 L 50,15 L 75,35 L 75,80 L 25,80 Z
            M 40,80 L 40,45 L 60,45 L 60,80 Z
            M 45,45 L 45,35 L 55,35 L 55,45 Z
          `;
          chimneyPath = "M 65,33 L 65,20 L 70,20 L 70,35 Z";
          break;
        default:
          housePath = `
            M 30,80 L 30,30 L 50,10 L 70,30 L 70,80 L 30,80 Z
            M 35,80 L 35,40 L 45,40 L 45,80 Z
            M 55,80 L 55,40 L 65,40 L 65,80 Z
            M 45,40 L 45,30 L 55,30 L 55,40 Z
          `;
          chimneyPath = "M 63,28 L 63,15 L 67,15 L 67,30 Z";
      }
      
      return `
        <svg viewBox="0 0 100 100" width="40" height="40">
          <ellipse cx="50" cy="82" rx="35" ry="5" fill="var(--mastil-neutral-dark)" opacity="0.2" />
          <path
            d="${housePath}"
            fill="var(--mastil-neutral)"
            stroke="var(--mastil-neutral-light)"
            stroke-width="2"
          />
          <path
            d="${chimneyPath}"
            fill="var(--mastil-neutral-dark)"
            stroke="var(--mastil-neutral-light)"
            stroke-width="1"
          />
          <path
            d="M 20,40 L 50,20 L 80,40"
            fill="none"
            stroke="var(--mastil-neutral-light)"
            stroke-width="1"
            stroke-dasharray="2,2"
          />
          <rect
            x="34"
            y="49"
            width="12"
            height="12"
            fill="var(--mastil-neutral-light)"
            opacity="0.2"
            stroke="var(--mastil-neutral-dark)"
            stroke-width="0.5"
          />
          <rect
            x="54"
            y="49"
            width="12"
            height="12"
            fill="var(--mastil-neutral-light)"
            opacity="0.2"
            stroke="var(--mastil-neutral-dark)"
            stroke-width="0.5"
          />
          <rect
            x="43"
            y="60"
            width="14"
            height="20"
            fill="var(--mastil-neutral-dark)"
            opacity="0.6"
            stroke="var(--mastil-neutral-dark)"
            stroke-width="0.7"
          />
        </svg>
      `;
    }
    
    // Function to find all buildings and inject graphics
    function injectGraphics() {
      // Find all buildings in the DOM
      const buildings = document.querySelectorAll('.building');
      if (!buildings || buildings.length === 0) {
        console.log('[Direct Graphics Injector] No buildings found yet, will try again later');
        return;
      }
      
      console.log(`[Direct Graphics Injector] Found ${buildings.length} buildings to process`);
      
      // Clear previous graphics
      graphicsContainer.innerHTML = '';
      
      // Loop through each building and add graphics
      buildings.forEach(building => {
        const buildingId = building.getAttribute('data-id');
        if (!buildingId) return;
        
        const rect = building.getBoundingClientRect();
        const centerX = window.scrollX + rect.left + (rect.width / 2);
        const centerY = window.scrollY + rect.top + (rect.height / 2);
        
        // Determine building type based on ID
        let owner = 'neutral';
        let variation = 1;
        
        if (buildingId.startsWith('p')) {
          owner = 'player';
        } else if (buildingId.startsWith('e')) {
          owner = 'enemy';
        } else {
          // For neutral buildings, use a consistent variation based on ID
          variation = (buildingId.charCodeAt(1) % 3) + 1 || 1;
        }
        
        // Create graphic element
        const graphicElement = document.createElement('div');
        graphicElement.className = `building-graphics ${owner}`;
        graphicElement.style.left = `${centerX}px`;
        graphicElement.style.top = `${centerY}px`;
        
        // Add SVG based on building type
        if (owner === 'neutral') {
          graphicElement.innerHTML = getHouseSVG(variation);
        } else {
          graphicElement.innerHTML = getTowerSVG(owner);
        }
        
        // Add to container
        graphicsContainer.appendChild(graphicElement);
      });
      
      console.log('[Direct Graphics Injector] Graphics injected successfully');
    }
    
    // Run initial injection after a delay
    setTimeout(injectGraphics, 1000);
    
    // Set up an interval to periodically check and update graphics
    setInterval(injectGraphics, 2000);
    
    // Also update when user interacts with the game
    document.addEventListener('click', function() {
      setTimeout(injectGraphics, 500);
    });
    
    // Add a button to force graphics injection
    const forceButton = document.createElement('button');
    forceButton.textContent = 'Force Direct Graphics';
    forceButton.style.position = 'fixed';
    forceButton.style.zIndex = '9999';
    forceButton.style.bottom = '110px'; // Above the other buttons
    forceButton.style.right = '10px';
    forceButton.style.padding = '8px 12px';
    forceButton.style.backgroundColor = '#9d174d'; // Different color to distinguish
    forceButton.style.color = 'white';
    forceButton.style.border = 'none';
    forceButton.style.borderRadius = '4px';
    forceButton.style.cursor = 'pointer';
    
    forceButton.addEventListener('click', injectGraphics);
    document.body.appendChild(forceButton);
  }, 3000); // Wait a bit longer for the game to load
}); 