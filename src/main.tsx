import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './core-game-fix.css';
import { UnitAnimationProvider } from './hooks/useUnitAnimations';
import { formatErrorForReporting } from './utils/errorUtils';

console.log("Application mounting...");

// Global error handler for uncaught errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('=== GLOBAL UNHANDLED ERROR ===');
  console.error('Message:', message);
  console.error('Source:', source);
  console.error('Line:', lineno, 'Column:', colno);
  console.error('Error object:', error);

  if (error) {
    const formattedError = formatErrorForReporting(error, null, {
      location: `${source}:${lineno}:${colno}`,
      errorType: 'GlobalUncaughtError'
    });
    console.debug('Formatted error report:', formattedError);
  }

  // Don't suppress the browser's default error handling
  return false;
};

// Global handler for unhandled promise rejections
window.onunhandledrejection = function(event) {
  console.error('=== UNHANDLED PROMISE REJECTION ===');
  console.error('Reason:', event.reason);
  
  const error = event.reason instanceof Error 
    ? event.reason 
    : new Error(String(event.reason));
  
  const formattedError = formatErrorForReporting(error, null, {
    errorType: 'UnhandledPromiseRejection'
  });
  console.debug('Formatted error report:', formattedError);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnitAnimationProvider>
      <App />
    </UnitAnimationProvider>
  </StrictMode>
);