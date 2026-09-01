// app.js
import { addRoute, resolveRoute, startRouter, currentPath } from './utils/router.js';
import { renderDashboard } from './views/dashboard.js';
import { renderClients } from './views/clients.js';
import { renderClientForm } from './views/clientForm.js';
import { renderServices } from './views/services.js';
import { renderServiceForm } from './views/serviceForm.js';
import { renderInvoices } from './views/invoices.js';
import { renderInvoiceForm } from './views/invoiceForm.js';
import { renderInvoicePreview } from './views/invoicePreview.js';
import { renderSettings } from './views/settings.js';
import { showToast } from './utils/toast.js';

const app = document.getElementById('app');

addRoute('/', () => renderDashboard(app));
addRoute('/clients', () => renderClients(app));
addRoute('/clients/new', () => renderClientForm(app, {}));
addRoute('/clients/:id/edit', ({ id }) => renderClientForm(app, { id }));
addRoute('/services', () => renderServices(app));
addRoute('/services/new', () => renderServiceForm(app, {}));
addRoute('/services/:id/edit', ({ id }) => renderServiceForm(app, { id }));
addRoute('/invoices', () => renderInvoices(app));
addRoute('/invoices/new', () => renderInvoiceForm(app, {}));
addRoute('/invoices/:id/edit', ({ id }) => renderInvoiceForm(app, { id }));
addRoute('/invoices/:id/preview', ({ id }) => renderInvoicePreview(app, { id }));
addRoute('/invoices/:id', ({ id }) => renderInvoicePreview(app, { id }));
addRoute('/settings', () => renderSettings(app));

function updateActiveNav() {
  const path = currentPath();
  document.querySelectorAll('.nav-item').forEach((link) => {
    const route = link.dataset.route;
    const isActive = route === '/' ? path === '/' : path.startsWith(route) && route !== '/invoices/new' ? path.startsWith(route) : path === route;
    link.classList.toggle('active', route === '/' ? path === '/' : path.startsWith(route));
  });
}

async function onNavigate() {
  app.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
  try {
    const handled = await resolveRoute();
    if (handled === null && !document.querySelector('#app').innerHTML) {
      app.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🤷‍♀️</div><div>Page introuvable</div></div>`;
    }
  } catch (err) {
    console.error(err);
    showToast('Une erreur est survenue.', 'error');
  }
  updateActiveNav();
}

startRouter(onNavigate);

// Register the service worker for offline support. Registration itself only
// touches files bundled with the app - no client or invoice data is involved.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
