// Script to ensure the game background is always set correctly
(function() {
  console.log('[BACKGROUND] Initializing game background manager');
  
  const BACKGROUND_URL = 'https://iili.io/3vhdSja.png';
  let attemptCount = 0;
  const MAX_ATTEMPTS = 20;
  
  function applyBackgroundToElements() {
    attemptCount++;
    
    if (attemptCount > MAX_ATTEMPTS) {
      console.log('[BACKGROUND] Max attempts reached, stopping background application');
      return;
    }
    
    console.log('[BACKGROUND] Applying background image (attempt ' + attemptCount + ')');
    
    // Query for game area elements
    const gameAreaElements = document.querySelectorAll('.game-area');
    
    if (gameAreaElements.length > 0) {
      console.log('[BACKGROUND] Found', gameAreaElements.length, 'game area elements');
      
      gameAreaElements.forEach(element => {
        // Check if background is already set correctly
        const currentBg = element.style.backgroundImage;
        if (currentBg && currentBg.includes(BACKGROUND_URL)) {
          console.log('[BACKGROUND] Background already set correctly');
        } else {
          console.log('[BACKGROUND] Setting background image on element:', element);
          element.style.backgroundImage = `url('${BACKGROUND_URL}')`;
          element.style.backgroundSize = 'cover';
          element.style.backgroundPosition = 'center';
          element.style.backgroundRepeat = 'no-repeat';
        }
      });
    } else {
      console.log('[BACKGROUND] No game area elements found yet');
    }
    
    // Continue checking periodically in case elements are added/changed
    setTimeout(applyBackgroundToElements, 1000);
  }
  
  // Create a CSS rule for styling
  function addBackgroundCSSRule() {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.id = 'game-background-style';
    styleSheet.innerHTML = `
      .game-area {
        background-image: url('${BACKGROUND_URL}') !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      }
    `;
    document.head.appendChild(styleSheet);
    console.log('[BACKGROUND] Added CSS style rule');
  }
  
  // Observe DOM changes to catch newly added game areas
  function setupMutationObserver() {
    if (!window.MutationObserver) {
      console.log('[BACKGROUND] MutationObserver not supported');
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
        console.log('[BACKGROUND] DOM changed, checking for new game areas');
        applyBackgroundToElements();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('[BACKGROUND] MutationObserver setup complete');
  }
  
  // Start applying background
  addBackgroundCSSRule();
  applyBackgroundToElements();
  setupMutationObserver();
})(); 