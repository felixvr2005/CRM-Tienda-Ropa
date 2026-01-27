export function normalizeCouponForClient(raw: any) {
  if (!raw) return null;
  return {
    valid: true,
    code: raw.code || raw.discount_code || null,
    discount_amount: typeof raw.discount_amount === 'number' ? raw.discount_amount : (raw.amount_off ? parseFloat((raw.amount_off / 100).toFixed(2)) : 0),
    discount_percentage: typeof raw.discount_percentage === 'number' ? raw.discount_percentage : (raw.percent_off || 0),
    discount_type: raw.discount_type || (raw.amount_off ? 'fixed' : 'percentage'),
    description: raw.description || null
  };
}
