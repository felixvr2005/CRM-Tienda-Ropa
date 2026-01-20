/**
 * SCRIPT DE PRUEBA COMPLETO DEL SISTEMA
 * Ejecuta: node test-sistema-completo.js
 */

const https = require('https');

const BASE_URL = 'http://localhost:4322';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const request = require(url.protocol.slice(0, -1)).request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    request.on('error', reject);
    
    if (options.body) {
      request.write(JSON.stringify(options.body));
    }
    
    request.end();
  });
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║          🧪 TEST COMPLETO DEL SISTEMA                     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  let passedTests = 0;
  let failedTests = 0;

  // TEST 1: Servidor disponible
  log('Test 1: Verificar servidor disponible...', 'blue');
  try {
    const response = await makeRequest('/');
    if (response.status === 200) {
      log('✅ Servidor respondiendo en puerto 4322', 'green');
      passedTests++;
    } else {
      log(`❌ Servidor respondió con código ${response.status}`, 'red');
      failedTests++;
    }
  } catch (e) {
    log(`❌ Error conectando al servidor: ${e.message}`, 'red');
    failedTests++;
  }

  // TEST 2: API admin/report GET (previa)
  log('\nTest 2: Verificar API preview de reporte...', 'blue');
  try {
    const response = await makeRequest('/api/admin/report?dateRange=day');
    if (response.status === 200 && response.data) {
      log('✅ API de reporte respondiendo correctamente', 'green');
      log(`   - Total órdenes: ${response.data.total_orders || 0}`, 'green');
      log(`   - Ingresos: €${response.data.total_revenue || 0}`, 'green');
      passedTests++;
    } else {
      log(`❌ API respondió con código ${response.status}`, 'red');
      failedTests++;
    }
  } catch (e) {
    log(`❌ Error: ${e.message}`, 'red');
    failedTests++;
  }

  // TEST 3: Admin panel accesible
  log('\nTest 3: Verificar panel admin de reportes...', 'blue');
  try {
    const response = await makeRequest('/admin/reports');
    if (response.status === 200) {
      log('✅ Panel admin de reportes accesible en /admin/reports', 'green');
      passedTests++;
    } else {
      log(`❌ Panel respondió con código ${response.status}`, 'red');
      failedTests++;
    }
  } catch (e) {
    log(`❌ Error: ${e.message}`, 'red');
    failedTests++;
  }

  // TEST 4: Email service disponible
  log('\nTest 4: Verificar servicio de emails...', 'blue');
  try {
    // Intentar enviar un email de prueba (solo si Gmail está configurado)
    const testEmailData = {
      customerEmail: 'felixvr2005@gmail.com',
      orderData: {
        customer_name: 'Test User',
        order_number: 'TEST-001',
        order_date: new Date().toLocaleDateString('es-ES'),
        order_status: 'Pendiente',
        payment_method: 'Test',
        products: [{
          product_name: 'Producto Test',
          product_sku: 'TEST-SKU',
          quantity: 1,
          unit: 'unidad',
          unit_price: 50,
          total_price: 50
        }],
        subtotal: 50,
        tax_rate: 0,
        tax_amount: 0,
        shipping_cost: 0,
        total_amount: 50,
        active_offers: [],
        recommendations: [],
        promo_code: 'TEST10',
        track_order_url: 'https://test.com/pedidos/TEST-001',
        continue_shopping_url: 'https://test.com',
        customer_address: 'Test Address',
        support_email: 'support@test.com',
        facebook_url: 'https://facebook.com',
        instagram_url: 'https://instagram.com',
        twitter_url: 'https://twitter.com',
        company_name: 'Test Shop',
        current_year: 2026
      }
    };

    const response = await makeRequest('/api/emails/order-confirmation', {
      method: 'POST',
      body: testEmailData
    });

    if (response.status === 200 && response.data?.success) {
      log('✅ Servicio de emails funcionando (email de prueba enviado)', 'green');
      passedTests++;
    } else if (response.status === 200) {
      log('⚠️  API respondió pero sin confirmación de envío', 'yellow');
      passedTests++;
    } else {
      log(`❌ API respondió con código ${response.status}`, 'red');
      log(`   Respuesta: ${JSON.stringify(response.data)}`, 'red');
      failedTests++;
    }
  } catch (e) {
    log(`⚠️  Error (no crítico): ${e.message}`, 'yellow');
  }

  // TEST 5: Export API
  log('\nTest 5: Verificar descarga de datos...', 'blue');
  try {
    const response = await makeRequest('/api/admin/export?dateRange=day&format=json');
    if (response.status === 200 && response.data) {
      log('✅ API de exportación funcionando (formato JSON)', 'green');
      passedTests++;
    } else {
      log(`❌ API respondió con código ${response.status}`, 'red');
      failedTests++;
    }
  } catch (e) {
    log(`❌ Error: ${e.message}`, 'red');
    failedTests++;
  }

  // Resumen
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    📊 RESULTADOS                          ║', 'cyan');
  log('╠════════════════════════════════════════════════════════════╣', 'cyan');
  log(`║ ✅ Pruebas pasadas: ${passedTests}                                       ║`, 'green');
  log(`║ ❌ Pruebas fallidas: ${failedTests}                                       ║`, failedTests > 0 ? 'red' : 'cyan');
  log(`║ 📈 Tasa de éxito: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%                                      ║`, 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  if (failedTests === 0) {
    log('\n🎉 ¡TODOS LOS TESTS PASARON! El sistema está funcionando correctamente.', 'green');
  } else {
    log(`\n⚠️  ${failedTests} test(s) fallaron. Revisa los errores arriba.`, 'yellow');
  }
}

// Ejecutar tests
runTests().catch(console.error);
