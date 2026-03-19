import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { PCC_LIST } from '@/data/pccList';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pccCode = searchParams.get('pcc');

  if (!pccCode) {
    return new NextResponse('Missing PCC Code', { status: 400 });
  }

  const user = PCC_LIST.find((p) => p.code === pccCode);

  if (!user) {
    return new NextResponse('PCC Record not found', { status: 404 });
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  // Si no hay issueDate en pccList.ts, ponemos un placeholder.
  const issueDateStr = user.issueDate || '[FECHA PENDIENTE]'; 

  // Fecha de fin fija, según solicitó el usuario: 31 de dic 2026
  const textParams = `es miembro fundador de esta Organización, ocupando el cargo de
Director, desde el ${issueDateStr} hasta el 31 de diciembre de 2026.`;

  try {
    // 1. Cargar el PDF Base
    // El usuario debe colocar "certificado-base.pdf" en la carpeta public
    const pdfPath = path.join(process.cwd(), 'public', 'certificado-base.pdf');
    
    let pdfBytesBase: Uint8Array;
    
    if (fs.existsSync(pdfPath)) {
      pdfBytesBase = fs.readFileSync(pdfPath);
    } else {
      // Si no existe, usamos uno existente temporalmente o creamos uno de cero
      const fallbackPath = path.join(process.cwd(), 'public', 'PCC-0001.pdf');
      if (fs.existsSync(fallbackPath)) {
         pdfBytesBase = fs.readFileSync(fallbackPath);
      } else {
         return new NextResponse('Por favor, sube el archivo public/certificado-base.pdf', { status: 404 });
      }
    }

    const pdfDoc = await PDFDocument.load(pdfBytesBase);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // TODO: Ajustar coordenadas (x, y) según el diseño final del PDF base.
    // También es posible cargar una fuente personalizada aquí con pdf-lib y fontkit.
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
    const textFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Escribir el Nombre (Ajustar color y tamaño)
    firstPage.drawText(`${fullName} PCC`, {
      x: 200, // <-- AJUSTAR COORDENADA X
      y: 350, // <-- AJUSTAR COORDENADA Y
      size: 32,
      font: font,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Escribir el texto de las fechas
    firstPage.drawText(`es miembro fundador de esta Organización, ocupando el cargo de\nDirector, desde el ${issueDateStr} hasta el 31 de diciembre de 2026.`, {
      x: 100, // <-- AJUSTAR COORDENADA X
      y: 280, // <-- AJUSTAR COORDENADA Y
      size: 14,
      font: textFont,
      color: rgb(0.1, 0.1, 0.1),
      lineHeight: 20,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pccCode}-Certificado.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return new NextResponse(`Error generating PDF: ${error.message}`, { status: 500 });
  }
}
