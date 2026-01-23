import { a as supabaseAdmin } from '../../../supabase.41eewI-c.mjs';
import PDFDocument from 'pdfkit';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ url, request }) => {
  try {
    const orderId = url.searchParams.get("orderId");
    const authHeader = request.headers.get("authorization");
    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID requerido" }), { status: 400 });
    }
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }
    const { data: order, error: orderError } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).single();
    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Orden no encontrada" }), { status: 404 });
    }
    const { data: orderItems, error: itemsError } = await supabaseAdmin.from("order_items").select("*").eq("order_id", orderId);
    if (itemsError || !orderItems) {
      return new Response(JSON.stringify({ error: "Error obteniendo items" }), { status: 500 });
    }
    const doc = new PDFDocument();
    let buffers = [];
    doc.on("data", (chunk) => {
      buffers.push(chunk);
    });
    doc.fontSize(20).font("Helvetica-Bold").text("FACTURA", 50, 50);
    doc.fontSize(10).font("Helvetica").text(`Número: ${order.order_number}`, 50, 80);
    doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString("es-ES")}`, 50, 95);
    doc.fontSize(12).font("Helvetica-Bold").text("Fashion Store", 50, 130);
    doc.fontSize(10).font("Helvetica").text("Calle Principal 123", 50, 150);
    doc.text("28001 Madrid, España", 50, 165);
    doc.text("info@fashionstore.com", 50, 180);
    doc.fontSize(10).font("Helvetica-Bold").text("FACTURADO A:", 300, 130);
    const billingInfo = order.billing_address || {};
    doc.fontSize(9).font("Helvetica").text(`${billingInfo.first_name || ""} ${billingInfo.last_name || ""}`, 300, 150).text(billingInfo.address || "", 300, 165).text(`${billingInfo.postal_code || ""} ${billingInfo.city || ""}`, 300, 180).text(billingInfo.country || "", 300, 195);
    const startY = 240;
    const colWidths = [250, 80, 80, 80];
    const cols = ["Producto", "Cantidad", "Precio", "Total"];
    doc.fontSize(10).font("Helvetica-Bold");
    cols.forEach((col, i) => {
      doc.text(col, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY);
    });
    doc.moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();
    let currentY = startY + 25;
    doc.font("Helvetica").fontSize(9);
    orderItems.forEach((item) => {
      const itemName = item.product_name || "Producto";
      const itemTotal = item.price / 100 * item.quantity;
      doc.text(itemName, 50, currentY, { width: colWidths[0] - 10 });
      doc.text(item.quantity.toString(), 50 + colWidths[0], currentY);
      doc.text(`€${(item.price / 100).toFixed(2)}`, 50 + colWidths[0] + colWidths[1], currentY);
      doc.text(`€${itemTotal.toFixed(2)}`, 50 + colWidths[0] + colWidths[1] + colWidths[2], currentY);
      currentY += 20;
    });
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;
    const subtotal = orderItems.reduce((sum, item) => sum + item.price / 100 * item.quantity, 0);
    const shipping = order.shipping_cost / 100;
    const tax = subtotal * 0.21;
    const total = subtotal + shipping + tax;
    doc.fontSize(10).font("Helvetica").text(`Subtotal: €${subtotal.toFixed(2)}`, 350, currentY).text(`Envío: €${shipping.toFixed(2)}`, 350, currentY + 20).text(`IVA (21%): €${tax.toFixed(2)}`, 350, currentY + 40);
    doc.font("Helvetica-Bold").fontSize(12).text(`TOTAL: €${total.toFixed(2)}`, 350, currentY + 60);
    doc.fontSize(8).font("Helvetica").text(
      "Gracias por su compra. Los datos están protegidos según RGPD.",
      50,
      700,
      { align: "center", width: 500 }
    );
    doc.end();
    return new Promise((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(
          new Response(pdfBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="factura-${order.order_number}.pdf"`
            }
          })
        );
      });
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return new Response(
      JSON.stringify({ error: "Error generando factura" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
