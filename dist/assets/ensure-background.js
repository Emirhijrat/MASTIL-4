document.addEventListener('DOMContentLoaded', function() {
  console.log('[Background Applier] Script loaded');
  
  // Function to apply the background style
  function applyBackground() {
    // Find all game-area and game-board elements
    const gameAreas = document.querySelectorAll('.game-area');
    const gameBoards = document.querySelectorAll('.game-board');
    
    if (gameAreas.length === 0 && gameBoards.length === 0) {
      console.log('[Background Applier] No game areas or boards found yet, retrying later');
      return false;
    }
    
    // Apply the background to all found elements
    gameAreas.forEach(area => {
      area.style.backgroundImage = 'url("https://iili.io/3vhdSja.png")';
      area.style.backgroundSize = 'cover';
      area.style.backgroundPosition = 'center';
      area.style.backgroundRepeat = 'no-repeat';
      area.style.backgroundColor = '#1a1a1a';
      console.log('[Background Applier] Applied background to game-area');
    });
    
    gameBoards.forEach(board => {
      board.style.backgroundImage = 'url("https://iili.io/3vhdSja.png")';
      board.style.backgroundSize = 'cover';
      board.style.backgroundPosition = 'center';
      board.style.backgroundRepeat = 'no-repeat';
      board.style.backgroundColor = '#1a1a1a';
      console.log('[Background Applier] Applied background to game-board');
    });
    
    return gameAreas.length > 0 || gameBoards.length > 0;
  }
  
  // Try immediately
  if (!applyBackground()) {
    // If no elements found, set up a retry mechanism
    let attempts = 0;
    const maxAttempts = 20; // Try for ~10 seconds
    
    const interval = setInterval(function() {
      attempts++;
      if (applyBackground() || attempts >= maxAttempts) {
        console.log('[Background Applier] Background applied successfully or max attempts reached');
        clearInterval(interval);
      }
    }, 500);
  }
  
  // Also listen for DOM changes which might indicate new elements being added
  const observer = new MutationObserver(function() {
    applyBackground();
  });
  
  // Start observing the document
  observer.observe(document.body, { 
    childList: true,
    subtree: true
  });
  
  // Also reapply on user interaction just to be safe
  document.addEventListener('click', function() {
    setTimeout(applyBackground, 100);
  });
}); 