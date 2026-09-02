// clients.js
import { listClients, deleteClient } from '../db/repository.js';
import { showToast, confirmDialog } from '../utils/toast.js';
import { renderIcons } from '../utils/icons.js';

export async function renderClients(container) {
  const clients = await listClients();

  container.innerHTML = `
    <h1>Clients</h1>

    <input
      type="search"
      id="client-search"
      class="search-bar"
      placeholder="Rechercher un client..."
    />

    <a href="#/clients/new" class="btn btn-primary" style="margin-bottom:14px;">
      <span data-icon="userPlus"></span>
      Nouveau client
    </a>

    <div class="card" style="padding:4px 14px;" id="client-list"></div>
  `;

  renderIcons(container);

  const listEl = container.querySelector('#client-list');

  function renderList(filtered) {
    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <span data-icon="users"></span>
          </div>
          <div>Aucun client trouvé</div>
        </div>
      `;

      renderIcons(listEl);
      return;
    }

    listEl.innerHTML = filtered.map((c) => `
      <div class="list-item">
        <a
          href="#/clients/${c.id}/edit"
          class="plain"
          style="flex:1;text-decoration:none;color:inherit;"
        >
          <div class="list-item-title">
            ${c.firstName || ''} ${c.lastName || ''}
          </div>

          <div class="list-item-sub">
            ${c.phone || ''} ${c.email ? '· ' + c.email : ''}
          </div>
        </a>

        <button
          class="btn btn-sm btn-danger"
          data-delete="${c.id}"
          aria-label="Supprimer ${c.firstName || ''} ${c.lastName || ''}"
        >
          <span data-icon="trash2"></span>
          Suppr.
        </button>
      </div>
    `).join('');

    renderIcons(listEl);

    listEl.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirmDialog(
          'Supprimer ce client ? Ses anciennes factures seront conservées.'
        )) {
          return;
        }

        await deleteClient(btn.dataset.delete);

        showToast('Client supprimé', 'success');
        renderClients(container);
      });
    });
  }

  renderList(clients);

  container.querySelector('#client-search').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();

    const filtered = clients.filter((c) =>
      `${c.firstName} ${c.lastName} ${c.phone || ''} ${c.email || ''}`
        .toLowerCase()
        .includes(q)
    );

    renderList(filtered);
  });
}
