import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({ immediate: true });
    }).catch(() => {});
  });
}
