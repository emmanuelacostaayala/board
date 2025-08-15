import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extraer datos del formulario
    const nombre = formData.get('nombre');
    const apellido = formData.get('apellido');
    const correo = formData.get('correo');
    const telefono = formData.get('telefono');
    
    // Extraer archivos
    const titulo = formData.get('titulo');
    const perfusiones = formData.get('perfusiones');
    const notas = formData.get('notas');
    const trabajo = formData.get('trabajo');

    // Validar que todos los campos están presentes
    if (!nombre || !apellido || !correo || !telefono) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    if (!titulo || !perfusiones || !notas || !trabajo) {
      return NextResponse.json(
        { error: 'Faltan documentos requeridos' },
        { status: 400 }
      );
    }

    // Configurar el transportador de correo
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Preparar los adjuntos
    const attachments = [];

    // Función para convertir archivo a buffer
    const fileToBuffer = async (file, filename) => {
      if (file) {
        const bytes = await file.arrayBuffer();
        return {
          filename: filename,
          content: Buffer.from(bytes),
        };
      }
      return null;
    };

    // Agregar archivos como adjuntos
    const tituloAttachment = await fileToBuffer(titulo, `Titulo_${nombre}_${apellido}.${titulo.name.split('.').pop()}`);
    const perfusionesAttachment = await fileToBuffer(perfusiones, `Perfusiones_${nombre}_${apellido}.${perfusiones.name.split('.').pop()}`);
    const notasAttachment = await fileToBuffer(notas, `Record_Notas_${nombre}_${apellido}.${notas.name.split('.').pop()}`);
    const trabajoAttachment = await fileToBuffer(trabajo, `Constancia_Trabajo_${nombre}_${apellido}.${trabajo.name.split('.').pop()}`);

    if (tituloAttachment) attachments.push(tituloAttachment);
    if (perfusionesAttachment) attachments.push(perfusionesAttachment);
    if (notasAttachment) attachments.push(notasAttachment);
    if (trabajoAttachment) attachments.push(trabajoAttachment);

    // Configurar el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'Director@boardlatinoamericanodeperfusion.com',
      subject: `Nueva Aplicación Board Latinoamericano de Perfusión - ${nombre} ${apellido}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Nueva Aplicación Recibida
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Información del Aplicante:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Nombre Completo:</td>
                <td style="padding: 8px 0; color: #374151;">${nombre} ${apellido}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Correo Electrónico:</td>
                <td style="padding: 8px 0; color: #374151;">${correo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Teléfono:</td>
                <td style="padding: 8px 0; color: #374151;">${telefono}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Documentos Adjuntos:</h3>
            <ul style="color: #374151;">
              <li>✅ Título de Perfusionista: ${titulo.name}</li>
              <li>✅ Constancia de Perfusiones: ${perfusiones.name}</li>
              <li>✅ Record de Notas: ${notas.name}</li>
              <li>✅ Constancia de Trabajo: ${trabajo.name}</li>
            </ul>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Nota:</strong> Recuerda enviar el link de pago al aplicante en los próximos días.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Este correo fue enviado automáticamente desde el sistema de aplicaciones del Board Latinoamericano de Perfusión.
          </p>
        </div>
      `,
      attachments: attachments
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Aplicación enviada exitosamente',
        messageId: info.messageId 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al enviar la aplicación',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Configuración para manejar archivos grandes
export const config = {
  api: {
    bodyParser: false,
  },
};