const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const logoPath = path.join(__dirname, '..', '..', '..', 'logoSUCOVI.jpeg');

function formatFecha(fecha) {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function sendConfirmationEmail({ email, nombreComprador, apellidoComprador, numeroRifa, nombreRifa, descripcionRifa, fechaSorteo }) {
  const fechaStr = formatFecha(fechaSorteo);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 16px;">
        <img src="cid:logoSUCOVI" alt="SUCOVI 2027" style="width: 120px; height: 120px; object-fit: contain;" />
      </div>
      <h2 style="color: #008C45; text-align: center;">¡Compra de Rifa Confirmada!</h2>
      <p>Hola <strong>${nombreComprador} ${apellidoComprador}</strong>,</p>
      <p>Tu compra para la rifa <strong>"${nombreRifa}"</strong> ha sido registrada exitosamente.</p>
      <div style="background: #f8f8f8; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 4px;"><strong>Rifa:</strong> ${nombreRifa}</p>
        ${descripcionRifa ? `<p style="margin: 0 0 4px;"><strong>Descripción:</strong> ${descripcionRifa}</p>` : ''}
        ${fechaStr ? `<p style="margin: 0;"><strong>Fecha del sorteo:</strong> ${fechaStr}</p>` : ''}
      </div>
      <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">Tu número de rifa es:</p>
        <p style="margin: 0; font-size: 48px; font-weight: bold; color: #008C45; letter-spacing: 4px;">${numeroRifa}</p>
      </div>
      <p style="color: #64748b; font-size: 14px; text-align: center;">Guardá este número. ¡Buena suerte!</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Tu número de rifa: ${numeroRifa}`,
      html,
      attachments: [
        {
          filename: 'logoSUCOVI.jpeg',
          path: logoPath,
          cid: 'logoSUCOVI',
        },
      ],
    });
    console.log(`[EMAIL] ✔ Enviado a ${email}`);
  } catch (err) {
    console.error(`[EMAIL] ✘ Error enviando a ${email}:`, err.message);
  }
}

module.exports = { sendConfirmationEmail };
