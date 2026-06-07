/** Default terms for PM Surya Ghar solar quotations (India) */
export const DEFAULT_QUOTATION_TERMS = `1. This quotation is valid for 30 days from the date of issue unless extended in writing.
2. All prices are in Indian Rupees (INR). GST is charged as per applicable HSN rates shown in the line items.
3. PM Surya Ghar central subsidy is estimated based on current MNRE guidelines and is subject to customer eligibility, DISCOM approval, and successful portal submission. Subsidy is credited directly to the customer's bank account by the government.
4. Payment shall be made as per the milestone schedule mentioned herein. Token/advance is non-refundable once purchase order is confirmed and procurement begins.
5. Standard installation timeline is 15–21 working days from material dispatch, subject to weather, DISCOM net-metering approvals, and site readiness.
6. Product warranty as per OEM: Solar modules typically 25 years performance warranty; inverter 5–10 years; workmanship warranty 1 year from commissioning.
7. Customer shall provide safe roof access, water/electricity at site, and complete KYC documents for subsidy processing.
8. Any civil/structural reinforcement beyond standard RCC/tin structure scope will be quoted separately after site survey.
9. Disputes subject to jurisdiction of courts at the company's registered office location.`;

export const PAYMENT_MILESTONES_DEFAULT = {
  tokenAmountPct: 10,
  onDeliveryPct: 40,
  onInstallationPct: 40,
  onSubsidyPct: 10,
} as const;

/** Lead statuses eligible for site survey scheduling */
export const SURVEY_ELIGIBLE_LEAD_STATUSES = ['new', 'contacted', 'interested', 'survey_scheduled'] as const;

/** Lead statuses eligible for quotation creation */
export const QUOTATION_ELIGIBLE_LEAD_STATUSES = [
  'survey_completed',
  'interested',
  'quotation_sent',
  'negotiation',
] as const;

/** Lead statuses that block new pre-sales activity */
export const CLOSED_LEAD_STATUSES = ['won', 'lost'] as const;

export function numberToWordsINR(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)} Crore`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(2)} Lakh`;
  return amount.toLocaleString('en-IN');
}
