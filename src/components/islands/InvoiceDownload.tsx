/**
 * Invoice Download Button - Descargar factura PDF
 */
import { useState } from 'react';

interface InvoiceDownloadProps {
  orderId: string;
  orderNumber: string;
  authToken?: string;
}

export default function InvoiceDownload({ 
  orderId, 
  orderNumber, 
  authToken 
}: InvoiceDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/invoices/generate?orderId=${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken || localStorage.getItem('sb-access-token') || ''}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error descargando factura');
      }

      // Crear un blob del PDF y descargarlo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Error descargando factura');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-primary-600 hover:bg-primary-50 transition-colors rounded-lg border border-primary-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        title="Descargar factura en PDF"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            Descargando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Descargar factura
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
