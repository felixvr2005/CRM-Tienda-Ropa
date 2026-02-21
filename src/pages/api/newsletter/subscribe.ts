import { supabaseAdmin } from '@lib/supabase';
import nodemailer from 'nodemailer';
import { ensureEnv } from '@lib/ensureEnv';
import { logger } from '@lib/logger';

export const prerender = false;

// Verificar credenciales de envío en producción — permitir arranque en modo test/E2E
// En producción exigimos las credenciales; en E2E/local (PLAYWRIGHT_RUNNING) permitimos arrancar sin ellas
if (process.env.NODE_ENV === 'production' && !process.env.PLAYWRIGHT_RUNNING && !process.env.SKIP_ENV_CHECKS) {
  ensureEnv(['GMAIL_USER', 'GMAIL_APP_PASSWORD']);
} else {
  // Permitir arranque en entornos de test/local donde no hay SMTP configurado
  logger.debug('Newsletter: SMTP env check skipped (production bypass for test/local)');
}

// Configurar nodemailer con Gmail (usando las credenciales que ya funcionan)"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function sendNewsletterWelcomeEmail(email: string, discountCode: string) {
  const baseUrl = process.env.PUBLIC_APP_URL || 'https://essentialforce.victoriafp.online';
  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #404040; background-color: #f5f5f5; margin: 0; -webkit-font-smoothing: antialiased; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      .header { background-color: #171717; color: #ffffff; padding: 32px 40px; text-align: center; }
      .header h1 { font-size: 13px; letter-spacing: 4px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px; }
      .header p { font-size: 12px; color: #a3a3a3; font-weight: 300; margin: 0; }
      .content { padding: 40px; }
      .section-title { font-size: 11px; letter-spacing: 2px; font-weight: 600; text-transform: uppercase; color: #737373; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
      .code-box { background-color: #fafafa; border: 1px solid #e5e5e5; padding: 24px; text-align: center; margin: 20px 0; }
      .code { font-size: 28px; font-weight: 700; color: #171717; font-family: monospace; letter-spacing: 4px; }
      .cta-section { text-align: center; margin: 28px 0; }
      .cta-button { display: inline-block; background-color: #ffffff; color: #171717; padding: 14px 40px; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; border: 2px solid #171717; }
      .footer { background-color: #fafafa; padding: 28px 40px; text-align: center; border-top: 1px solid #e5e5e5; }
      .footer-note { font-size: 11px; color: #a3a3a3; line-height: 1.6; }
      @media (max-width: 600px) { .content { padding: 24px 20px; } .header { padding: 24px 20px; } .footer { padding: 20px; } }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Essential Force</h1>
        <p>Bienvenido a la comunidad</p>
      </div>

      <!-- Content -->
      <div class="content">
        <p style="font-size: 15px; color: #171717; margin: 0 0 8px;">Hola,</p>
        <p style="font-size: 14px; color: #404040; margin: 0 0 28px;">
          Gracias por suscribirte a nuestro newsletter. Te damos la bienvenida a la comunidad Essential Force.
        </p>

        <p style="font-size: 14px; color: #404040; margin: 0 0 16px;">
          Como regalo especial, te ofrecemos un <strong>20% de descuento</strong> en tu próxima compra usando el siguiente código:
        </p>

        <!-- Código de descuento -->
        <div class="section-title">Tu código de descuento</div>
        <div class="code-box">
          <div class="code">${discountCode}</div>
          <p style="margin: 8px 0 0; font-size: 12px; color: #a3a3a3;">Sin fecha de vencimiento</p>
        </div>

        <!-- CTA -->
        <div class="cta-section">
          <a href="${baseUrl}/productos" class="cta-button" style="display: inline-block; background-color: #ffffff; color: #171717; padding: 14px 40px; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; border: 2px solid #171717;">Explorar productos</a>
        </div>

        <!-- Qué esperar -->
        <div class="section-title" style="margin-top: 32px;">Qué esperar de nosotros</div>
        <ul style="margin: 0; padding-left: 20px; color: #404040; font-size: 13px; line-height: 1.8;">
          <li>Promociones exclusivas solo para suscriptores</li>
          <li>Nuevas colecciones y lanzamientos</li>
          <li>Consejos de moda y tendencias</li>
          <li>Ofertas especiales en tu cumpleaños</li>
        </ul>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-note">
          © ${new Date().getFullYear()} Essential Force. Todos los derechos reservados.<br>
          <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&code=${discountCode}" style="color: #a3a3a3; text-decoration: underline;">Darte de baja</a>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER || 'noreply@essentialforce.com',
      to: email,
      subject: '¡Bienvenido! Tu código de descuento especial - Essential Force',
      html: htmlContent
    });
    logger.info('Newsletter welcome email sent', { to: email });
    return true;
  } catch (error) {
    logger.error('Error sending newsletter welcome email', { error: String(error) });
    return false;
  }
}

export async function POST({ request }: any) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ message: 'Email requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ message: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // In E2E/test mode we must NOT call external services (Supabase / SMTP).
    // Return a deterministic mocked response so Playwright `request` and UI flows are stable.
    if (process.env.PLAYWRIGHT_RUNNING) {
      logger.info('PLAYWRIGHT_RUNNING: returning mocked newsletter subscription (no Supabase call)');
      const discountCode = 'E2E1234';
      return new Response(JSON.stringify({ message: 'Suscripción (mocked)', code: discountCode, emailSent: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Generar código de descuento único
    const discountCode = `WELCOME${Math.floor(Math.random() * 90) + 10}`;

    // Guardar suscripción
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({
        email,
        discount_code: discountCode,
        subscribed_at: new Date().toISOString(),
        used: false
      } as any, {
        onConflict: 'email'
      });

    if (error) {
      logger.error('Error saving newsletter subscription', { error });
      // Si estamos en modo E2E/local permitimos un fallback mock para tests locales
      if (process.env.PLAYWRIGHT_RUNNING) {
        logger.info('PLAYWRIGHT_RUNNING: returning mocked newsletter subscription result');
        return new Response(JSON.stringify({ message: 'Suscripción (mocked)', code: 'E2E1234', emailSent: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(
        JSON.stringify({ message: 'Error al suscribirse' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Enviar email profesional
    const emailSent = await sendNewsletterWelcomeEmail(email, discountCode);

    return new Response(
      JSON.stringify({
        message: 'Suscripción exitosa' + (emailSent ? ' - Email enviado' : ''),
        code: discountCode,
        emailSent
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Error in newsletter/subscribe', { error: String(error) });
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
