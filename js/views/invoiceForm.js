// invoiceForm.js
import {
  getInvoice,
  saveInvoice,
  listClients,
  listServices,
  deleteInvoice,
  duplicateInvoice
} from '../db/repository.js';
import { reserveNextInvoiceNumber } from '../utils/numbering.js';
import {
  computeLine,
  computeInvoiceTotals,
  formatMoney
} from '../utils/money.js';
import { generateId } from '../utils/uid.js';
import { showToast, confirmDialog } from '../utils/toast.js';
import { navigate } from '../utils/router.js';
import { renderClientForm } from './clientForm.js';
import { renderIcons } from '../utils/icons.js';

const STATUS_LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  partially_paid: 'Partiellement payée',
  overdue: 'En retard',
  cancelled: 'Annulée'
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptyLine() {
  return {
    lineId: generateId('ln-'),
    serviceId: null,
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: { type: 'percent', value: 0 },
    vatRate: 0
  };
}

export async function renderInvoiceForm(container, { id } = {}) {
  let invoice = id ? await getInvoice(id) : null;

  if (id && !invoice) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <span data-icon="fileText"></span>
        </div>
        <div>Facture introuvable.</div>
      </div>
    `;
    renderIcons(container);
    return;
  }

  if (!invoice) {
    invoice = {
      id: null,
      status: 'draft',
      issueDate: todayISO(),
      serviceDate: '',
      dueDate: '',
      clientId: null,
      clientSnapshot: null,
      lines: [emptyLine()],
      notes: '',
      customMentions: '',
      amountPaid: 0,
      number: null
    };
  }

  if (!invoice.lines || invoice.lines.length === 0) {
    invoice.lines = [emptyLine()];
  }

  const [clients, services] = await Promise.all([
    listClients(),
    listServices()
  ]);

  const isLocked = invoice.status !== 'draft';

  let autosaveTimer = null;

  function scheduleAutosave() {
    if (isLocked) return;

    clearTimeout(autosaveTimer);

    autosaveTimer = setTimeout(async () => {
      invoice = await saveInvoice({
        ...invoice,
        ...recomputeTotals()
      });
    }, 500);
  }

  function recomputeTotals() {
    const totals = computeInvoiceTotals(
      invoice.lines,
      invoice.amountPaid
    );

    return {
      totalHT: totals.totalHT,
      totalVat: totals.totalVat,
      totalTTC: totals.totalTTC,
      remainingDue: totals.remainingDue
    };
  }

  function clientOptions() {
    return clients
      .map((c) => `
        <option
          value="${c.id}"
          ${invoice.clientId === c.id ? 'selected' : ''}
        >
          ${c.firstName} ${c.lastName}
        </option>
      `)
      .join('');
  }

  function serviceOptions(selectedId) {
    return [
      '<option value="">— Prestation libre —</option>',
      ...services.map((s) => `
        <option
          value="${s.id}"
          ${selectedId === s.id ? 'selected' : ''}
        >
          ${s.name} (${formatMoney(s.price)})
        </option>
      `)
    ].join('');
  }

  function renderLines() {
    return invoice.lines.map((line) => {
      const computed = computeLine(line);

      return `
        <div class="line-item" data-line="${line.lineId}">

          ${
            invoice.lines.length > 1 && !isLocked
              ? `
                <button
                  type="button"
                  class="line-item-remove"
                  data-remove-line="${line.lineId}"
                  aria-label="Supprimer cette ligne"
                >
                  <span data-icon="x"></span>
                </button>
              `
              : ''
          }

          <label>Prestation</label>

          <select
            data-field="serviceId"
            ${isLocked ? 'disabled' : ''}
          >
            ${serviceOptions(line.serviceId)}
          </select>

          <label>Nom de la ligne</label>

          <input
            data-field="name"
            value="${line.name || ''}"
            ${isLocked ? 'disabled' : ''}
          />

          <label>Description</label>

          <input
            data-field="description"
            value="${line.description || ''}"
            ${isLocked ? 'disabled' : ''}
          />

          <div class="field-row">
            <div>
              <label>Quantité</label>
              <input
                data-field="quantity"
                type="number"
                step="0.01"
                min="0"
                value="${line.quantity}"
                ${isLocked ? 'disabled' : ''}
              />
            </div>

            <div>
              <label>Prix unitaire (€)</label>
              <input
                data-field="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value="${line.unitPrice}"
                ${isLocked ? 'disabled' : ''}
              />
            </div>
          </div>

          <div class="field-row">
            <div>
              <label>Remise</label>
              <input
                data-field="discountValue"
                type="number"
                step="0.01"
                min="0"
                value="${line.discount?.value || 0}"
                ${isLocked ? 'disabled' : ''}
              />
            </div>

            <div>
              <label>Type de remise</label>

              <select
                data-field="discountType"
                ${isLocked ? 'disabled' : ''}
              >
                <option
                  value="percent"
                  ${line.discount?.type === 'percent' ? 'selected' : ''}
                >
                  %
                </option>

                <option
                  value="amount"
                  ${line.discount?.type === 'amount' ? 'selected' : ''}
                >
                  €
                </option>
              </select>
            </div>

            <div>
              <label>TVA (%)</label>
              <input
                data-field="vatRate"
                type="number"
                step="0.1"
                min="0"
                value="${line.vatRate}"
                ${isLocked ? 'disabled' : ''}
              />
            </div>
          </div>

          <div class="helper-text">
            Total ligne :
            <strong>
              ${formatMoney(computed.totalCents / 100)}
            </strong>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderTotals() {
    const totals = computeInvoiceTotals(
      invoice.lines,
      invoice.amountPaid
    );

    return `
      <div class="totals-box">
        <div class="totals-row">
          <span>Total HT</span>
          <span>${formatMoney(totals.totalHT)}</span>
        </div>

        <div class="totals-row">
          <span>TVA</span>
          <span>${formatMoney(totals.totalVat)}</span>
        </div>

        <div class="totals-row grand">
          <span>Total TTC</span>
          <span>${formatMoney(totals.totalTTC)}</span>
        </div>

        ${
          invoice.amountPaid
            ? `
              <div class="totals-row">
                <span>Payé</span>
                <span>${formatMoney(totals.amountPaid)}</span>
              </div>

              <div class="totals-row">
                <span>Reste dû</span>
                <span>${formatMoney(totals.remainingDue)}</span>
              </div>
            `
            : ''
        }
      </div>
    `;
  }

  function paint() {
    container.innerHTML = `
      <h1>
        ${
          invoice.number
            ? invoice.number
            : id
              ? 'Brouillon'
              : 'Nouvelle facture'
        }
      </h1>

      ${
        isLocked
          ? `
            <div
              class="card invoice-locked-notice"
              style="background:var(--accent-light);border:none;"
            >
              <div class="notice-icon">
                <span data-icon="lock"></span>
              </div>

              <div>
                <strong>Facture finalisée</strong>
                <div class="helper-text">
                  Les lignes et informations client sont figées.
                  Utilisez « Dupliquer » pour créer une nouvelle
                  facture basée sur celle-ci.
                </div>
              </div>
            </div>
          `
          : ''
      }

      <div class="card">
        <h3>Client</h3>

        <select
          id="client-select"
          ${isLocked ? 'disabled' : ''}
        >
          <option value="">— Choisir un client —</option>
          ${clientOptions()}
        </select>

        ${
          !isLocked
            ? `
              <button
                type="button"
                id="new-client-btn"
                class="btn btn-outline btn-sm"
                style="margin-top:8px;"
              >
                <span data-icon="userPlus"></span>
                Nouveau client
              </button>
            `
            : ''
        }
      </div>

      <div class="card">
        <h3>Informations générales</h3>

        <div class="field-row">
          <div>
            <label>Date d'émission</label>
            <input
              id="issueDate"
              type="date"
              value="${invoice.issueDate || ''}"
              ${isLocked ? 'disabled' : ''}
            />
          </div>

          <div>
            <label>Date de prestation</label>
            <input
              id="serviceDate"
              type="date"
              value="${invoice.serviceDate || ''}"
              ${isLocked ? 'disabled' : ''}
            />
          </div>
        </div>

        <label>Date d'échéance</label>

        <input
          id="dueDate"
          type="date"
          value="${invoice.dueDate || ''}"
          ${isLocked ? 'disabled' : ''}
        />

        <label>Statut</label>

        <select id="status-select">
          ${Object.entries(STATUS_LABELS)
            .map(([key, label]) => `
              <option
                value="${key}"
                ${invoice.status === key ? 'selected' : ''}
              >
                ${label}
              </option>
            `)
            .join('')}
        </select>

        <label>Montant déjà payé (€)</label>

        <input
          id="amountPaid"
          type="number"
          step="0.01"
          min="0"
          value="${invoice.amountPaid || 0}"
        />
      </div>

      <div class="section-title-row">
        <h2>Prestations</h2>

        ${
          !isLocked
            ? `
              <button
                type="button"
                id="add-line-btn"
                class="btn btn-sm btn-secondary"
              >
                <span data-icon="plus"></span>
                Ligne
              </button>
            `
            : ''
        }
      </div>

      <div id="lines-container">
        ${renderLines()}
      </div>

      <div id="totals-container">
        ${renderTotals()}
      </div>

      <div class="card">
        <label>Notes (visibles sur la facture)</label>
        <textarea id="notes">${invoice.notes || ''}</textarea>

        <label>Mentions personnalisées</label>
        <textarea id="customMentions">${invoice.customMentions || ''}</textarea>
      </div>

      <div class="btn-row" style="margin:16px 0;">
        <a
          href="#/invoices/${invoice.id || ''}/preview"
          class="btn btn-outline"
          ${!invoice.id ? 'style="pointer-events:none;opacity:.5;"' : ''}
        >
          <span data-icon="eye"></span>
          Aperçu
        </a>

        ${
          !invoice.number && !isLocked
            ? `
              <button
                type="button"
                id="finalize-btn"
                class="btn btn-primary"
              >
                <span data-icon="check"></span>
                Finaliser
              </button>
            `
            : ''
        }
      </div>

      <div class="btn-row">
        ${
          invoice.id
            ? `
              <button
                type="button"
                id="duplicate-btn"
                class="btn btn-secondary"
              >
                <span data-icon="copy"></span>
                Dupliquer
              </button>
            `
            : ''
        }

        ${
          invoice.id && invoice.status === 'draft'
            ? `
              <button
                type="button"
                id="delete-btn"
                class="btn btn-danger"
              >
                <span data-icon="trash2"></span>
                Supprimer
              </button>
            `
            : ''
        }
      </div>
    `;

    renderIcons(container);
    attachHandlers();
  }

  function attachHandlers() {
    const clientSelect = container.querySelector('#client-select');

    clientSelect.addEventListener('change', () => {
      const client = clients.find(
        (c) => c.id === clientSelect.value
      );

      invoice.clientId = client ? client.id : null;
      invoice.clientSnapshot = client ? { ...client } : null;

      scheduleAutosave();
    });

    const newClientBtn = container.querySelector('#new-client-btn');

    if (newClientBtn) {
      newClientBtn.addEventListener('click', () => {
        renderClientForm(container, {
          onSaved: async (savedClient) => {
            clients.push(savedClient);

            invoice.clientId = savedClient.id;
            invoice.clientSnapshot = { ...savedClient };

            scheduleAutosave();
            paint();
          }
        });
      });
    }

    ['issueDate', 'serviceDate', 'dueDate'].forEach((field) => {
      const el = container.querySelector(`#${field}`);

      el.addEventListener('change', () => {
        invoice[field] = el.value;
        scheduleAutosave();
      });
    });

    container
      .querySelector('#status-select')
      .addEventListener('change', (e) => {
        invoice.status = e.target.value;

        saveInvoice({
          ...invoice,
          ...recomputeTotals()
        }).then((saved) => {
          invoice = saved;
        });
      });

    container
      .querySelector('#amountPaid')
      .addEventListener('input', (e) => {
        invoice.amountPaid = parseFloat(e.target.value) || 0;

        container.querySelector('#totals-container').innerHTML =
          renderTotals();

        scheduleAutosave();
      });

    const addLineBtn = container.querySelector('#add-line-btn');

    if (addLineBtn) {
      addLineBtn.addEventListener('click', () => {
        invoice.lines.push(emptyLine());

        container.querySelector('#lines-container').innerHTML =
          renderLines();

        renderIcons(container.querySelector('#lines-container'));
        attachLineHandlers();
        scheduleAutosave();
      });
    }

    attachLineHandlers();

    const finalizeBtn = container.querySelector('#finalize-btn');

    if (finalizeBtn) {
      finalizeBtn.addEventListener('click', async () => {
        if (!invoice.clientId) {
          showToast(
            'Sélectionnez un client avant de finaliser.',
            'error'
          );
          return;
        }

        if (
          !invoice.lines.some(
            (line) =>
              (line.name || line.serviceId) &&
              line.unitPrice >= 0
          )
        ) {
          showToast(
            'Ajoutez au moins une prestation.',
            'error'
          );
          return;
        }

        if (
          !confirmDialog(
            'Finaliser cette facture ? Elle recevra un numéro définitif et ne pourra plus être modifiée.'
          )
        ) {
          return;
        }

        const number = await reserveNextInvoiceNumber();

        invoice.number = number;
        invoice.status =
          invoice.status === 'draft'
            ? 'sent'
            : invoice.status;

        invoice.finalizedAt = new Date().toISOString();

        invoice = await saveInvoice({
          ...invoice,
          ...recomputeTotals()
        });

        showToast(
          `Facture ${number} finalisée`,
          'success'
        );

        navigate(`/invoices/${invoice.id}`);
      });
    }

    const duplicateBtn =
      container.querySelector('#duplicate-btn');

    if (duplicateBtn) {
      duplicateBtn.addEventListener('click', async () => {
        const copy = await duplicateInvoice(invoice.id);

        showToast(
          'Facture dupliquée',
          'success'
        );

        navigate(`/invoices/${copy.id}/edit`);
      });
    }

    const deleteBtn =
      container.querySelector('#delete-btn');

    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (
          !confirmDialog(
            'Supprimer ce brouillon définitivement ?'
          )
        ) {
          return;
        }

        await deleteInvoice(invoice.id);

        showToast(
          'Brouillon supprimé',
          'success'
        );

        navigate('/invoices');
      });
    }
  }

  function attachLineHandlers() {
    container.querySelectorAll('.line-item').forEach((lineEl) => {
      const lineId = lineEl.dataset.line;

      const line = invoice.lines.find(
        (l) => l.lineId === lineId
      );

      const removeBtn =
        lineEl.querySelector('[data-remove-line]');

      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          invoice.lines = invoice.lines.filter(
            (l) => l.lineId !== lineId
          );

          container.querySelector('#lines-container').innerHTML =
            renderLines();

          renderIcons(
            container.querySelector('#lines-container')
          );

          attachLineHandlers();

          container.querySelector('#totals-container').innerHTML =
            renderTotals();

          scheduleAutosave();
        });
      }

      lineEl
        .querySelector('[data-field="serviceId"]')
        .addEventListener('change', (e) => {
          const svc = services.find(
            (s) => s.id === e.target.value
          );

          if (svc) {
            line.serviceId = svc.id;
            line.name = svc.name;
            line.description = svc.description || '';
            line.unitPrice = svc.price;
            line.vatRate = svc.vatRate || 0;
            line.unit = svc.unit;
          } else {
            line.serviceId = null;
          }

          container.querySelector('#lines-container').innerHTML =
            renderLines();

          renderIcons(
            container.querySelector('#lines-container')
          );

          attachLineHandlers();

          container.querySelector('#totals-container').innerHTML =
            renderTotals();

          scheduleAutosave();
        });

      ['name', 'description'].forEach((field) => {
        lineEl
          .querySelector(`[data-field="${field}"]`)
          .addEventListener('input', (e) => {
            line[field] = e.target.value;
            scheduleAutosave();
          });
      });

      ['quantity', 'unitPrice', 'vatRate'].forEach((field) => {
        lineEl
          .querySelector(`[data-field="${field}"]`)
          .addEventListener('input', (e) => {
            line[field] = parseFloat(e.target.value) || 0;

            container.querySelector('#totals-container').innerHTML =
              renderTotals();

            const helper =
              lineEl.querySelector('.helper-text strong');

            if (helper) {
              helper.textContent = formatMoney(
                computeLine(line).totalCents / 100
              );
            }

            scheduleAutosave();
          });
      });

      lineEl
        .querySelector('[data-field="discountValue"]')
        .addEventListener('input', (e) => {
          line.discount = line.discount || {
            type: 'percent',
            value: 0
          };

          line.discount.value =
            parseFloat(e.target.value) || 0;

          container.querySelector('#totals-container').innerHTML =
            renderTotals();

          scheduleAutosave();
        });

      lineEl
        .querySelector('[data-field="discountType"]')
        .addEventListener('change', (e) => {
          line.discount = line.discount || {
            type: 'percent',
            value: 0
          };

          line.discount.type = e.target.value;

          container.querySelector('#totals-container').innerHTML =
            renderTotals();

          scheduleAutosave();
        });
    });
  }

  paint();

  if (!invoice.id) {
    invoice = await saveInvoice({
      ...invoice,
      ...recomputeTotals()
    });

    paint();
  }
}
