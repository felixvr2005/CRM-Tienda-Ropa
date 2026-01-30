export function normalizeCouponForClient(raw: any) {
  if (!raw) return null;
  
  // Determinar el tipo de descuento
  const discountType = raw.discount_type || (raw.amount_off ? 'fixed' : 'percentage');
  
  // Calcular valores según el tipo
  const discountPercentage = typeof raw.discount_percentage === 'number' 
    ? raw.discount_percentage 
    : (raw.percent_off || (discountType === 'percentage' ? (raw.discount_value || 0) : 0));
    
  const discountAmount = typeof raw.discount_amount === 'number' 
    ? raw.discount_amount 
    : (raw.amount_off ? parseFloat((raw.amount_off / 100).toFixed(2)) : (discountType === 'fixed' ? (raw.discount_value || 0) / 100 : 0));
  
  return {
    valid: true,
    code: raw.code || raw.discount_code || null,
    // Usar camelCase para consistencia en el frontend
    discountAmount,
    discountPercentage,
    discountType,
    // También incluir snake_case para compatibilidad
    discount_amount: discountAmount,
    discount_percentage: discountPercentage,
    discount_type: discountType,
    description: raw.description || null
  };
}
