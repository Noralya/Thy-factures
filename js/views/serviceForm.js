// serviceForm.js
import { getService, saveService } from '../db/repository.js';
import { showToast } from '../utils/toast.js';
import { navigate } from '../utils/router.js';

export async function renderServiceForm(container, { id, onSaved } = {}) {
  const service = id ? await getService(id) : {};
  if (id && !service) {
    container.innerHTML = `<div class="empty-state">Prestation introuvable.</div>`;
    return;
  }

  container.innerHTML = `
    <h1>${id ? 'Modifier la prestation' : 'Nouvelle prestation'}</h1>
    <form id="service-form">
      <label>Nom</label>
      <input name="name" value="${service.name || ''}" required />
      <label>Description</label>
      <textarea name="description">${service.description || ''}</textarea>
      <div class="field-row">
        <div>
          <label>Prix (€)</label>
          <input name="price" type="number" step="0.01" min="0" value="${service.price ?? ''}" required />
        </div>
        <div>
          <label>Unité</label>
          <input name="unit" value="${service.unit || 'forfait'}" />
        </div>
      </div>
      <label>Taux de TVA (%)</label>
      <input name="vatRate" type="number" step="0.1" min="0" value="${service.vatRate ?? 0}" />

      <div class="btn-row" style="margin-top:20px;">
        <button type="button" class="btn btn-outline" id="cancel-btn">Annuler</button>
        <button type="submit" class="btn btn-primary">Enregistrer</button>
      </div>
    </form>
  `;

  container.querySelector('#cancel-btn').addEventListener('click', () => window.history.back());

  container.querySelector('#service-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    data.price = parseFloat(data.price) || 0;
    data.vatRate = parseFloat(data.vatRate) || 0;
    const saved = await saveService({ ...service, ...data });
    showToast('Prestation enregistrée', 'success');
    if (onSaved) {
      onSaved(saved);
    } else {
      navigate('/services');
    }
  });
}
