// numbering.js
// Handles automatic, configurable, unique invoice numbering.
// A number is only consumed when an invoice is finalized (not for drafts),
// and a consumed number is never reused, even if the invoice is later deleted.

import DB from '../db/database.js';

const DEFAULT_PATTERN = 'FACT-{YEAR}-{SEQ:3}';
const COUNTER_ID = 'invoice-counter';

export async function getNumberingSettings() {
  const settings = await DB.get(DB.STORES.settings, 'main');
  return {
    pattern: settings?.numberingPattern || DEFAULT_PATTERN,
    resetYearly: settings?.numberingResetYearly !== false
  };
}

function formatNumber(pattern, seq, year) {
  return pattern
    .replace('{YEAR}', String(year))
    .replace(/\{SEQ:(\d+)\}/, (_, width) => String(seq).padStart(Number(width), '0'))
    .replace('{SEQ}', String(seq));
}

// Reserves and returns the next invoice number. Only call this when actually
// finalizing an invoice (not while it's still a draft).
export async function reserveNextInvoiceNumber() {
  const { pattern, resetYearly } = await getNumberingSettings();
  const year = new Date().getFullYear();
  const counterKey = resetYearly ? `${COUNTER_ID}-${year}` : COUNTER_ID;

  let counter = await DB.get(DB.STORES.counters, counterKey);
  if (!counter) counter = { id: counterKey, lastSeq: 0 };

  counter.lastSeq += 1;
  await DB.put(DB.STORES.counters, counter);

  return formatNumber(pattern, counter.lastSeq, year);
}

export function previewNextNumber(pattern, seq = 1) {
  const year = new Date().getFullYear();
  return formatNumber(pattern || DEFAULT_PATTERN, seq, year);
}

export { DEFAULT_PATTERN };
