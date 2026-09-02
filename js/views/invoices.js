// invoices.js
import { listInvoices } from '../db/repository.js';
import { formatMoney } from '../utils/money.js';
import { renderIcons } from '../utils/icons.js';

const STATUS_LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  partially_paid: 'Partiel.',
  overdue: 'En retard',
  cancelled: 'Annulée'
};

export async function renderInvoices(container) {
  const invoices = await listInvoices();

  container.innerHTML = `
    <h1>Factures</h1>

    <div class="search-wrapper">
      <span class="search-icon" aria-hidden="true">
        <span data-icon="search"></span>
      </span>

      <input
        type="search"
        id="invoice-search"
        class="search-bar"
        placeholder="Rechercher (numéro, client...)"
      />
    </div>

    <div class="filters" id="status-filters">
      <div class="filter-chip active" data-status="all">
        Toutes
      </div>

      ${Object.entries(STATUS_LABELS).map(([key, label]) => `
        <div class="filter-chip" data-status="${key}">
          ${label}
        </div>
      `).join('')}
    </div>

    <div
      class="card"
      style="padding:4px 14px;"
      id="invoice-list"
    ></div>
  `;

  renderIcons(container);

  const listEl = container.querySelector('#invoice-list');
  let activeStatus = 'all';

  function renderList() {
    const q = container
      .querySelector('#invoice-search')
      .value
      .trim()
      .toLowerCase();

    const filtered = invoices.filter((inv) => {
      if (
        activeStatus !== 'all' &&
        inv.status !== activeStatus
      ) {
        return false;
      }

      if (!q) {
        return true;
      }

      const clientName = inv.clientSnapshot
        ? `${inv.clientSnapshot.firstName} ${inv.clientSnapshot.lastName}`
        : '';

      return `${inv.number || ''} ${clientName}`
        .toLowerCase()
        .includes(q);
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <span data-icon="receipt"></span>
          </div>
          <div>Aucune facture trouvée</div>
        </div>
      `;

      renderIcons(listEl);
      return;
    }

    listEl.innerHTML = filtered.map((inv) => `
      <a
        href="#/invoices/${inv.id}"
        class="list-item"
      >
        <div>
          <div class="list-item-title">
            ${inv.number || 'Brouillon'}
          </div>

          <div class="list-item-sub">
            ${inv.clientSnapshot
              ? inv.clientSnapshot.firstName +
                ' ' +
                inv.clientSnapshot.lastName
              : ''}
            · ${inv.issueDate || ''}
          </div>
        </div>

        <div class="list-item-right">
          <div class="list-item-title">
            ${formatMoney(inv.totalTTC || 0)}
          </div>

          <span class="badge badge-${inv.status}">
            ${STATUS_LABELS[inv.status] || inv.status}
          </span>
        </div>
      </a>
    `).join('');

    renderIcons(listEl);
  }

  container
    .querySelector('#invoice-search')
    .addEventListener('input', renderList);

  container
    .querySelectorAll('.filter-chip')
    .forEach((chip) => {
      chip.addEventListener('click', () => {
        container
          .querySelectorAll('.filter-chip')
          .forEach((c) => c.classList.remove('active'));

        chip.classList.add('active');

        activeStatus = chip.dataset.status;

        renderList();
      });
    });

  renderList();
}
