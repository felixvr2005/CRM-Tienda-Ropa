function formatPrice(price) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(price);
}
function calculateDiscountedPrice(price, discountPercentage) {
  if (discountPercentage <= 0) return price;
  return price * (1 - discountPercentage / 100);
}
function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function getTotalStock(variants) {
  return variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
}

export { calculateDiscountedPrice as c, formatPrice as f, getTotalStock as g, slugify as s };
