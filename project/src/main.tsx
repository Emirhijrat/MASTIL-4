import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { UnitAnimationProvider } from './hooks/useUnitAnimations';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnitAnimationProvider>
      <App />
    </UnitAnimationProvider>
  </StrictMode>
);