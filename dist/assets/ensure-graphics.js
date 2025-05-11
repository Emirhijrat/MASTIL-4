(function() {
  // Periodically check for buildings that need graphic updates
  console.log('[Ensure Graphics] Script loaded');
  
  // Run every 2 seconds to continuously check for buildings that need graphics
  setInterval(function() {
    const allBuildings = document.querySelectorAll('.building');
    
    if (allBuildings.length === 0) {
      console.log('[Ensure Graphics] No buildings found yet');
      return;
    }
    
    let needsUpdate = false;
    
    allBuildings.forEach(building => {
      const visualContainer = building.querySelector('.relative.w-full.h-full');
      if (!visualContainer) return;
      
      // Check if this building has any SVG content
      const svg = visualContainer.querySelector('svg');
      if (!svg) {
        needsUpdate = true;
        console.log('[Ensure Graphics] Found building without SVG graphics:', building.getAttribute('data-id'));
      }
    });
    
    if (needsUpdate) {
      console.log('[Ensure Graphics] Some buildings need updates, triggering replace-graphics.js');
      // Force the replace-graphics script to run
      const event = new Event('force-graphics-update');
      document.dispatchEvent(event);
    }
  }, 2000);
  
  // Listen for the force-graphics-update event
  document.addEventListener('force-graphics-update', function() {
    if (typeof replaceGraphics === 'function') {
      console.log('[Ensure Graphics] Calling replaceGraphics directly');
      replaceGraphics();
    } else {
      console.log('[Ensure Graphics] replaceGraphics function not accessible, triggering click on debug button');
      const debugButton = document.querySelector('button[data-action="replace-graphics"]');
      if (debugButton) {
        debugButton.click();
      } else {
        console.log('[Ensure Graphics] Debug button not found, cannot force graphics update');
      }
    }
  });
})(); 