document.addEventListener('DOMContentLoaded', function() {
  console.log('[Loading Screen Handler] Script loaded');
  
  // Function to set the viewport height correctly (fixes mobile viewport issues)
  function setViewportHeight() {
    // First, set the viewport height custom property to the inner height of the window
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    
    // Find any loading screen containers that might exist
    const loadingScreens = document.querySelectorAll('.loading-screen-container, .fixed.inset-0');
    
    loadingScreens.forEach(screen => {
      // Apply the height using the custom property
      screen.style.height = 'calc(var(--vh, 1vh) * 100)';
    });
    
    console.log('[Loading Screen Handler] Viewport height adjusted');
  }
  
  // Call the function initially
  setViewportHeight();
  
  // Then call it on resize and orientation change
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);
  
  // For iOS Safari's notorious 100vh problem (bottom toolbar)
  window.addEventListener('scroll', function() {
    // Scroll events can indicate toolbar hiding/showing on iOS
    setTimeout(setViewportHeight, 100);
  });
  
  // If the page has a loading message that needs to be positioned
  function positionLoadingElements() {
    const loadingMessages = document.querySelectorAll('.loading-message');
    const versionTexts = document.querySelectorAll('.version-text');
    
    const isLandscape = window.innerWidth > window.innerHeight;
    const bottomPosition = isLandscape ? Math.max(5, window.innerHeight * 0.05) : Math.max(60, window.innerHeight * 0.12);
    
    loadingMessages.forEach(msg => {
      msg.style.bottom = `${bottomPosition}px`;
    });
    
    // Ensure version text is positioned correctly with safe area
    versionTexts.forEach(text => {
      // Get the safe area inset bottom value (defaults to 16px if not available)
      const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '16');
      text.style.bottom = `${Math.max(safeAreaBottom, 16)}px`;
    });
  }
  
  // Set safe area inset variables for proper positioning
  function setSafeAreaVariables() {
    const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0px';
    const safeAreaRight = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0px';
    const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0px';
    const safeAreaLeft = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0px';
    
    document.documentElement.style.setProperty('--safe-area-inset-top', safeAreaTop);
    document.documentElement.style.setProperty('--safe-area-inset-right', safeAreaRight);
    document.documentElement.style.setProperty('--safe-area-inset-bottom', safeAreaBottom);
    document.documentElement.style.setProperty('--safe-area-inset-left', safeAreaLeft);
    
    console.log('[Loading Screen Handler] Safe area insets set');
  }
  
  // Call these functions to set up
  setSafeAreaVariables();
  positionLoadingElements();
  
  // Update on resize and orientation change
  window.addEventListener('resize', positionLoadingElements);
  window.addEventListener('orientationchange', positionLoadingElements);
  
  console.log('[Loading Screen Handler] Initialization complete');
}); 