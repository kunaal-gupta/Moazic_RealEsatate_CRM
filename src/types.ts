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
  blockLot?: string;
  legalPlan?: string;
  community: string;
  address: string;
  occupancy?: string;
  condoFees?: number;
  cDom?: number;
  dom?: number;
  flooring?: string;
  appliancesIncluded?: boolean;
  jrHighSchool?: string;
  srHighSchool?: string;
  garageType?: string;
  beds?: number;
  baths?: number;
  size?: number;
  price?: number; // Added for UI purposes, though not in Django model explicitly
  floors?: number;
  basement?: string;
  basementDev?: string;
  separateEntrance?: boolean;
  possession?: string;
  landscaped?: string;
  denLevel?: string;
  zeroLotLine?: boolean;
  floorPlanUrl?: string;
  notes?: string;
  addedDate: string;
  isOurInventory: boolean;
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  type: 'buyer' | 'seller' | 'investor';
  assignedTo?: string; // User ID
  createdBy?: string; // User ID
  linkedUser?: string; // User ID
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealStage {
  id: string;
  name: string;
  order: number;
}

export interface Deal {
  id: string;
  propertyIds: string[];
  assignedAgentId?: string;
  stageId: string;
  value?: number;
  contactIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadStage {
  id: string;
  name: string;
  order: number;
}

export interface Lead {
  id: string;
  contactId: string;
  assignedAgentId?: string;
  stageId: string;
  propertyIds?: string[];
  preferredCommunity?: string[];
  minBudget?: number;
  maxBudget?: number;
  minBeds?: number;
  minBaths?: number;
  minSize?: number;
  preferredPropertyClass?: string;
  preferredBuildingType?: string;
  preferredPropertyStyle?: string;
  preferredGarageType?: string[];
  wantsBasement?: boolean;
  wantsSeparateEntrance?: boolean;
  maxCondoFees?: number;
  possessionTimeline?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  note: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadHistory {
  id: string;
  leadId: string;
  stageId: string;
  changedAt: string;
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

export interface ShowingNote {
  id: string;
  note: string;
  createdAt: string;
  propertyId?: string;
}

export interface Showing {
  id: string;
  propertyIds: string[];
  dealId: string;
  scheduledAt: string;
  endScheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  notesTimeline?: ShowingNote[];
  participantIds: string[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface Email {
  id: string;
  contactId: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  scheduledAt?: string;
  dealId?: string;
  createdAt: string;
}
