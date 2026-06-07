export interface SubsidyCalculation {
  capacityKw: number;
  eligibleCapacityKw: number;
  category: 'upto_2kw' | '2_3kw' | 'above_3kw';
  subsidyAmount: number;
  maxSubsidy: number;
  description: string;
}

export function calculatePMSuryaSubsidy(systemCapacityKw: number): SubsidyCalculation {
  const MAX_SUBSIDY_KW = 3;
  const RATE_UPTO_2KW = 30_000;
  const RATE_2_TO_3KW = 18_000;
  const MAX_SUBSIDY = 78_000;

  const eligibleKw = Math.min(systemCapacityKw, MAX_SUBSIDY_KW);
  let subsidyAmount = 0;
  let category: SubsidyCalculation['category'];
  let description = '';

  if (eligibleKw <= 2) {
    subsidyAmount = eligibleKw * RATE_UPTO_2KW;
    category = 'upto_2kw';
    description = `₹30,000/kW × ${eligibleKw}kW`;
  } else if (eligibleKw <= 3) {
    subsidyAmount = 2 * RATE_UPTO_2KW + (eligibleKw - 2) * RATE_2_TO_3KW;
    category = '2_3kw';
    description = `₹30,000/kW × 2kW + ₹18,000/kW × ${(eligibleKw - 2).toFixed(1)}kW`;
  } else {
    subsidyAmount = MAX_SUBSIDY;
    category = 'above_3kw';
    description = 'Maximum subsidy (>3kW systems)';
  }

  return {
    capacityKw: systemCapacityKw,
    eligibleCapacityKw: eligibleKw,
    category,
    subsidyAmount: Math.round(subsidyAmount),
    maxSubsidy: MAX_SUBSIDY,
    description,
  };
}
