document.addEventListener('DOMContentLoaded', function() {
  console.log('[Graphics Replacer] Script loaded, waiting for game initialization');
  
  // Set up CSS variables for styling
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
      --mastil-source: #10B981;
      --mastil-target: #7C3AED;
    }
  `;
  document.head.appendChild(style);

  // Make replaceGraphics globally accessible for other scripts
  window.replaceGraphics = function() {
    console.log('[Graphics Replacer] Searching for buildings to update...');
    const buildings = document.querySelectorAll('.building');
    
    if (!buildings || buildings.length === 0) {
      console.log('[Graphics Replacer] No buildings found yet, retrying in 1 second...');
      setTimeout(window.replaceGraphics, 1000);
      return;
    }
    
    console.log(`[Graphics Replacer] Found ${buildings.length} buildings to update`);
    
    buildings.forEach(building => {
      const buildingId = building.getAttribute('data-id');
      if (!buildingId) return;
      
      // Determine if it's player, enemy, or neutral
      let owner = 'neutral';
      if (buildingId.startsWith('p')) {
        owner = 'player';
      } else if (buildingId.startsWith('e')) {
        owner = 'enemy';
      }
      
      // Find or create the visual container
      let visualContainer = building.querySelector('.relative.w-full.h-full');
      if (!visualContainer) {
        visualContainer = document.createElement('div');
        visualContainer.className = 'relative w-full h-full flex items-center justify-center';
        building.appendChild(visualContainer);
      }
      
      // Clear existing content
      visualContainer.innerHTML = '';
      
      if (owner === 'neutral') {
        // Use a deterministic variation based on the building's ID
        const variation = ((buildingId.charCodeAt(1) || 0) % 3) + 1;
        visualContainer.innerHTML = generateNeutralHouse(variation);
      } else {
        visualContainer.innerHTML = generateTower(owner);
      }
    });
    
    console.log('[Graphics Replacer] All buildings updated with medieval graphics!');
  };
  
  function generateTower(owner) {
    const primaryColor = owner === 'player' ? 'var(--mastil-player)' : 'var(--mastil-enemy)';
    const secondaryColor = owner === 'player' ? 'var(--mastil-player-light)' : 'var(--mastil-enemy-light)';
    
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full">
        <!-- Main tower body -->
        <rect
          x="30"
          y="25"
          width="40"
          height="55"
          fill="${primaryColor}"
          stroke="${secondaryColor}"
          stroke-width="2"
        />
        
        <!-- Tower top (crenellations) -->
        <path
          d="M 25,25 L 25,20 L 30,20 L 30,25 L 40,25 L 40,20 L 45,20 L 45,25 L 55,25 L 55,20 L 60,20 L 60,25 L 70,25 L 70,20 L 75,20 L 75,25"
          fill="${primaryColor}"
          stroke="${secondaryColor}"
          stroke-width="2"
        />
        
        <!-- Tower base -->
        <rect
          x="25"
          y="75"
          width="50"
          height="5"
          fill="${primaryColor}"
          stroke="${secondaryColor}"
          stroke-width="2"
        />
        
        <!-- Window -->
        <rect
          x="45"
          y="35"
          width="10"
          height="15"
          fill="${secondaryColor}"
          opacity="0.5"
        />
        
        <!-- Door -->
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
  
  function generateNeutralHouse(variation) {
    let housePath = '';
    let chimneyPath = '';
    let decorations = '';
    
    // House path based on variation
    switch (variation) {
      case 1:
        housePath = `
          M 20,80 
          L 20,40 
          L 50,20 
          L 80,40 
          L 80,80 
          L 20,80 
          Z
          M 35,80 
          L 35,50 
          L 45,50 
          L 45,80 
          Z
          M 55,80 
          L 55,50 
          L 65,50 
          L 65,80 
          Z
        `;
        chimneyPath = "M 70,38 L 70,25 L 75,25 L 75,40 Z";
        decorations = `
          <!-- Flower boxes under windows -->
          <rect x="33" y="60" width="14" height="3" fill="#84CC16" stroke="var(--mastil-neutral-dark)" stroke-width="0.5" />
          <rect x="53" y="60" width="14" height="3" fill="#84CC16" stroke="var(--mastil-neutral-dark)" stroke-width="0.5" />
          
          <!-- Chimney smoke -->
          <path d="M 73,25 C 76,20 74,15 70,12 C 72,10 74,8 73,5" fill="none" stroke="#94A3B8" stroke-width="1" stroke-dasharray="1,2" />
        `;
        break;
        
      case 2:
        housePath = `
          M 25,80 
          L 25,35 
          L 50,15 
          L 75,35 
          L 75,80 
          L 25,80 
          Z
          M 40,80 
          L 40,45 
          L 60,45 
          L 60,80 
          Z
          M 45,45 
          L 45,35 
          L 55,35 
          L 55,45 
          Z
        `;
        chimneyPath = "M 65,33 L 65,20 L 70,20 L 70,35 Z";
        decorations = `
          <!-- Small flag on roof -->
          <path d="M 50,15 L 50,5 L 57,8 L 50,11 Z" fill="#EF4444" />
          <line x1="50" y1="5" x2="50" y2="15" stroke="var(--mastil-neutral-dark)" stroke-width="0.7" />
          
          <!-- Small fence -->
          <path d="M 15,80 L 15,70 L 20,70 L 25,70 L 25,80" stroke="var(--mastil-neutral-dark)" stroke-width="1" fill="none" />
          <line x1="15" y1="75" x2="25" y2="75" stroke="var(--mastil-neutral-dark)" stroke-width="1" />
        `;
        break;
        
      case 3:
        housePath = `
          M 30,80 
          L 30,30 
          L 50,10 
          L 70,30 
          L 70,80 
          L 30,80 
          Z
          M 35,80 
          L 35,40 
          L 45,40 
          L 45,80 
          Z
          M 55,80 
          L 55,40 
          L 65,40 
          L 65,80 
          Z
          M 45,40 
          L 45,30 
          L 55,30 
          L 55,40 
          Z
        `;
        chimneyPath = "M 63,28 L 63,15 L 67,15 L 67,30 Z";
        decorations = `
          <!-- Well next to house -->
          <circle cx="20" cy="70" r="5" fill="var(--mastil-neutral-light)" stroke="var(--mastil-neutral-dark)" stroke-width="1" />
          <path d="M 15,70 L 25,70" stroke="var(--mastil-neutral-dark)" stroke-width="1" />
          <path d="M 20,65 L 20,63 L 17,60 L 23,60 L 20,63" stroke="var(--mastil-neutral-dark)" stroke-width="0.7" fill="var(--mastil-neutral-light)" />
          
          <!-- Weathervane -->
          <line x1="50" y1="10" x2="50" y2="5" stroke="var(--mastil-neutral-dark)" stroke-width="0.5" />
          <path d="M 49,5 L 51,5 L 50,3 Z" fill="var(--mastil-neutral-light)" />
          <line x1="48" y1="5" x2="52" y2="5" stroke="var(--mastil-neutral-dark)" stroke-width="0.5" />
        `;
        break;
    }
    
    return `
      <svg viewBox="0 0 100 100" class="w-full h-full">
        <!-- Ground/Base -->
        <ellipse cx="50" cy="82" rx="35" ry="5" fill="var(--mastil-neutral-dark)" opacity="0.2" />
        
        <!-- House base -->
        <path
          d="${housePath}"
          fill="var(--mastil-neutral)"
          stroke="var(--mastil-neutral-light)"
          stroke-width="2"
        />
        
        <!-- Chimney -->
        <path
          d="${chimneyPath}"
          fill="var(--mastil-neutral-dark)"
          stroke="var(--mastil-neutral-light)"
          stroke-width="1"
        />
        
        <!-- Roof texture -->
        <path
          d="M 20,40 L 50,20 L 80,40"
          fill="none"
          stroke="var(--mastil-neutral-light)"
          stroke-width="1"
          stroke-dasharray="2,2"
        />
        
        <!-- Window details with frames -->
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
        <line x1="40" y1="49" x2="40" y2="61" stroke="var(--mastil-neutral-dark)" stroke-width="0.5" />
        <line x1="34" y1="55" x2="46" y2="55" stroke="var(--mastil-neutral-dark)" stroke-width="0.5" />
        
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
        <line x1="60" y1="49" x2="60" y2="61" stroke="var(--mastil-neutral-dark)" stroke-width="0.5" />
        <line x1="54" y1="55" x2="66" y2="55" stroke="var(--mastil-neutral-dark)" stroke-width="0.5" />
        
        <!-- Door with details -->
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
        <circle cx="46" cy="70" r="1" fill="var(--mastil-neutral-light)" />
        
        <!-- Wooden beam details on house -->
        <line x1="20" y1="60" x2="80" y2="60" stroke="var(--mastil-neutral-dark)" stroke-width="1" opacity="0.7" />
        
        ${decorations}
      </svg>
    `;
  }

  // Run immediately and then set an interval to check periodically
  window.replaceGraphics();
  
  // Activate when DOM updates occur (which might be when React renders new buildings)
  const observer = new MutationObserver(function(mutations) {
    // If we see changes to the DOM, trigger a graphics update
    window.replaceGraphics();
  });
  
  // Start observing the body with the configured parameters
  observer.observe(document.body, { 
    childList: true,
    subtree: true
  });
  
  // Also run it when a user clicks on something (game might be re-rendering buildings)
  document.addEventListener('click', function() {
    setTimeout(window.replaceGraphics, 100);
  });
  
  // Create a debug button to manually trigger the graphics replacement
  const debugButton = document.createElement('button');
  debugButton.textContent = 'Force Replace Graphics';
  debugButton.setAttribute('data-action', 'replace-graphics');
  debugButton.style.position = 'fixed';
  debugButton.style.zIndex = '9999';
  debugButton.style.bottom = '60px'; // Position it above the test animation button
  debugButton.style.right = '10px';
  debugButton.style.padding = '8px 12px';
  debugButton.style.backgroundColor = '#334155';
  debugButton.style.color = 'white';
  debugButton.style.border = 'none';
  debugButton.style.borderRadius = '4px';
  debugButton.style.cursor = 'pointer';
  
  debugButton.addEventListener('click', window.replaceGraphics);
  document.body.appendChild(debugButton);
}); 