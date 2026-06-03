import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extraer datos del formulario
    const nombre = formData.get('nombre');
    const apellido = formData.get('apellido');
    const correo = formData.get('correo');
    const telefono = formData.get('telefono');
    const modoExamen = formData.get('modoExamen');

    // Extraer archivos
    const titulo = formData.get('titulo');
    const perfusiones = formData.get('perfusiones');
    const notas = formData.get('notas');
    const trabajo = formData.get('trabajo');

    // Validar que los campos de texto están presentes (estos siguen siendo obligatorios)
    if (!nombre || !apellido || !correo || !telefono || !modoExamen) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (Nombre, Correo, Teléfono o Modalidad)' },
        { status: 400 }
      );
    }

    // Nota: Los archivos ahora son opcionales según el nuevo requerimiento
    const hasAnyFile = titulo || perfusiones || notas || trabajo;

    // Función auxiliar para obtener extensión de forma segura
    const getExtension = (file) => {
      if (file && file.name) {
        const parts = file.name.split('.');
        return parts.length > 1 ? `.${parts.pop()}` : '';
      }
      return '';
    };

    // Configurar Google Drive Auth - Eliminado por políticas de cuota de Google
    // Ahora todo se maneja directamente por correo electrónico
    let folderLink = null;
    let bufferTexto = null;
    let nombreArchivoTexto = '';
    
    try {
      // Generar archivo de texto con los datos del aplicante para enviarlo adjunto
      const modoExamenTexto = modoExamen === 'presencial' ? 'Presencial (El Salvador)' : 'Online (Virtual)';
      const datosTexto = `DATOS DEL APLICANTE\n====================\nNombre: ${nombre}\nApellido: ${apellido}\nCorreo Electrónico: ${correo}\nTeléfono/Celular: ${telefono}\nModalidad del Examen: ${modoExamenTexto}\nFecha de Aplicación: ${new Date().toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })}\n`;
      bufferTexto = Buffer.from(datosTexto, 'utf-8');
      nombreArchivoTexto = `Datos_Aplicante_${nombre}_${apellido}.txt`;
    } catch (textError) {
      console.error("Error al generar el archivo de texto:", textError);
    }

    // Configurar el transportador de correo con Zoho
    const ZOHO_USER = 'operaciones@alapescuela.com';
    const ZOHO_PASS = 'eyzV6ykSnAGZ';

    const transporter = nodemailer.createTransport({
      host: '204.141.32.56',
      port: 465,
      secure: true,
      servername: 'smtp.zoho.com',
      auth: { user: ZOHO_USER, pass: ZOHO_PASS },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // Preparar los adjuntos de forma eficiente
    const fileToAttachment = async (file, prefix) => {
      if (file && typeof file !== 'string' && file.size > 0) {
        try {
          const bytes = await file.arrayBuffer();
          return {
            filename: `${prefix}_${nombre}_${apellido}${getExtension(file)}`,
            content: Buffer.from(bytes),
          };
        } catch (e) {
          console.error(`Error convirtiendo ${prefix} a attachment:`, e);
        }
      }
      return null;
    };

    const attachmentsResults = await Promise.all([
      fileToAttachment(titulo, 'Titulo'),
      fileToAttachment(perfusiones, 'Perfusiones'),
      fileToAttachment(notas, 'Record_Notas'),
      fileToAttachment(trabajo, 'Constancia_Trabajo')
    ]);

    const attachments = attachmentsResults.filter(Boolean);

    // Agregar el bloc de notas a los adjuntos si se generó correctamente
    if (bufferTexto && nombreArchivoTexto) {
      attachments.push({
        filename: nombreArchivoTexto,
        content: bufferTexto,
      });
    }

    // Configurar el correo
    const mailOptions = {
      from: `"Aplicaciones Board" <${ZOHO_USER}>`,
      to: 'info@boardlatinoamericanodeperfusion.com',
      cc: 'director@boardlatinoamericanodeperfusion.com, boardlatinoamericano@gmail.com',
      subject: `Nueva Aplicación Board - ${nombre} ${apellido}${attachmentsResults.filter(Boolean).length < 4 ? ' (INCOMPLETA)' : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Nueva Aplicación Recibida ${attachments.length < 4 ? '<span style="color: #dc2626;">(Incompleta)</span>' : ''}
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Información del Aplicante:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Nombre:</td>
                <td style="padding: 8px 0; color: #374151;">${nombre} ${apellido}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Correo:</td>
                <td style="padding: 8px 0; color: #374151;">${correo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Teléfono:</td>
                <td style="padding: 8px 0; color: #374151;">${telefono}</td>
              </tr>
               <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Modalidad:</td>
                <td style="padding: 8px 0; color: #2563eb; font-weight: bold;">
                  ${modoExamen === 'presencial' ? '🏢 Presencial (El Salvador)' : '🌐 Online (Virtual)'}
                </td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Estado de Documentación:</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li style="margin-bottom: 5px;">${titulo && typeof titulo !== 'string' ? '✅' : '❌'} <strong>Título:</strong> ${titulo && typeof titulo !== 'string' ? 'Recibido' : 'FALTANTE'}</li>
              <li style="margin-bottom: 5px;">${perfusiones && typeof perfusiones !== 'string' ? '✅' : '❌'} <strong>Perfusiones:</strong> ${perfusiones && typeof perfusiones !== 'string' ? 'Recibido' : 'FALTANTE'}</li>
              <li style="margin-bottom: 5px;">${notas && typeof notas !== 'string' ? '✅' : '❌'} <strong>Record Notas:</strong> ${notas && typeof notas !== 'string' ? 'Recibido' : 'FALTANTE'}</li>
              <li style="margin-bottom: 5px;">${trabajo && typeof trabajo !== 'string' ? '✅' : '❌'} <strong>Trabajo:</strong> ${trabajo && typeof trabajo !== 'string' ? 'Recibido' : 'FALTANTE'}</li>
            </ul>
            ${attachments.length < 4 ? '<p style="color: #dc2626; font-weight: bold; margin-top: 10px;">⚠️ Esta aplicación fue enviada sin todos los documentos requeridos.</p>' : ''}
          </div>

          ${folderLink ? `
          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bae6fd;">
            <h3 style="color: #0369a1; margin-top: 0;">📁 Carpeta en Google Drive:</h3>
            <a href="${folderLink}" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Abrir Carpeta
            </a>
          </div>
          ` : ''}

          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            Sistema de aplicaciones del Board Latinoamericano de Perfusión.
          </p>
        </div>
      `,
      attachments: attachments
    };

    const info = await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, messageId: info.messageId }, { status: 200 });

  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}

// Configuración para manejar archivos grandes - Eliminada para App Router
// App Router maneja esto automáticamente v3
