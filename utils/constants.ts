/** Status label + color maps for SuryaERP entities */

export const LEAD_STATUS: Record<string, { label: string; tone: string }> = {
  new: { label: 'New', tone: 'blue' },
  contacted: { label: 'Contacted', tone: 'purple' },
  interested: { label: 'Interested', tone: 'indigo' },
  survey_scheduled: { label: 'Survey Scheduled', tone: 'amber' },
  survey_completed: { label: 'Survey Done', tone: 'teal' },
  quotation_sent: { label: 'Quotation Sent', tone: 'cyan' },
  negotiation: { label: 'Negotiation', tone: 'orange' },
  won: { label: 'Won', tone: 'green' },
  lost: { label: 'Lost', tone: 'red' },
};

export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'slate' },
  confirmed: { label: 'Confirmed', tone: 'blue' },
  in_procurement: { label: 'In Procurement', tone: 'violet' },
  ready_for_dispatch: { label: 'Ready to Dispatch', tone: 'amber' },
  dispatched: { label: 'Dispatched', tone: 'orange' },
  installation_pending: { label: 'Installation Pending', tone: 'yellow' },
  installed: { label: 'Installed', tone: 'teal' },
  net_meter_pending: { label: 'Net Meter Pending', tone: 'cyan' },
  subsidy_pending: { label: 'Subsidy Pending', tone: 'indigo' },
  completed: { label: 'Completed', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

export const QUOTATION_STATUS: Record<string, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'slate' },
  sent: { label: 'Sent', tone: 'blue' },
  under_negotiation: { label: 'Under Negotiation', tone: 'amber' },
  approved: { label: 'Approved', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'red' },
  expired: { label: 'Expired', tone: 'slate' },
  converted_to_order: { label: 'Converted', tone: 'violet' },
};

export const SURVEY_STATUS: Record<string, { label: string; tone: string }> = {
  scheduled: { label: 'Scheduled', tone: 'blue' },
  in_progress: { label: 'In Progress', tone: 'amber' },
  completed: { label: 'Completed', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

export const SUBSIDY_STATUS: Record<string, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'slate' },
  documents_collected: { label: 'Docs Collected', tone: 'blue' },
  submitted_to_portal: { label: 'Submitted', tone: 'cyan' },
  under_review: { label: 'Under Review', tone: 'amber' },
  inspection_pending: { label: 'Inspection Pending', tone: 'orange' },
  inspection_done: { label: 'Inspection Done', tone: 'teal' },
  approved: { label: 'Approved', tone: 'green' },
  payment_pending: { label: 'Payment Pending', tone: 'violet' },
  paid: { label: 'Paid', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'red' },
};

export const TICKET_STATUS: Record<string, { label: string; tone: string }> = {
  open: { label: 'Open', tone: 'blue' },
  assigned: { label: 'Assigned', tone: 'cyan' },
  in_progress: { label: 'In Progress', tone: 'amber' },
  pending_customer: { label: 'Pending Customer', tone: 'orange' },
  resolved: { label: 'Resolved', tone: 'green' },
  closed: { label: 'Closed', tone: 'slate' },
};

export const INVOICE_STATUS: Record<string, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'slate' },
  sent: { label: 'Sent', tone: 'blue' },
  partial: { label: 'Partial', tone: 'amber' },
  paid: { label: 'Paid', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

export const TONE_CLASSES: Record<string, string> = {
  slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
  blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
  cyan: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  green: 'bg-green-500/10 text-green-700 dark:text-green-400',
  red: 'bg-red-500/10 text-red-700 dark:text-red-400',
  violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
};
