// invoicePreview.js
import { getInvoice, getProfile } from '../db/repository.js';
import { computeLine, computeInvoiceTotals, formatMoney } from '../utils/money.js';
import { generateInvoicePdf, invoicePdfFileName } from '../utils/pdf.js';
import { showToast } from '../utils/toast.js';

const STATUS_LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  partially_paid: 'Partiellement payée',
  overdue: 'En retard',
  cancelled: 'Annulée'
};

export async function renderInvoicePreview(container, { id }) {
  const [invoice, profile] = await Promise.all([getInvoice(id), getProfile()]);
  if (!invoice) {
    container.innerHTML = `<div class="empty-state">Facture introuvable.</div>`;
    return;
  }

  const totals = computeInvoiceTotals(invoice.lines, invoice.amountPaid);
  const client = invoice.clientSnapshot || {};

  container.innerHTML = `
    <h1>${invoice.number || 'Brouillon'}</h1>
    <span class="badge badge-${invoice.status}">${STATUS_LABELS[invoice.status] || invoice.status}</span>

    <div class="card" style="margin-top:14px;">
      <h3>Cliente</h3>
      <div>${client.firstName || ''} ${client.lastName || ''}</div>
      <div class="helper-text">${client.address || ''} ${client.postalCode || ''} ${client.city || ''}</div>
      <div class="helper-text">${client.phone || ''} ${client.email || ''}</div>
    </div>

    <div class="card">
      <h3>Dates</h3>
      <div>Émission : ${invoice.issueDate || '-'}</div>
      <div>Prestation : ${invoice.serviceDate || '-'}</div>
      <div>Échéance : ${invoice.dueDate || '-'}</div>
    </div>

    <div class="card">
      <h3>Lignes</h3>
      ${(invoice.lines || []).map((line) => {
        const c = computeLine(line);
        return `<div class="list-item">
          <div>
            <div class="list-item-title">${line.name || '(sans nom)'}</div>
            <div class="list-item-sub">${line.quantity} × ${formatMoney(line.unitPrice)} · TVA ${line.vatRate}%</div>
          </div>
          <div class="list-item-title">${formatMoney(c.totalCents / 100)}</div>
        </div>`;
      }).join('')}
    </div>

    ${renderTotalsBlock(totals, invoice)}

    ${invoice.notes ? `<div class="card"><h3>Notes</h3><div>${invoice.notes}</div></div>` : ''}

    <div id="pdf-status"></div>

    <div class="btn-row" style="margin:16px 0;">
      <a href="#/invoices/${invoice.id}/edit" class="btn btn-outline">✏️ Modifier</a>
      <button id="generate-pdf-btn" class="btn btn-primary">📄 Générer le PDF</button>
    </div>
  `;

  container.querySelector('#generate-pdf-btn').addEventListener('click', async () => {
    const statusEl = container.querySelector('#pdf-status');
    statusEl.textContent = 'Génération en cours...';
    try {
      const doc = await generateInvoicePdf(invoice, profile);
      const fileName = invoicePdfFileName(invoice);
      const blob = doc.output('blob');

      statusEl.innerHTML = '';

      // Prefer the native share sheet when available (iOS Safari), so Thy can
      // open, save, or share the PDF via the system's own options.
      const file = new File([blob], fileName, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: fileName });
          showToast('PDF prêt à partager', 'success');
          return;
        } catch (shareErr) {
          // User cancelled the share sheet or it failed - fall back to download below.
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast('PDF téléchargé', 'success');
    } catch (err) {
      console.error(err);
      statusEl.textContent = '';
      showToast('Impossible de générer le PDF. ' + (err.message || ''), 'error');
    }
  });
}

function renderTotalsBlock(totals, invoice) {
  return `
    <div class="totals-box">
      <div class="totals-row"><span>Total HT</span><span>${formatMoney(totals.totalHT)}</span></div>
      <div class="totals-row"><span>TVA</span><span>${formatMoney(totals.totalVat)}</span></div>
      <div class="totals-row grand"><span>Total TTC</span><span>${formatMoney(totals.totalTTC)}</span></div>
      ${invoice.amountPaid ? `
        <div class="totals-row"><span>Payé</span><span>${formatMoney(totals.amountPaid)}</span></div>
        <div class="totals-row"><span>Reste dû</span><span>${formatMoney(totals.remainingDue)}</span></div>
      ` : ''}
    </div>
  `;
}
