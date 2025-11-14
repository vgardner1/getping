import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA and NFC notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service Worker registered:', registration);
        
        // Request notification permission if not already granted
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then((permission) => {
            console.log('Notification permission:', permission);
          });
        }
      },
      (error) => {
        console.log('Service Worker registration failed:', error);
      }
    );
  });
}

createRoot(document.getElementById("root")!).render(<App />);
