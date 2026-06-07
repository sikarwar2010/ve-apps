import type { CreateLeadInput } from '@/schemas/lead/lead.schema';
import { Building2, Globe, Handshake, Megaphone, PenLine, Search, Store, Users, type LucideIcon } from 'lucide-react';

export type LeadFormStep = 'origin' | 'contact' | 'solar' | 'review';

export const LEAD_FORM_STEPS: {
  id: LeadFormStep;
  title: string;
  description: string;
}[] = [
  { id: 'origin', title: 'Lead origin', description: 'Source and property type' },
  { id: 'contact', title: 'Contact & site', description: 'Customer and address' },
  { id: 'solar', title: 'Solar profile', description: 'Usage and rooftop details' },
  { id: 'review', title: 'Review', description: 'Confirm and create' },
];

export const STEP_FIELDS: Record<LeadFormStep, (keyof CreateLeadInput)[]> = {
  origin: ['source', 'propertyType'],
  contact: ['name', 'mobile', 'email', 'addressLine1', 'city', 'state', 'pincode'],
  solar: [],
  review: [],
};

export const SOURCE_OPTIONS: {
  value: CreateLeadInput['source'];
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  { value: 'manual', label: 'Manual entry', description: 'Walk-in or phone call', icon: PenLine },
  { value: 'website', label: 'Website', description: 'Organic web inquiry', icon: Globe },
  { value: 'meta_ads', label: 'Meta Ads', description: 'Facebook / Instagram', icon: Megaphone },
  { value: 'google_ads', label: 'Google Ads', description: 'Search or display ads', icon: Search },
  { value: 'walk_in', label: 'Walk-in', description: 'Showroom or branch visit', icon: Store },
  { value: 'referral', label: 'Referral', description: 'Customer referred', icon: Users },
  { value: 'electrician_partner', label: 'Electrician', description: 'Partner channel', icon: Handshake },
  { value: 'builder_channel', label: 'Builder', description: 'Builder / developer tie-up', icon: Building2 },
];

export const PROPERTY_OPTIONS: {
  value: NonNullable<CreateLeadInput['propertyType']>;
  label: string;
  description: string;
}[] = [
  { value: 'residential', label: 'Residential', description: 'Home rooftop' },
  { value: 'commercial', label: 'Commercial', description: 'Shop or office' },
  { value: 'industrial', label: 'Industrial', description: 'Factory or warehouse' },
];

export const ROOFTOP_OPTIONS: {
  value: NonNullable<CreateLeadInput['rooftopType']>;
  label: string;
  description: string;
}[] = [
  { value: 'rcc', label: 'RCC', description: 'Concrete flat roof' },
  { value: 'tin', label: 'Metal', description: 'Tin or sheet roof' },
  { value: 'asbestos', label: 'Asbestos', description: 'Legacy sheet roof' },
  { value: 'other', label: 'Other', description: 'Mixed or uncommon' },
];

export function estimateCapacityKw(consumption?: number, billAmt?: number): number | undefined {
  if (consumption && consumption > 0) {
    return Math.min(10, Math.max(1, Math.round((consumption / 120) * 2) / 2));
  }
  if (billAmt && billAmt > 0) {
    return Math.min(10, Math.max(1, Math.round((billAmt / 1000) * 2) / 2));
  }
  return undefined;
}

export function getSourceLabel(source: CreateLeadInput['source']) {
  return SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? source;
}
