import { supabaseAdmin } from '@lib/supabase';
import nodemailer from 'nodemailer';
import { ensureEnv } from '@lib/ensureEnv';
import { logger } from '@lib/logger';

export const prerender = false;

// Verificar credenciales de envío en producción
ensureEnv(['GMAIL_USER', 'GMAIL_APP_PASSWORD']);

// Configurar nodemailer con Gmail (usando las credenciales que ya funcionan)"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function sendNewsletterWelcomeEmail(email: string, discountCode: string) {
  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
      .code-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
      .code { font-size: 32px; font-weight: bold; color: #667eea; font-family: monospace; letter-spacing: 2px; }
      .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>¡Bienvenido a Fashion Store!</h1>
        <p>Tu código de descuento especial te espera</p>
      </div>
      <div class="content">
        <h2>Hola,</h2>
        <p>Gracias por suscribirte a nuestro newsletter. Te damos la bienvenida a la comunidad Fashion Store.</p>
        
        <p>Como regalo especial, te ofrecemos un <strong>20% de descuento</strong> en tu próxima compra usando el siguiente código:</p>
        
        <div class="code-box">
          <div class="code">${discountCode}</div>
        </div>
        
        <p>Puedes usar este código en cualquier momento durante el proceso de compra. <strong>No tiene fecha de vencimiento.</strong></p>
        
        <a href="${process.env.PUBLIC_APP_URL || 'https://tienda.com'}/productos" class="button">Explora nuestros productos</a>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <h3>¿Qué esperar de nosotros?</h3>
        <ul>
          <li>Promociones exclusivas solo para suscriptores</li>
          <li>Nuevas colecciones y lanzamientos</li>
          <li>Consejos de moda y tendencias</li>
          <li>Ofertas especiales en tu cumpleaños</li>
        </ul>
        
        <div class="footer">
          <p>Fashion Store - Tu tienda de moda online</p>
          <p>Si deseas dejar de recibir emails, <a href="${(process.env.PUBLIC_APP_URL || 'https://tienda.com')}/unsubscribe?email=${encodeURIComponent(email)}&code=${discountCode}">haz clic aquí para darte de baja</a></p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER || 'noreply@fashionstore.com',
      to: email,
      subject: '¡Bienvenido! Tu código de descuento especial - Fashion Store',
      html: htmlContent
    });
    logger.info('Email enviado a:', email);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
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
      console.error('Error guardando suscripción:', error);
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
    console.error('Error en newsletter/subscribe:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
