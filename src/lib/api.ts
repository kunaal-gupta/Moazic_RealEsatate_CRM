import { User, Property, Contact, Deal, Activity, Task, Showing, DealStage, EmailTemplate, Email, Lead, LeadStage } from '../types';

const API_BASE = '/api';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  users: {
    list: () => fetcher<User[]>('/users'),
    create: (data: Partial<User>) => fetcher<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  },
  properties: {
    list: () => fetcher<Property[]>('/properties'),
    create: (data: Partial<Property>) => fetcher<Property>('/properties', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Property>) => fetcher<Property>(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  contacts: {
    list: () => fetcher<Contact[]>('/contacts'),
    create: (data: Partial<Contact>) => fetcher<Contact>('/contacts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Contact>) => fetcher<Contact>(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  deals: {
    list: () => fetcher<Deal[]>('/deals'),
    create: (data: Partial<Deal>) => fetcher<Deal>('/deals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Deal>) => fetcher<Deal>(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  leads: {
    list: () => fetcher<Lead[]>('/leads'),
    create: (data: Partial<Lead>) => fetcher<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Lead>) => fetcher<Lead>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher<void>(`/leads/${id}`, { method: 'DELETE' }),
  },
  stages: {
    list: () => fetcher<DealStage[]>('/dealStages'),
  },
  leadStages: {
    list: () => fetcher<LeadStage[]>('/leadStages'),
  },
  activities: {
    list: () => fetcher<Activity[]>('/activities'),
    create: (data: Partial<Activity>) => fetcher<Activity>('/activities', { method: 'POST', body: JSON.stringify(data) }),
  },
  tasks: {
    list: () => fetcher<Task[]>('/tasks'),
    create: (data: Partial<Task>) => fetcher<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Task>) => fetcher<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  showings: {
    list: () => fetcher<Showing[]>('/showings'),
    create: (data: Partial<Showing>) => fetcher<Showing>('/showings', { method: 'POST', body: JSON.stringify(data) }),
  },
  emailTemplates: {
    list: () => fetcher<EmailTemplate[]>('/emailTemplates'),
    create: (data: Partial<EmailTemplate>) => fetcher<EmailTemplate>('/emailTemplates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<EmailTemplate>) => fetcher<EmailTemplate>(`/emailTemplates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher<void>(`/emailTemplates/${id}`, { method: 'DELETE' }),
  },
  emails: {
    list: () => fetcher<Email[]>('/emails'),
    create: (data: Partial<Email>) => fetcher<Email>('/emails', { method: 'POST', body: JSON.stringify(data) }),
  },
};
