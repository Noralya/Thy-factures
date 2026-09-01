// repository.js
// Higher-level data access functions used by the views.

import DB from './database.js';
import { generateId } from '../utils/uid.js';

// ---------- Profile ----------
export async function getProfile() {
  return (await DB.get(DB.STORES.profile, 'main')) || { id: 'main' };
}
export async function saveProfile(profile) {
  profile.id = 'main';
  await DB.put(DB.STORES.profile, profile);
  return profile;
}

// ---------- Settings ----------
export async function getSettings() {
  return (await DB.get(DB.STORES.settings, 'main')) || {
    id: 'main',
    numberingPattern: 'FACT-{YEAR}-{SEQ:3}',
    numberingResetYearly: true
  };
}
export async function saveSettings(settings) {
  settings.id = 'main';
  await DB.put(DB.STORES.settings, settings);
  return settings;
}

// ---------- Clients ----------
export async function listClients() {
  const clients = await DB.getAll(DB.STORES.clients);
  return clients.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || '', 'fr'));
}
export async function getClient(id) {
  return DB.get(DB.STORES.clients, id);
}
export async function saveClient(client) {
  if (!client.id) {
    client.id = generateId('cli-');
    client.createdAt = new Date().toISOString();
  }
  client.updatedAt = new Date().toISOString();
  await DB.put(DB.STORES.clients, client);
  return client;
}
export async function deleteClient(id) {
  // Old invoices already hold a snapshot of client info, so this is safe.
  return DB.delete(DB.STORES.clients, id);
}

// ---------- Services (catalogue of prestations) ----------
export async function listServices() {
  const services = await DB.getAll(DB.STORES.services);
  return services.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr'));
}
export async function getService(id) {
  return DB.get(DB.STORES.services, id);
}
export async function saveService(service) {
  if (!service.id) {
    service.id = generateId('svc-');
    service.createdAt = new Date().toISOString();
  }
  service.updatedAt = new Date().toISOString();
  await DB.put(DB.STORES.services, service);
  return service;
}
export async function deleteService(id) {
  // Old invoice lines already hold their own copy of the price, so this is safe.
  return DB.delete(DB.STORES.services, id);
}

// ---------- Invoices ----------
export async function listInvoices() {
  const invoices = await DB.getAll(DB.STORES.invoices);
  return invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export async function getInvoice(id) {
  return DB.get(DB.STORES.invoices, id);
}
export async function saveInvoice(invoice) {
  if (!invoice.id) {
    invoice.id = generateId('inv-');
    invoice.createdAt = new Date().toISOString();
  }
  invoice.updatedAt = new Date().toISOString();
  await DB.put(DB.STORES.invoices, invoice);
  return invoice;
}
export async function deleteInvoice(id) {
  return DB.delete(DB.STORES.invoices, id);
}

export async function duplicateInvoice(sourceId) {
  const source = await getInvoice(sourceId);
  if (!source) throw new Error('Facture introuvable.');
  const copy = JSON.parse(JSON.stringify(source));
  copy.id = generateId('inv-');
  copy.number = null;
  copy.status = 'draft';
  copy.issueDate = new Date().toISOString().slice(0, 10);
  copy.serviceDate = '';
  copy.dueDate = '';
  copy.amountPaid = 0;
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = copy.createdAt;
  copy.finalizedAt = null;
  await DB.put(DB.STORES.invoices, copy);
  return copy;
}
