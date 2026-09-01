// dashboard.js
import { listInvoices, listClients } from '../db/repository.js';
import { formatMoney } from '../utils/money.js';

const STATUS_LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  partially_paid: 'Partiellement payée',
  overdue: 'En retard',
  cancelled: 'Annulée'
};

export async function renderDashboard(container) {
  const [invoices, clients] = await Promise.all([listInvoices(), listClients()]);
  const recent = invoices.slice(0, 5);

  const unpaidTotal = invoices
    .filter((i) => ['sent', 'partially_paid', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + (i.totalTTC || 0) - (i.amountPaid || 0), 0);

  container.innerHTML = `
    <h1>Bonjour Thy 👋</h1>

    <div class="card">
      <h3>À encaisser</h3>
      <div style="font-size:26px;font-weight:700;color:var(--accent-dark)">${formatMoney(unpaidTotal)}</div>
      <div class="helper-text">${invoices.filter(i => ['sent','partially_paid','overdue'].includes(i.status)).length} facture(s) en attente</div>
    </div>

    <a href="#/invoices/new" class="btn btn-primary" style="margin-bottom:12px;">➕ Nouvelle facture</a>

    <div class="btn-row" style="margin-bottom:20px;">
      <a href="#/clients" class="btn btn-secondary">👥 Clientes (${clients.length})</a>
      <a href="#/services" class="btn btn-secondary">💅 Prestations</a>
    </div>

    <div class="section-title-row">
      <h2>Dernières factures</h2>
      <a href="#/invoices" class="plain">Tout voir</a>
    </div>

    <div class="card" style="padding:4px 14px;">
      ${recent.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🧾</div>
          <div>Aucune facture pour l'instant</div>
        </div>
      ` : recent.map((inv) => `
        <a href="#/invoices/${inv.id}" class="list-item">
          <div>
            <div class="list-item-title">${inv.number || 'Brouillon'}</div>
            <div class="list-item-sub">${inv.clientSnapshot ? (inv.clientSnapshot.firstName + ' ' + inv.clientSnapshot.lastName) : ''}</div>
          </div>
          <div class="list-item-right">
            <div class="list-item-title">${formatMoney(inv.totalTTC || 0)}</div>
            <span class="badge badge-${inv.status}">${STATUS_LABELS[inv.status] || inv.status}</span>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}
