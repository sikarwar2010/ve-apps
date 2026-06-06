import { api } from '@/convex/_generated/api';
import { FunctionReturnType } from 'convex/server';

export type Lead = FunctionReturnType<typeof api.modules.lead.listLeads>[number];
