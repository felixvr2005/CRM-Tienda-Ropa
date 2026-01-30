/**
 * Credit Note Download - Descargar abono/nota de crédito
 */
import { useState } from 'react';

interface CreditNoteDownloadProps {
  returnRequestId: string;
  originalOrderId: string;
  orderNumber: string;
  authToken?: string;
}

export default function CreditNoteDownload({
  returnRequestId,
  originalOrderId,
  orderNumber,
  authToken
}: CreditNoteDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownloadCreditNote = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invoices/credit-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || localStorage.getItem('sb-access-token') || ''}`
        },
        body: JSON.stringify({
          returnRequestId,
          originalOrderId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error descargando abono');
      }

      // Crear un blob del PDF y descargarlo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `abono-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Error descargando abono');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownloadCreditNote}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
        title="Descargar nota de crédito"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Descargando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar abono
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 mt-2">Error: {error}</p>
      )}
    </div>
  );
}
