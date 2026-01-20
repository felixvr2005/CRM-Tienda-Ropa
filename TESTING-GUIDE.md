#!/bin/bash

# =====================================================
# SCRIPT DE TESTING - FLUJO COMPLETO
# =====================================================
# Pruebas manuales para verificar que todo funciona

echo "🧪 TESTING SUITE - CRM Tienda Ropa"
echo "===================================="
echo ""
echo "Este documento describe las pruebas manuales que debes hacer"
echo "para verificar que todo el sistema funciona correctamente."
echo ""

# =====================================================
# TEST 1: COMPRA COMPLETA
# =====================================================

echo ""
echo "TEST 1: COMPRA COMPLETA"
echo "======================="
echo ""
echo "Pasos:"
echo "1. Abre http://localhost:3000/productos"
echo "2. Selecciona un producto con stock"
echo "3. Elige color y talla"
echo "4. Haz clic en 'AÑADIR AL CARRITO'"
echo ""
echo "Verificar:"
echo "  ✓ El producto aparece en el carrito"
echo "  ✓ La cantidad se incrementa"
echo "  ✓ El precio total se actualiza"
echo ""
echo "5. Abre http://localhost:3000/carrito"
echo "6. Haz clic en 'PROCEDER AL CHECKOUT'"
echo ""
echo "Verificar:"
echo "  ✓ Los artículos están listados"
echo "  ✓ El resumen de precio está correcto"
echo ""
echo "7. En http://localhost:3000/checkout"
echo "8. Rellena el formulario:"
echo "   - Email: test@example.com"
echo "   - Teléfono: +34 600 000 000"
echo "   - Nombre: Test"
echo "   - Apellidos: User"
echo "   - Dirección: Calle Test, 123"
echo "   - Código Postal: 28001"
echo "   - Ciudad: Madrid"
echo "   - Provincia: Madrid"
echo ""
echo "9. Selecciona método de envío (Estándar)"
echo "10. Selecciona método de pago (Tarjeta)"
echo "11. Marca 'He leído y acepto...'"
echo "12. Haz clic en 'PAGAR AHORA'"
echo ""
echo "Verificar:"
echo "  ✓ Se redirige a Stripe"
echo ""
echo "13. En Stripe, usa tarjeta de prueba: 4242 4242 4242 4242"
echo "14. Cualquier fecha futura, CVC: 123"
echo ""
echo "Verificar:"
echo "  ✓ Se redirige a /checkout/success"
echo "  ✓ Muestra número de pedido (ORD-...)"
echo "  ✓ Muestra artículos del pedido"
echo "  ✓ Muestra total correcto"
echo ""

# =====================================================
# TEST 2: VERIFICAR BD
# =====================================================

echo ""
echo "TEST 2: VERIFICAR BASE DE DATOS"
echo "==============================="
echo ""
echo "En Supabase, verificar:"
echo ""
echo "1. Tabla 'orders':"
echo "   - SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;"
echo "   ✓ Debe mostrar el pedido recién creado"
echo "   ✓ order_number = ORD-... "
echo "   ✓ status = 'confirmed'"
echo "   ✓ payment_status = 'paid'"
echo ""
echo "2. Tabla 'order_items':"
echo "   - SELECT * FROM order_items WHERE order_id = 'uuid_del_pedido';"
echo "   ✓ Debe mostrar los artículos"
echo "   ✓ quantity correcta"
echo "   ✓ unit_price correcta"
echo ""
echo "3. Tabla 'product_variants':"
echo "   - SELECT stock FROM product_variants WHERE id = 'uuid_variante';"
echo "   ✓ Stock debe ser 1 menos que antes"
echo ""

# =====================================================
# TEST 3: ADMIN - VER PEDIDO
# =====================================================

echo ""
echo "TEST 3: ADMIN - VER PEDIDO"
echo "=========================="
echo ""
echo "Pasos:"
echo "1. Abre http://localhost:3000/admin/pedidos"
echo "2. Debe aparecer el pedido recién creado"
echo "3. Haz clic en el número de pedido"
echo ""
echo "Verificar:"
echo "  ✓ Se abre http://localhost:3000/admin/pedidos/[orderNumber]"
echo "  ✓ Muestra información del cliente"
echo "  ✓ Muestra artículos con imágenes"
echo "  ✓ Muestra dirección de envío"
echo "  ✓ Muestra totales (subtotal, envío, total)"
echo ""

# =====================================================
# TEST 4: ADMIN - CAMBIAR ESTADO
# =====================================================

echo ""
echo "TEST 4: ADMIN - CAMBIAR ESTADO"
echo "============================="
echo ""
echo "Pasos:"
echo "1. En página de detalle del pedido"
echo "2. Haz clic en estado 'shipped'"
echo "3. Haz clic en 'Actualizar Estado'"
echo ""
echo "Verificar:"
echo "  ✓ Muestra mensaje de éxito"
echo "  ✓ La página se recarga"
echo "  ✓ El botón 'shipped' está resaltado"
echo ""
echo "4. En Supabase:"
echo "   - SELECT status FROM orders WHERE order_number = 'ORD-...';"
echo "   ✓ status = 'shipped'"
echo ""

# =====================================================
# TEST 5: ADMIN - REFUND
# =====================================================

echo ""
echo "TEST 5: ADMIN - REFUND Y RESTAURACIÓN DE STOCK"
echo "=============================================="
echo ""
echo "Pasos:"
echo "1. En página de detalle del pedido"
echo "2. Haz clic en estado 'refunded'"
echo "3. Haz clic en 'Actualizar Estado'"
echo ""
echo "Verificar:"
echo "  ✓ Muestra mensaje de éxito"
echo "  ✓ El estado cambia a 'refunded'"
echo ""
echo "4. En Supabase:"
echo "   - SELECT stock FROM product_variants WHERE id = 'uuid_variante';"
echo "   ✓ Stock debe ser restaurado (vuelve al valor original)"
echo ""

# =====================================================
# TEST 6: FORMULARIO DE CONTACTO
# =====================================================

echo ""
echo "TEST 6: FORMULARIO DE CONTACTO"
echo "============================="
echo ""
echo "Pasos:"
echo "1. Abre http://localhost:3000/contacto"
echo "2. Rellena el formulario:"
echo "   - Nombre: Test Name"
echo "   - Email: test@example.com"
echo "   - Teléfono: +34 600 000 000"
echo "   - Asunto: Consulta sobre mi pedido"
echo "   - Número de pedido: ORD-..."
echo "   - Mensaje: Hola, quería consultar..."
echo "3. Marca la casilla de privacidad"
echo "4. Haz clic en 'ENVIAR MENSAJE'"
echo ""
echo "Verificar:"
echo "  ✓ Muestra mensaje de éxito verde"
echo "  ✓ El formulario se limpia"
echo ""
echo "5. En Supabase:"
echo "   - SELECT * FROM contact_messages WHERE email = 'test@example.com';"
echo "   ✓ Debe mostrar el mensaje guardado"
echo "   ✓ status = 'new'"
echo ""

# =====================================================
# TEST 7: CONFIGURACIÓN
# =====================================================

echo ""
echo "TEST 7: CONFIGURACIÓN (OFERTAS FLASH)"
echo "===================================="
echo ""
echo "Pasos:"
echo "1. Abre http://localhost:3000/admin/settings"
echo "2. Activa el toggle 'Ofertas Flash'"
echo "3. Ajusta descuento a 25%"
echo "4. Ajusta 'Envío gratis a partir de' a 80€"
echo "5. Haz clic en 'Guardar Cambios'"
echo ""
echo "Verificar:"
echo "  ✓ Muestra mensaje de éxito"
echo ""
echo "6. En Supabase:"
echo "   - SELECT * FROM configuracion WHERE key = 'flash_sales_enabled';"
echo "   ✓ value = 'true'"
echo ""

# =====================================================
# TEST 8: CARRITO - STOCK INSUFICIENTE
# =====================================================

echo ""
echo "TEST 8: VALIDACIÓN DE STOCK"
echo "==========================="
echo ""
echo "Pasos:"
echo "1. Crea un producto con stock = 1"
echo "2. En carrito, añade 2 unidades"
echo "3. Ve a checkout"
echo "4. Intenta pagar"
echo ""
echo "Verificar:"
echo "  ✓ Debe mostrar error: 'Stock insuficiente'"
echo "  ✓ No redirige a Stripe"
echo ""

# =====================================================
# RESUMEN
# =====================================================

echo ""
echo "===================================="
echo "✅ CHECKLIST DE TESTS"
echo "===================================="
echo ""
echo "[ ] Test 1: Compra Completa"
echo "[ ] Test 2: Verificar BD"
echo "[ ] Test 3: Admin - Ver Pedido"
echo "[ ] Test 4: Admin - Cambiar Estado"
echo "[ ] Test 5: Admin - Refund"
echo "[ ] Test 6: Formulario de Contacto"
echo "[ ] Test 7: Configuración"
echo "[ ] Test 8: Validación de Stock"
echo ""
echo "Si todos los tests pasan: ✅ LISTO PARA PRODUCCIÓN"
echo ""
echo "===================================="
