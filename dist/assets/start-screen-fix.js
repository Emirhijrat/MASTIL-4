// Script to ensure the Start Screen background is set correctly
(function() {
  console.log('[START_SCREEN] Initializing start screen background updater');
  
  const BACKGROUND_URL = 'https://iili.io/3vSEhLx.png';
  let attemptCount = 0;
  const MAX_ATTEMPTS = 20;
  
  function updateStartScreenBackground() {
    attemptCount++;
    
    if (attemptCount > MAX_ATTEMPTS) {
      console.log('[START_SCREEN] Max attempts reached, stopping background updates');
      return;
    }
    
    console.log('[START_SCREEN] Looking for Start Screen container (attempt ' + attemptCount + ')');
    
    // Find the start screen container
    const startScreenContainers = document.querySelectorAll('.start-screen-container');
    
    if (startScreenContainers.length > 0) {
      console.log('[START_SCREEN] Found', startScreenContainers.length, 'start screen containers');
      
      startScreenContainers.forEach(container => {
        // Find the background div (first child)
        const backgroundDiv = container.querySelector('div:first-child');
        
        if (backgroundDiv) {
          console.log('[START_SCREEN] Found background div, updating background');
          backgroundDiv.style.backgroundImage = `url('${BACKGROUND_URL}')`;
          backgroundDiv.style.backgroundSize = 'cover';
          backgroundDiv.style.backgroundPosition = 'center';
          backgroundDiv.style.backgroundRepeat = 'no-repeat';
          
          // Also directly apply to container as a fallback
          container.style.backgroundColor = '#101820'; // Dark background as fallback
          
          // Ensure the text is legible
          const title = container.querySelector('h1');
          if (title) {
            title.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6)';
            title.style.color = '#FFDB58'; // Gold color
          }
          
          // Adjust the quote
          const quote = container.querySelector('p');
          if (quote) {
            quote.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.9), 2px 2px 4px rgba(0, 0, 0, 0.7)';
            quote.style.color = '#FFE4B5'; // Moccasin color
          }
          
          // Adjust overlay for better contrast
          const overlay = container.querySelector('div:nth-child(2)');
          if (overlay) {
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
          }
          
          // Enhance button styles for better visibility
          const buttons = container.querySelectorAll('button');
          buttons.forEach(button => {
            button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 219, 88, 0.3)';
            button.style.borderColor = '#8B4513';
          });
          
          console.log('[START_SCREEN] Background and styles updated successfully');
        } else {
          console.log('[START_SCREEN] Could not find background div');
        }
      });
    } else {
      console.log('[START_SCREEN] No start screen container found yet, retrying...');
      setTimeout(updateStartScreenBackground, 500);
    }
  }
  
  // Create a CSS rule as an additional approach
  function addBackgroundCSSRule() {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.id = 'start-screen-style';
    styleSheet.innerHTML = `
      .start-screen-container {
        background-color: #101820 !important;
      }
      
      .start-screen-container > div:first-child {
        background-image: url('${BACKGROUND_URL}') !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      }
      
      .start-screen-container h1 {
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6) !important;
        color: #FFDB58 !important;
      }
      
      .start-screen-container p {
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9), 2px 2px 4px rgba(0, 0, 0, 0.7) !important;
        color: #FFE4B5 !important;
      }
      
      .start-screen-container > div:nth-child(2) {
        background-color: rgba(0, 0, 0, 0.4) !important;
      }
      
      .start-screen-container button {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 219, 88, 0.3) !important;
        border-color: #8B4513 !important;
      }
    `;
    document.head.appendChild(styleSheet);
    console.log('[START_SCREEN] Added CSS style rules');
  }
  
  // Observe DOM changes to catch when the start screen appears
  function setupMutationObserver() {
    if (!window.MutationObserver) {
      console.log('[START_SCREEN] MutationObserver not supported');
      return;
    }
    
    const observer = new MutationObserver(function(mutations) {
      let shouldCheck = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          shouldCheck = true;
        }
      });
      
      if (shouldCheck) {
        console.log('[START_SCREEN] DOM changed, checking for start screen');
        updateStartScreenBackground();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('[START_SCREEN] MutationObserver setup complete');
  }
  
  // Start applying background
  addBackgroundCSSRule();
  updateStartScreenBackground();
  setupMutationObserver();
})(); 