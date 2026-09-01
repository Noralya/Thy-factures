// services.js
import { listServices, deleteService } from '../db/repository.js';
import { formatMoney } from '../utils/money.js';
import { showToast, confirmDialog } from '../utils/toast.js';

export async function renderServices(container) {
  const services = await listServices();

  container.innerHTML = `
    <h1>Prestations</h1>
    <a href="#/services/new" class="btn btn-primary" style="margin-bottom:14px;">➕ Nouvelle prestation</a>
    <div class="card" style="padding:4px 14px;" id="service-list">
      ${services.length === 0 ? `
        <div class="empty-state"><div class="empty-state-icon">💅</div><div>Aucune prestation enregistrée</div></div>
      ` : services.map((s) => `
        <div class="list-item">
          <a href="#/services/${s.id}/edit" class="plain" style="flex:1;text-decoration:none;color:inherit;">
            <div class="list-item-title">${s.name}</div>
            <div class="list-item-sub">${formatMoney(s.price)} · TVA ${s.vatRate ?? 0}% ${s.unit ? '· ' + s.unit : ''}</div>
          </a>
          <button class="btn btn-sm btn-danger" data-delete="${s.id}">Suppr.</button>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirmDialog('Supprimer cette prestation ? Les factures existantes ne seront pas modifiées.')) return;
      await deleteService(btn.dataset.delete);
      showToast('Prestation supprimée', 'success');
      renderServices(container);
    });
  });
}
