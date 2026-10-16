import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).then(
      (reg) => {
        reg.update();
        console.log('PWA ServiceWorker ready:', reg.scope);
      },
      (err) => console.log('PWA ServiceWorker error:', err)
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Sistem Keuangan BAKESBANGPOLDAGRI NTB">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
