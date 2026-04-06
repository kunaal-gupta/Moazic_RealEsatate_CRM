import { User, Property, Contact, Deal, Activity, Task, Showing, DealStage } from './types';

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
  },
  contacts: {
    list: () => fetcher<Contact[]>('/contacts'),
    create: (data: Partial<Contact>) => fetcher<Contact>('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  },
  deals: {
    list: () => fetcher<Deal[]>('/deals'),
    create: (data: Partial<Deal>) => fetcher<Deal>('/deals', { method: 'POST', body: JSON.stringify(data) }),
  },
  stages: {
    list: () => fetcher<DealStage[]>('/dealStages'),
  },
  activities: {
    list: () => fetcher<Activity[]>('/activities'),
    create: (data: Partial<Activity>) => fetcher<Activity>('/activities', { method: 'POST', body: JSON.stringify(data) }),
  },
  tasks: {
    list: () => fetcher<Task[]>('/tasks'),
    create: (data: Partial<Task>) => fetcher<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  },
  showings: {
    list: () => fetcher<Showing[]>('/showings'),
    create: (data: Partial<Showing>) => fetcher<Showing>('/showings', { method: 'POST', body: JSON.stringify(data) }),
  },
};
