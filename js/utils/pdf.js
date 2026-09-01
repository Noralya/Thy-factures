// pdf.js
// Generates a professional A4 invoice PDF entirely on-device using jsPDF
// (bundled locally in js/vendor - no CDN, no network call, no data leaves the phone).

import { formatMoney, computeLine, computeInvoiceTotals } from './money.js';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('fr-FR');
}

const STATUS_LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  partially_paid: 'Partiellement payée',
  overdue: 'En retard',
  cancelled: 'Annulée'
};

export async function generateInvoicePdf(invoice, profile) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;
  let y = 15;

  const accent = [180, 120, 140]; // soft rose, fits a nail-care business

  // --- Header: logo + issuer info ---
  if (profile?.logoDataUrl) {
    try {
      const format = profile.logoDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(profile.logoDataUrl, format, marginX, y, 28, 28, undefined, 'FAST');
    } catch (e) {
      // If the logo fails to decode, silently skip it rather than block PDF generation.
    }
  }

  const issuerX = marginX + 34;
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text(profile?.businessName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Indépendante', issuerX, y + 5);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  let issuerY = y + 11;
  const issuerLines = [
    profile?.address,
    `${profile?.postalCode || ''} ${profile?.city || ''}`.trim(),
    profile?.phone,
    profile?.email,
    profile?.siret ? `SIRET : ${profile.siret}` : null
  ].filter(Boolean);
  for (const line of issuerLines) {
    doc.text(String(line), issuerX, issuerY);
    issuerY += 4.2;
  }

  // --- Title ---
  y = Math.max(y + 34, issuerY + 4);
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.6);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...accent);
  doc.text('FACTURE', marginX, y);
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`N° ${invoice.number || '(brouillon)'}`, pageWidth - marginX, y - 5, { align: 'right' });
  doc.text(`Date d'émission : ${formatDate(invoice.issueDate)}`, pageWidth - marginX, y, { align: 'right' });
  if (invoice.serviceDate) {
    doc.text(`Date de prestation : ${formatDate(invoice.serviceDate)}`, pageWidth - marginX, y + 5, { align: 'right' });
  }
  if (invoice.dueDate) {
    doc.text(`Échéance : ${formatDate(invoice.dueDate)}`, pageWidth - marginX, y + 10, { align: 'right' });
  }

  y += 14;

  // --- Client block ---
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text('Facturé à', marginX, y);
  doc.setFont(undefined, 'normal');
  y += 5;
  const client = invoice.clientSnapshot || {};
  const clientLines = [
    `${client.firstName || ''} ${client.lastName || ''}`.trim(),
    client.address,
    `${client.postalCode || ''} ${client.city || ''}`.trim(),
    client.country,
    client.phone,
    client.email
  ].filter((l) => l && l.length);
  for (const line of clientLines) {
    doc.text(String(line), marginX, y);
    y += 4.5;
  }

  y += 4;

  // --- Status badge ---
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(`Statut : ${STATUS_LABELS[invoice.status] || invoice.status}`, pageWidth - marginX, y - clientLines.length * 4.5 - 5 + 5, { align: 'right' });
  doc.setFont(undefined, 'normal');

  // --- Table header ---
  y += 4;
  const colX = {
    desc: marginX,
    qty: marginX + 90,
    unit: marginX + 112,
    disc: marginX + 138,
    vat: marginX + 158,
    total: pageWidth - marginX
  };

  doc.setFillColor(...accent);
  doc.rect(marginX, y, pageWidth - marginX * 2, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont(undefined, 'bold');
  doc.text('Description', colX.desc + 2, y + 5);
  doc.text('Qté', colX.qty, y + 5);
  doc.text('P.U.', colX.unit, y + 5);
  doc.text('Remise', colX.disc, y + 5);
  doc.text('TVA', colX.vat, y + 5);
  doc.text('Total', colX.total, y + 5, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 7;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8.5);

  const lines = invoice.lines || [];
  for (const [i, line] of lines.entries()) {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    if (i % 2 === 1) {
      doc.setFillColor(248, 240, 242);
      doc.rect(marginX, y, pageWidth - marginX * 2, 7, 'F');
    }
    const computed = computeLine(line);
    const name = line.name || line.description || '';
    const desc = doc.splitTextToSize(name, 85);
    doc.text(desc[0] || '', colX.desc + 2, y + 5);
    doc.text(String(line.quantity ?? ''), colX.qty, y + 5);
    doc.text(formatMoney(line.unitPrice), colX.unit, y + 5);
    const discountLabel = line.discount && line.discount.value
      ? (line.discount.type === 'percent' ? `${line.discount.value}%` : formatMoney(line.discount.value))
      : '-';
    doc.text(discountLabel, colX.disc, y + 5);
    doc.text(`${line.vatRate ?? 0}%`, colX.vat, y + 5);
    doc.text(formatMoney(computed.totalCents / 100), colX.total, y + 5, { align: 'right' });
    y += 7;
  }

  y += 4;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // --- Totals ---
  const totals = computeInvoiceTotals(lines, invoice.amountPaid || 0);
  const totalsX = pageWidth - marginX - 60;
  doc.setFontSize(9.5);

  const totalsRows = [
    ['Total HT', formatMoney(totals.totalHT)],
    ['TVA', formatMoney(totals.totalVat)],
    ['Total TTC', formatMoney(totals.totalTTC)]
  ];
  if (invoice.amountPaid) {
    totalsRows.push(['Déjà payé', formatMoney(totals.amountPaid)]);
    totalsRows.push(['Reste dû', formatMoney(totals.remainingDue)]);
  }

  for (const [label, value] of totalsRows) {
    const isTotalTTC = label === 'Total TTC';
    doc.setFont(undefined, isTotalTTC ? 'bold' : 'normal');
    if (isTotalTTC) doc.setFontSize(11);
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - marginX, y, { align: 'right' });
    if (isTotalTTC) doc.setFontSize(9.5);
    y += 6;
  }
  doc.setFont(undefined, 'normal');

  y += 6;

  // --- Notes / mentions / payment terms ---
  const addBlock = (title, content) => {
    if (!content) return;
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text(title, marginX, y);
    y += 4.5;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8.5);
    const wrapped = doc.splitTextToSize(content, pageWidth - marginX * 2);
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 4 + 4;
  };

  addBlock('Notes', invoice.notes);
  addBlock('Mentions', invoice.customMentions);
  addBlock('Conditions de paiement', profile?.paymentTerms);
  addBlock('Coordonnées de paiement', profile?.paymentDetails);
  addBlock('Mentions légales', profile?.legalNotice);

  return doc;
}

export function invoicePdfFileName(invoice) {
  const client = invoice.clientSnapshot || {};
  const clientName = `${client.firstName || ''}${client.lastName || ''}`.replace(/\s+/g, '') || 'Client';
  const number = invoice.number || 'brouillon';
  return `Facture_${number}_${clientName}.pdf`.replace(/[^a-zA-Z0-9_\-.]/g, '');
}
