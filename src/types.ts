export type UserRole = 'admin' | 'agent' | 'client';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  jobTitle?: string;
  location?: string;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  builder?: string;
  yearBuilt?: number;
  propertyClass?: string;
  buildingType?: string;
  style?: string;
  model?: string;
  community: string;
  address: string;
  beds?: number;
  baths?: number;
  size?: number;
  price?: number;
  isOurInventory: boolean;
  addedDate: string;
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  type: 'buyer' | 'seller' | 'investor';
  assignedTo?: string; // User ID
  company?: string;
  createdAt: string;
}

export interface DealStage {
  id: string;
  name: string;
  order: number;
}

export interface Deal {
  id: string;
  propertyId: string;
  assignedAgentId?: string;
  stageId: string;
  value?: number;
  contactIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  dealId?: string;
  contactId?: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'custom';
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dealId?: string;
  contactId?: string;
  assignedTo?: string;
  dueDate?: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface Showing {
  id: string;
  propertyId: string;
  dealId: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  participantIds: string[];
}
