// Script para manejo de modales en página de pedidos
// Este archivo se carga con is:client para ejecutarse en el navegador

export function setupOrderModals() {
  console.log('Setting up order modals...');

  // Elementos DOM
  const cancelModal = document.getElementById('cancelModal');
  const returnModal = document.getElementById('returnModal');
  const cancelOrderBtn = document.getElementById('cancelOrderBtn');
  const returnOrderBtn = document.getElementById('returnOrderBtn');
  const confirmCancelBtn = document.getElementById('confirmCancelBtn');
  const submitReturnBtn = document.getElementById('submitReturnBtn');
  const returnForm = document.getElementById('returnForm');
  const returnReason = document.getElementById('returnReason');

  if (!cancelModal || !returnModal) {
    console.error('Modal elements not found');
    return;
  }

  // ===== MODAL CANCELACIÓN =====
  function openCancelModal() {
    console.log('Opening cancel modal');
    cancelModal.classList.remove('hidden');
  }

  function closeCancelModal() {
    console.log('Closing cancel modal');
    cancelModal.classList.add('hidden');
  }

  // Botón para abrir
  if (cancelOrderBtn) {
    cancelOrderBtn.addEventListener('click', openCancelModal);
  }

  // Cerrar al click fuera
  cancelModal.addEventListener('click', (e: any) => {
    if (e.target === cancelModal) {
      closeCancelModal();
    }
  });

  // Botón "No, mantener pedido"
  const cancelNoBtn = cancelModal.querySelector('button:last-of-type') as HTMLButtonElement;
  if (cancelNoBtn && cancelNoBtn.textContent?.includes('No')) {
    cancelNoBtn.addEventListener('click', closeCancelModal);
  }

  // ===== MODAL DEVOLUCIÓN =====
  function openReturnModal() {
    console.log('Opening return modal');
    returnModal.classList.remove('hidden');
  }

  function closeReturnModal() {
    console.log('Closing return modal');
    const form = returnModal.querySelector('#returnForm') as HTMLFormElement;
    const success = returnModal.querySelector('#returnSuccess');
    returnModal.classList.add('hidden');
    if (form) form.classList.remove('hidden');
    if (success) success.classList.add('hidden');
  }

  // Botón para abrir
  if (returnOrderBtn) {
    returnOrderBtn.addEventListener('click', openReturnModal);
  }

  // Cerrar al click fuera
  returnModal.addEventListener('click', (e: any) => {
    if (e.target === returnModal) {
      closeReturnModal();
    }
  });

  // Botón "Cancelar" en modal
  const returnCancelBtn = returnModal.querySelector('button:last-of-type') as HTMLButtonElement;
  if (returnCancelBtn && returnCancelBtn.textContent?.includes('Cancelar')) {
    returnCancelBtn.addEventListener('click', closeReturnModal);
  }

  // ===== HANDLERS DE FORMULARIOS =====

  // Cancelar pedido
  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', async () => {
      const orderNumber = (document.querySelector('h1') as HTMLElement)?.textContent?.replace('#', '').trim() || '';
      if (!orderNumber) {
        alert('No se pudo determinar el número de pedido');
        return;
      }

      confirmCancelBtn.disabled = true;
      const spinner = cancelModal.querySelector('#cancelSpinner');
      if (spinner) spinner.classList.remove('hidden');

      try {
        const response = await fetch('/api/orders/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber })
        });

        const data = await response.json();

        if (response.ok) {
          alert('Pedido cancelado correctamente. Se ha procesado el reembolso.');
          window.location.href = '/cuenta/pedidos';
        } else {
          alert(data.message || 'Error al cancelar el pedido');
          confirmCancelBtn.disabled = false;
          if (spinner) spinner.classList.add('hidden');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cancelar el pedido');
        confirmCancelBtn.disabled = false;
        if (spinner) spinner.classList.add('hidden');
      }
    });
  }

  // Solicitar devolución
  if (returnForm) {
    returnForm.addEventListener('submit', async (e: Event) => {
      e.preventDefault();

      const reason = (returnReason as HTMLTextAreaElement)?.value;
      const orderNumber = (document.querySelector('h1') as HTMLElement)?.textContent?.replace('#', '').trim() || '';

      if (!reason) {
        alert('Por favor, cuéntanos el motivo de la devolución');
        return;
      }

      if (!orderNumber) {
        alert('No se pudo determinar el número de pedido');
        return;
      }

      if (submitReturnBtn) {
        submitReturnBtn.disabled = true;
        submitReturnBtn.textContent = 'Procesando...';
      }

      try {
        const response = await fetch('/api/orders/request-return', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber,
            reason
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Mostrar success
          if (returnForm) returnForm.classList.add('hidden');
          const success = returnModal.querySelector('#returnSuccess');
          if (success) success.classList.remove('hidden');

          // Redirigir después de 3 segundos
          setTimeout(() => {
            window.location.href = '/cuenta/pedidos';
          }, 3000);
        } else {
          alert(data.message || 'Error al solicitar la devolución');
          if (submitReturnBtn) {
            submitReturnBtn.disabled = false;
            submitReturnBtn.textContent = 'Solicitar Devolución';
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al solicitar la devolución');
        if (submitReturnBtn) {
          submitReturnBtn.disabled = false;
          submitReturnBtn.textContent = 'Solicitar Devolución';
        }
      }
    });
  }

  console.log('Order modals setup complete');
}
