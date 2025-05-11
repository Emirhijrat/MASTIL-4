document.addEventListener('DOMContentLoaded', function() {
  // Wait for React to initialize the app
  setTimeout(function() {
    console.log('[Test Animation] Script loaded, waiting for game initialization');
    
    // Function to simulate an attack by highlighting source and target buildings
    const simulateAttack = () => {
      const buildings = document.querySelectorAll('.building');
      if (!buildings || buildings.length < 2) {
        console.log('[Test Animation] No buildings found');
        return;
      }
      
      // Find potential source (player building) and target (enemy or neutral)
      let sourceBuilding = null;
      let targetBuilding = null;
      
      buildings.forEach(building => {
        const id = building.getAttribute('data-id');
        // Try to find a player building as source
        if (id && id.startsWith('p')) {
          sourceBuilding = sourceBuilding || building;
        } 
        // Try to find a non-player building as target
        else if (id && (id.startsWith('e') || id.startsWith('n'))) {
          targetBuilding = targetBuilding || building;
        }
      });
      
      if (!sourceBuilding || !targetBuilding) {
        console.log('[Test Animation] Could not find suitable source and target buildings');
        return;
      }
      
      console.log(`[Test Animation] Simulating attack from ${sourceBuilding.getAttribute('data-id')} to ${targetBuilding.getAttribute('data-id')}`);
      
      // Add highlight classes to source and target
      sourceBuilding.classList.add('building-highlight-source');
      targetBuilding.classList.add('building-highlight-target');
      
      // Calculate center points for arrow and dots
      const sourceRect = sourceBuilding.getBoundingClientRect();
      const targetRect = targetBuilding.getBoundingClientRect();
      
      const sourceX = sourceRect.left + sourceRect.width / 2;
      const sourceY = sourceRect.top + sourceRect.height / 2;
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;
      
      // Create a container for our animation
      const animContainer = document.createElement('div');
      animContainer.style.position = 'absolute';
      animContainer.style.top = '0';
      animContainer.style.left = '0';
      animContainer.style.width = '100%';
      animContainer.style.height = '100%';
      animContainer.style.pointerEvents = 'none';
      animContainer.style.zIndex = '50';
      document.body.appendChild(animContainer);
      
      // Create arrow element
      const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrowSvg.setAttribute('width', '100%');
      arrowSvg.setAttribute('height', '100%');
      arrowSvg.style.position = 'absolute';
      arrowSvg.style.top = '0';
      arrowSvg.style.left = '0';
      arrowSvg.style.pointerEvents = 'none';
      
      // Create arrow marker
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      const markerId = 'arrowhead-test';
      marker.setAttribute('id', markerId);
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '10');
      marker.setAttribute('refX', '5');
      marker.setAttribute('refY', '5');
      marker.setAttribute('orient', 'auto');
      
      // Create arrowhead path
      const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrowPath.setAttribute('d', 'M0,0 L10,5 L0,10 z');
      arrowPath.setAttribute('fill', 'var(--mastil-player, #2563eb)');
      
      // Add arrow line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sourceX);
      line.setAttribute('y1', sourceY);
      line.setAttribute('x2', targetX);
      line.setAttribute('y2', targetY);
      line.setAttribute('stroke', 'var(--mastil-player, #2563eb)');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('marker-end', `url(#${markerId})`);
      
      // Construct the SVG
      marker.appendChild(arrowPath);
      defs.appendChild(marker);
      arrowSvg.appendChild(defs);
      arrowSvg.appendChild(line);
      animContainer.appendChild(arrowSvg);
      
      // Add dots following the path
      const dotsSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      dotsSvg.setAttribute('width', '100%');
      dotsSvg.setAttribute('height', '100%');
      dotsSvg.style.position = 'absolute';
      dotsSvg.style.top = '0';
      dotsSvg.style.left = '0';
      dotsSvg.style.pointerEvents = 'none';
      
      // Create path for the dots to follow
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const pathId = 'test-path';
      path.setAttribute('id', pathId);
      path.setAttribute('d', `M ${sourceX},${sourceY} L ${targetX},${targetY}`);
      path.setAttribute('fill', 'none');
      path.style.visibility = 'hidden';
      
      dotsSvg.appendChild(path);
      
      // Add dots that follow the path
      const numDots = 10; // Number of dots to create
      for (let i = 0; i < numDots; i++) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', '3');
        dot.setAttribute('fill', 'var(--mastil-player, #2563eb)');
        
        // Create the animation
        const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        anim.setAttribute('dur', '4s');
        anim.setAttribute('begin', `${i * 0.2}s`); // Stagger the starts
        anim.setAttribute('fill', 'freeze');
        anim.setAttribute('path', `M ${sourceX},${sourceY} L ${targetX},${targetY}`);
        
        dot.appendChild(anim);
        dotsSvg.appendChild(dot);
      }
      
      animContainer.appendChild(dotsSvg);
      
      // Remove highlights and animations after a delay
      setTimeout(() => {
        sourceBuilding.classList.remove('building-highlight-source');
        targetBuilding.classList.remove('building-highlight-target');
        document.body.removeChild(animContainer);
        console.log('[Test Animation] Animation completed and cleaned up');
      }, 6000); // Clean up after 6 seconds
    };
    
    // Add a debug button to trigger the test animation
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Test Attack Animation';
    debugButton.style.position = 'fixed';
    debugButton.style.zIndex = '9999';
    debugButton.style.bottom = '10px';
    debugButton.style.right = '10px';
    debugButton.style.padding = '8px 12px';
    debugButton.style.backgroundColor = '#334155';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '4px';
    debugButton.style.cursor = 'pointer';
    
    debugButton.addEventListener('click', () => {
      simulateAttack();
    });
    
    document.body.appendChild(debugButton);
    
    console.log('[Test Animation] Test script ready');
  }, 2000);
}); 