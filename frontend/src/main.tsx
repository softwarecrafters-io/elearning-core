import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/infrastructure/ui/globals.css';
import App from './shared/infrastructure/ui/App/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
