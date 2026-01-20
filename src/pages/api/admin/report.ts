import type { APIRoute } from 'astro';
import { sendAdminEmail } from '../../../lib/email';
import { generateAdminEmailData, exportReportData } from '../../../lib/reports';

// POST - Enviar reporte a administrador
export const POST: APIRoute = async ({ request }) => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
    }

    try {
        const { dateRange, adminEmail, startDate, endDate } = await request.json();

        if (!dateRange || !adminEmail) {
            return new Response(
                JSON.stringify({
                    error: 'dateRange y adminEmail son requeridos',
                }),
                { status: 400 }
            );
        }

        // Validar rango de fecha
        if (!['day', 'week', 'month', 'year', 'custom'].includes(dateRange)) {
            return new Response(
                JSON.stringify({ error: 'dateRange inválido' }),
                { status: 400 }
            );
        }

        // Generar datos del reporte
        const reportData = await generateAdminEmailData(
            dateRange as any,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        // Enviar correo
        const result = await sendAdminEmail(adminEmail, reportData);

        return new Response(
            JSON.stringify({
                success: true,
                message: `Reporte enviado a ${adminEmail}`,
                messageId: result.messageId,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error al enviar reporte:', error);
        return new Response(
            JSON.stringify({
                error: 'Error al procesar el reporte',
                details: (error as Error).message,
            }),
            { status: 500 }
        );
    }
};

// GET - Obtener preview del reporte (sin enviar)
export const GET: APIRoute = async ({ url }) => {
    try {
        const dateRange = url.searchParams.get('dateRange') || 'day';
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        if (!['day', 'week', 'month', 'year', 'custom'].includes(dateRange)) {
            return new Response(
                JSON.stringify({ error: 'dateRange inválido' }),
                { status: 400 }
            );
        }

        const reportData = await generateAdminEmailData(
            dateRange as any,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        return new Response(JSON.stringify(reportData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error al obtener preview del reporte:', error);
        return new Response(
            JSON.stringify({
                error: 'Error al procesar el reporte',
                details: (error as Error).message,
            }),
            { status: 500 }
        );
    }
};
