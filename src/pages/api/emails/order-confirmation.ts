import type { APIRoute } from 'astro';
import { sendCustomerEmail } from '../../../lib/email';
import type { CustomerEmailData } from '../../../lib/email';

// POST - Enviar correo de confirmación a cliente
export const POST: APIRoute = async ({ request }) => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Método no permitido' }), {
            status: 405,
        });
    }

    try {
        const { customerEmail, orderData } = await request.json();

        if (!customerEmail || !orderData) {
            return new Response(
                JSON.stringify({ error: 'customerEmail y orderData son requeridos' }),
                { status: 400 }
            );
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            return new Response(JSON.stringify({ error: 'Email inválido' }), {
                status: 400,
            });
        }

        // Enviar correo
        const result = await sendCustomerEmail(customerEmail, orderData as CustomerEmailData);

        return new Response(
            JSON.stringify({
                success: true,
                message: `Correo de confirmación enviado a ${customerEmail}`,
                messageId: result.messageId,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error al enviar correo:', error);
        return new Response(
            JSON.stringify({
                error: 'Error al enviar el correo',
                details: (error as Error).message,
            }),
            { status: 500 }
        );
    }
};
