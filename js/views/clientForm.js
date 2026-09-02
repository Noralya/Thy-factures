// clientForm.js
import { getClient, saveClient } from '../db/repository.js';
import { showToast } from '../utils/toast.js';
import { navigate } from '../utils/router.js';

export async function renderClientForm(container, { id, onSaved } = {}) {
  const client = id ? await getClient(id) : {};
  if (id && !client) {
    container.innerHTML = `<div class="empty-state">Client introuvable.</div>`;
    return;
  }

  container.innerHTML = `
    <h1>${id ? 'Modifier le client' : 'Nouveau client'}</h1>
    <form id="client-form">
      <div class="field-row">
        <div>
          <label>Prénom</label>
          <input name="firstName" value="${client.firstName || ''}" required />
        </div>
        <div>
          <label>Nom</label>
          <input name="lastName" value="${client.lastName || ''}" />
        </div>
      </div>
      <label>Adresse</label>
      <input name="address" value="${client.address || ''}" />
      <div class="field-row">
        <div>
          <label>Code postal</label>
          <input name="postalCode" value="${client.postalCode || ''}" />
        </div>
        <div>
          <label>Ville</label>
          <input name="city" value="${client.city || ''}" />
        </div>
      </div>
      <label>Pays</label>
      <input name="country" value="${client.country || 'France'}" />
      <label>Téléphone</label>
      <input name="phone" type="tel" value="${client.phone || ''}" />
      <label>E-mail</label>
      <input name="email" type="email" value="${client.email || ''}" />
      <label>Notes</label>
      <textarea name="notes">${client.notes || ''}</textarea>

      <div class="btn-row" style="margin-top:20px;">
        <button type="button" class="btn btn-outline" id="cancel-btn">Annuler</button>
        <button type="submit" class="btn btn-primary">Enregistrer</button>
      </div>
    </form>
  `;

  container.querySelector('#cancel-btn').addEventListener('click', () => window.history.back());

  container.querySelector('#client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const saved = await saveClient({ ...client, ...data });
    showToast('Client enregistrée', 'success');
    if (onSaved) {
      onSaved(saved);
    } else {
      navigate('/clients');
    }
  });
}
