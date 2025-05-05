// src/serviceWorkerRegistration.js
import { Workbox } from 'workbox-window';

export function register() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        if (confirm('Nueva versión disponible! ¿Desea actualizar?')) {
          window.location.reload();
        }
      }
    });

    wb.addEventListener('waiting', (event) => {
      if (confirm('Nueva versión disponible! ¿Desea actualizar?')) {
        wb.messageSkipWaiting();
      }
    });

    wb.register()
      .then((registration) => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch((error) => {
        console.error('Error al registrar el Service Worker:', error);
      });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
  