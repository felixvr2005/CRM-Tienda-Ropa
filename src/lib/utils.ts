/**
 * Utility Functions
 */

// Formatear precio en EUR
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

// Calcular precio con descuento
export function calculateDiscountedPrice(price: number, discountPercentage: number): number {
  if (discountPercentage <= 0) return price;
  return price * (1 - discountPercentage / 100);
}

// Generar slug desde texto
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Truncar texto
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Generar número de orden
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FS-${timestamp}-${random}`;
}

// Clase condicional helper
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Obtener stock total de un producto
export function getTotalStock(variants: { stock: number }[]): number {
  return variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
}

// Verificar si hay stock disponible
export function hasStock(variants: { stock: number }[]): boolean {
  return getTotalStock(variants) > 0;
}

// Formatear fecha
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
