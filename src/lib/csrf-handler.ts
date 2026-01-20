/**
 * CSRF Handler
 * Intercepta todos los formularios POST directo y los convierte a fetch
 */

export function initCSRFHandler() {
  // Interceptar todos los formularios POST
  document.addEventListener('submit', async (e) => {
    const form = e.target as HTMLFormElement;
    
    // Solo para formularios POST directo al servidor (no API)
    if (form.method.toUpperCase() === 'POST' && !form.action.includes('/api/')) {
      e.preventDefault();
      
      // Obtener datos del formulario
      const formData = new FormData(form);
      const data: Record<string, any> = {};
      
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      console.log('CSRF Handler - Intercepted POST form:', { action: form.action, data });
      
      try {
        // Enviar como JSON fetch en lugar de form POST
        const response = await fetch(form.action || window.location.pathname, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          // Recargar página o redirigir
          const redirectUrl = form.getAttribute('data-redirect');
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            window.location.reload();
          }
        } else {
          const error = await response.text();
          console.error('Form submission error:', error);
          alert('Error al procesar el formulario: ' + error);
        }
      } catch (error) {
        console.error('CSRF Handler Error:', error);
        alert('Error al procesar el formulario');
      }
    }
  }, true); // Usar captura para interceptar antes de otros listeners
}
