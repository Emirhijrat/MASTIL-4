document.addEventListener('DOMContentLoaded', function() {
  // Create a style element to add CSS variables if needed
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --mastil-neutral: #64748B;
      --mastil-neutral-light: #94A3B8;
      --mastil-neutral-dark: #475569;
      --mastil-source: #10B981;
      --mastil-target: #7C3AED;
    }
    
    @keyframes pulseSource {
      0%, 100% {
        filter: drop-shadow(0 0 8px var(--mastil-source));
      }
      50% {
        filter: drop-shadow(0 0 16px var(--mastil-source));
      }
    }
    
    @keyframes pulseTarget {
      0%, 100% {
        filter: drop-shadow(0 0 8px var(--mastil-target));
      }
      50% {
        filter: drop-shadow(0 0 16px var(--mastil-target));
      }
    }
    
    .building.building-highlight-source {
      transform: scale(1.1);
      z-index: 10;
      animation: pulseSource 1.5s ease-in-out;
    }
    
    .building.building-highlight-target {
      transform: scale(1.1);
      z-index: 10;
      animation: pulseTarget 1.5s ease-in-out;
    }
    
    .animate-pulse-source {
      animation: pulseSource 1.5s ease-in-out;
    }
    
    .animate-pulse-target {
      animation: pulseTarget 1.5s ease-in-out;
    }
  `;
  document.head.appendChild(style);

  // Wait for React to initialize the app
  setTimeout(function() {
    // Find the building elements that should be neutral villages
    const buildings = document.querySelectorAll('.building');
    
    // Inject enhanced medieval houses
    buildings.forEach(building => {
      // Check if this is a neutral building based on some attribute or class
      const buildingId = building.getAttribute('data-id');
      if (!buildingId || !buildingId.startsWith) return;
      
      // Neutral buildings typically have 'b' or 'n' or 'h' prefixes
      if (buildingId.startsWith('b') || buildingId.startsWith('n') || buildingId.startsWith('h')) {
        // Try to find any existing neutral building visuals
        const existingSvg = building.querySelector('svg');
        if (existingSvg) {
          // Create enhanced SVG house
          const variation = (buildingId.charCodeAt(1) % 3) + 1;
          
          // Variant 1
          const houseVar1 = `
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <!-- Ground/Base -->
              <ellipse cx="50" cy="82" rx="35" ry="5" fill="var(--mastil-neutral-dark)" opacity="0.2"></ellipse>
              
              <!-- House base -->
              <path d="M 20,80 L 20,40 L 50,20 L 80,40 L 80,80 L 20,80 Z
                       M 35,80 L 35,50 L 45,50 L 45,80 Z
                       M 55,80 L 55,50 L 65,50 L 65,80 Z"
                fill="var(--mastil-neutral)" stroke="var(--mastil-neutral-light)" stroke-width="2"></path>
              
              <!-- Chimney -->
              <path d="M 70,38 L 70,25 L 75,25 L 75,40 Z"
                fill="var(--mastil-neutral-dark)" stroke="var(--mastil-neutral-light)" stroke-width="1"></path>
              
              <!-- Roof texture -->
              <path d="M 20,40 L 50,20 L 80,40" 
                fill="none" stroke="var(--mastil-neutral-light)" stroke-width="1" stroke-dasharray="2,2"></path>
                
              <!-- Windows -->
              <rect x="34" y="49" width="12" height="12" 
                fill="var(--mastil-neutral-light)" opacity="0.2"
                stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></rect>
              <line x1="40" y1="49" x2="40" y2="61" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              <line x1="34" y1="55" x2="46" y2="55" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              
              <rect x="54" y="49" width="12" height="12" 
                fill="var(--mastil-neutral-light)" opacity="0.2"
                stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></rect>
              <line x1="60" y1="49" x2="60" y2="61" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              <line x1="54" y1="55" x2="66" y2="55" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              
              <!-- Door -->
              <rect x="43" y="60" width="14" height="20"
                fill="var(--mastil-neutral-dark)" opacity="0.6"
                stroke="var(--mastil-neutral-dark)" stroke-width="0.7"></rect>
              <circle cx="46" cy="70" r="1" fill="var(--mastil-neutral-light)"></circle>
              
              <!-- Wooden beams -->
              <line x1="20" y1="60" x2="80" y2="60" 
                stroke="var(--mastil-neutral-dark)" stroke-width="1" opacity="0.7"></line>
              
              <!-- Decorations -->
              <rect x="33" y="60" width="14" height="3" 
                fill="#84CC16" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></rect>
              <rect x="53" y="60" width="14" height="3" 
                fill="#84CC16" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></rect>
              <path d="M 73,25 C 76,20 74,15 70,12 C 72,10 74,8 73,5" 
                fill="none" stroke="#94A3B8" stroke-width="1" stroke-dasharray="1,2"></path>
            </svg>
          `;
          
          // Variant 2
          const houseVar2 = `
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <!-- Ground/Base -->
              <ellipse cx="50" cy="82" rx="35" ry="5" fill="var(--mastil-neutral-dark)" opacity="0.2"></ellipse>
              
              <!-- House base -->
              <path d="M 25,80 L 25,35 L 50,15 L 75,35 L 75,80 L 25,80 Z
                       M 40,80 L 40,45 L 60,45 L 60,80 Z
                       M 45,45 L 45,35 L 55,35 L 55,45 Z"
                fill="var(--mastil-neutral)" stroke="var(--mastil-neutral-light)" stroke-width="2"></path>
              
              <!-- Chimney -->
              <path d="M 65,33 L 65,20 L 70,20 L 70,35 Z"
                fill="var(--mastil-neutral-dark)" stroke="var(--mastil-neutral-light)" stroke-width="1"></path>
              
              <!-- Roof texture -->
              <path d="M 20,40 L 50,20 L 80,40" 
                fill="none" stroke="var(--mastil-neutral-light)" stroke-width="1" stroke-dasharray="2,2"></path>
                
              <!-- Windows -->
              <rect x="34" y="49" width="12" height="12" 
                fill="var(--mastil-neutral-light)" opacity="0.2"
                stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></rect>
              <line x1="40" y1="49" x2="40" y2="61" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              <line x1="34" y1="55" x2="46" y2="55" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              
              <rect x="54" y="49" width="12" height="12" 
                fill="var(--mastil-neutral-light)" opacity="0.2"
                stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></rect>
              <line x1="60" y1="49" x2="60" y2="61" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              <line x1="54" y1="55" x2="66" y2="55" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              
              <!-- Door -->
              <rect x="43" y="60" width="14" height="20"
                fill="var(--mastil-neutral-dark)" opacity="0.6"
                stroke="var(--mastil-neutral-dark)" stroke-width="0.7"></rect>
              <circle cx="46" cy="70" r="1" fill="var(--mastil-neutral-light)"></circle>
              
              <!-- Wooden beams -->
              <line x1="25" y1="55" x2="75" y2="55" 
                stroke="var(--mastil-neutral-dark)" stroke-width="1" opacity="0.7"></line>
              
              <!-- Decorations -->
              <path d="M 50,15 L 50,5 L 57,8 L 50,11 Z" fill="#EF4444"></path>
              <line x1="50" y1="5" x2="50" y2="15" stroke="var(--mastil-neutral-dark)" stroke-width="0.7"></line>
              <path d="M 15,80 L 15,70 L 20,70 L 25,70 L 25,80" 
                stroke="var(--mastil-neutral-dark)" stroke-width="1" fill="none"></path>
              <line x1="15" y1="75" x2="25" y2="75" stroke="var(--mastil-neutral-dark)" stroke-width="1"></line>
            </svg>
          `;
          
          // Variant 3
          const houseVar3 = `
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <!-- Ground/Base -->
              <ellipse cx="50" cy="82" rx="35" ry="5" fill="var(--mastil-neutral-dark)" opacity="0.2"></ellipse>
              
              <!-- House base -->
              <path d="M 30,80 L 30,30 L 50,10 L 70,30 L 70,80 L 30,80 Z
                       M 35,80 L 35,40 L 45,40 L 45,80 Z
                       M 55,80 L 55,40 L 65,40 L 65,80 Z
                       M 45,40 L 45,30 L 55,30 L 55,40 Z"
                fill="var(--mastil-neutral)" stroke="var(--mastil-neutral-light)" stroke-width="2"></path>
              
              <!-- Chimney -->
              <path d="M 63,28 L 63,15 L 67,15 L 67,30 Z"
                fill="var(--mastil-neutral-dark)" stroke="var(--mastil-neutral-light)" stroke-width="1"></path>
              
              <!-- Roof texture -->
              <path d="M 20,40 L 50,20 L 80,40" 
                fill="none" stroke="var(--mastil-neutral-light)" stroke-width="1" stroke-dasharray="2,2"></path>
                
              <!-- Windows -->
              <rect x="34" y="49" width="12" height="12" 
                fill="var(--mastil-neutral-light)" opacity="0.2"
                stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></rect>
              <line x1="40" y1="49" x2="40" y2="61" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              <line x1="34" y1="55" x2="46" y2="55" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              
              <rect x="54" y="49" width="12" height="12" 
                fill="var(--mastil-neutral-light)" opacity="0.2"
                stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></rect>
              <line x1="60" y1="49" x2="60" y2="61" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              <line x1="54" y1="55" x2="66" y2="55" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              
              <!-- Door -->
              <rect x="43" y="60" width="14" height="20"
                fill="var(--mastil-neutral-dark)" opacity="0.6"
                stroke="var(--mastil-neutral-dark)" stroke-width="0.7"></rect>
              <circle cx="46" cy="70" r="1" fill="var(--mastil-neutral-light)"></circle>
              
              <!-- Wooden beams -->
              <line x1="30" y1="50" x2="70" y2="50" stroke="var(--mastil-neutral-dark)" stroke-width="1" opacity="0.7"></line>
              <line x1="30" y1="70" x2="70" y2="70" stroke="var(--mastil-neutral-dark)" stroke-width="1" opacity="0.7"></line>
              
              <!-- Decorations -->
              <circle cx="20" cy="70" r="5" fill="var(--mastil-neutral-light)" 
                stroke="var(--mastil-neutral-dark)" stroke-width="1"></circle>
              <path d="M 15,70 L 25,70" stroke="var(--mastil-neutral-dark)" stroke-width="1"></path>
              <path d="M 20,65 L 20,63 L 17,60 L 23,60 L 20,63" 
                stroke="var(--mastil-neutral-dark)" stroke-width="0.7" fill="var(--mastil-neutral-light)"></path>
              <line x1="50" y1="10" x2="50" y2="5" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
              <path d="M 49,5 L 51,5 L 50,3 Z" fill="var(--mastil-neutral-light)"></path>
              <line x1="48" y1="5" x2="52" y2="5" stroke="var(--mastil-neutral-dark)" stroke-width="0.5"></line>
            </svg>
          `;
          
          // Apply the appropriate house variant
          const variants = [houseVar1, houseVar2, houseVar3];
          const variantIndex = (variation - 1) % 3;
          
          // Find the container element for the visual
          const visualContainer = building.querySelector('.relative.w-full.h-full');
          if (visualContainer) {
            visualContainer.innerHTML = variants[variantIndex];
          }
        }
      }
    });
    
    console.log('[Enhanced Graphics] Medieval houses have been applied to neutral fields');
  }, 1000); // Adjust timing as needed
}); 