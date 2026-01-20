import type { APIRoute } from 'astro';
import { exportReportData } from '../../../lib/reports';

// GET - Descargar datos de reporte en CSV, JSON o Excel
export const GET: APIRoute = async ({ url }) => {
    try {
        const dateRange = url.searchParams.get('dateRange') || 'month';
        const format = (url.searchParams.get('format') || 'csv') as 'csv' | 'json' | 'excel';
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        if (!['day', 'week', 'month', 'year', 'custom'].includes(dateRange)) {
            return new Response(
                JSON.stringify({ error: 'dateRange inválido' }),
                { status: 400 }
            );
        }

        if (!['csv', 'json', 'excel'].includes(format)) {
            return new Response(
                JSON.stringify({ error: 'Formato no soportado. Use: csv, json, excel' }),
                { status: 400 }
            );
        }

        const data = await exportReportData(
            dateRange as any,
            format,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        // Determinar tipo MIME y nombre de archivo
        let mimeType = 'text/plain';
        let filename = `reporte_${dateRange}_${new Date().toISOString().split('T')[0]}`;

        if (format === 'csv') {
            mimeType = 'text/csv';
            filename += '.csv';
            return new Response(data, {
                status: 200,
                headers: {
                    'Content-Type': mimeType,
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            });
        }

        if (format === 'json') {
            mimeType = 'application/json';
            filename += '.json';
            return new Response(data, {
                status: 200,
                headers: {
                    'Content-Type': mimeType,
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            });
        }

        if (format === 'excel') {
            return new Response(
                JSON.stringify({
                    message: 'Para exportar a Excel, instale la librería "exceljs"',
                    fallback: 'Descargue en formato CSV o JSON',
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        throw new Error('Formato no soportado');
    } catch (error) {
        console.error('Error al descargar reporte:', error);
        return new Response(
            JSON.stringify({
                error: 'Error al procesar la descarga',
                details: (error as Error).message,
            }),
            { status: 500 }
        );
    }
};
