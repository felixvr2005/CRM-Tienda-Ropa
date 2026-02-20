export function normalizeCouponForClient(raw: any) {
  if (!raw) return null;
  
  // Determinar el tipo de descuento
  const discountType = raw.discount_type || (raw.amount_off ? 'fixed' : 'percentage');
  
  // Calcular porcentaje de descuento (siempre un número entero: 20 = 20%)
  let discountPercentage = 0;
  if (discountType === 'percentage') {
    discountPercentage = raw.discount_percentage ?? raw.percent_off ?? raw.discount_value ?? 0;
    // Sanity check: si parece una fracción (0.20), convertir a porcentaje entero
    if (discountPercentage > 0 && discountPercentage < 1) {
      discountPercentage = Math.round(discountPercentage * 100);
    }
  }

  // Calcular cantidad fija de descuento (en euros)
  let discountAmount = 0;
  if (discountType === 'fixed') {
    if (typeof raw.discount_amount === 'number') {
      discountAmount = raw.discount_amount;
    } else if (raw.amount_off) {
      // amount_off de Stripe viene en céntimos → convertir a euros
      discountAmount = parseFloat((raw.amount_off / 100).toFixed(2));
    } else if (typeof raw.discount_value === 'number') {
      // discount_value de la BD está en euros directamente (20 = 20€)
      discountAmount = raw.discount_value;
    }
  }
  
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
