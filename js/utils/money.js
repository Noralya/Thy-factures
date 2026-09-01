// money.js
// All monetary calculations are done in integer cents to avoid floating point
// rounding errors, then converted back to euros only for display.

export function toCents(amount) {
  return Math.round((Number(amount) || 0) * 100);
}

export function toEuros(cents) {
  return cents / 100;
}

export function formatMoney(amount, currency = 'EUR') {
  const value = typeof amount === 'number' ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
}

// Computes a single invoice line: quantity * unit price, minus discount, then VAT.
// discount = { type: 'percent'|'amount', value: number }
export function computeLine(line) {
  const qty = Number(line.quantity) || 0;
  const unitPriceCents = toCents(line.unitPrice);
  let subtotalCents = Math.round(qty * unitPriceCents);

  let discountCents = 0;
  if (line.discount && Number(line.discount.value) > 0) {
    if (line.discount.type === 'percent') {
      discountCents = Math.round(subtotalCents * (Number(line.discount.value) / 100));
    } else {
      discountCents = toCents(line.discount.value);
    }
  }
  discountCents = Math.min(discountCents, subtotalCents);

  const netCents = subtotalCents - discountCents;
  const vatRate = Number(line.vatRate) || 0;
  const vatCents = Math.round(netCents * (vatRate / 100));
  const totalCents = netCents + vatCents;

  return {
    subtotalCents,
    discountCents,
    netCents,
    vatCents,
    totalCents
  };
}

// Aggregates all lines of an invoice into totals, and applies amounts already paid.
export function computeInvoiceTotals(lines, amountPaid = 0) {
  let totalHTCents = 0; // net of discount, excluding VAT
  let totalVatCents = 0;
  let totalTTCCents = 0;
  const vatBreakdown = {}; // rate -> { baseCents, vatCents }

  for (const line of lines) {
    const c = computeLine(line);
    totalHTCents += c.netCents;
    totalVatCents += c.vatCents;
    totalTTCCents += c.totalCents;

    const rate = Number(line.vatRate) || 0;
    if (!vatBreakdown[rate]) vatBreakdown[rate] = { baseCents: 0, vatCents: 0 };
    vatBreakdown[rate].baseCents += c.netCents;
    vatBreakdown[rate].vatCents += c.vatCents;
  }

  const paidCents = toCents(amountPaid);
  const remainingCents = totalTTCCents - paidCents;

  return {
    totalHT: toEuros(totalHTCents),
    totalVat: toEuros(totalVatCents),
    totalTTC: toEuros(totalTTCCents),
    amountPaid: toEuros(paidCents),
    remainingDue: toEuros(remainingCents),
    vatBreakdown: Object.fromEntries(
      Object.entries(vatBreakdown).map(([rate, v]) => [
        rate,
        { base: toEuros(v.baseCents), vat: toEuros(v.vatCents) }
      ])
    )
  };
}
