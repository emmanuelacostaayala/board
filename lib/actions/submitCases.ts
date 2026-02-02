"use server";

import nodemailer from 'nodemailer';
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDateUTC } from '@/lib/utils'; // Aseguarte que esto exista o usar una local

export async function submitClinicalCases(userId: string) {
    try {
        // 1. Fetch active cases (submission_period IS NULL)
        const { data: cases, error } = await supabaseAdmin
            .from("clinical_case")
            .select("*")
            .eq("user_id", userId)
            .is("submission_period", null)
            .order("case_date", { ascending: true });

        if (error) throw new Error(`Error fetching cases: ${error.message}`);

        // 2. Validate count
        if (!cases || cases.length < 40) {
            return {
                ok: false,
                message: `No tienes suficientes casos para someter. Tienes ${cases?.length || 0}/40.`
            };
        }

        // 3. Fetch User Info for Email
        const { data: userAssignment } = await supabaseAdmin
            .from("pcc_assignment")
            .select("*")
            .eq("user_id", userId)
            .single();

        const pccCode = cases[0].pcc_code || userAssignment?.pcc_code || "N/A";
        const userName = userAssignment
            ? `${userAssignment.first_name} ${userAssignment.last_name}`
            : "Usuario (Nombre no encontrado)";

        // 4. Generate Email Content (Simple HTML table)
        const casesRows = cases.map((c, i) => `
      <tr>
        <td style="padding: 5px; border: 1px solid #ccc;">${i + 1}</td>
        <td style="padding: 5px; border: 1px solid #ccc;">${c.case_date}</td>
        <td style="padding: 5px; border: 1px solid #ccc;">${c.surgeon_name}</td>
        <td style="padding: 5px; border: 1px solid #ccc;">${c.institution}</td>
        <td style="padding: 5px; border: 1px solid #ccc;">${c.surgery_type}</td>
        <td style="padding: 5px; border: 1px solid #ccc;">${c.case_role || '-'}</td>
      </tr>
    `).join('');

        const emailHtml = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">Submission de Casos Clínicos (2025)</h2>
        <p><strong>PCC:</strong> ${pccCode}</p>
        <p><strong>Nombre:</strong> ${userName}</p>
        <p><strong>Total Casos:</strong> ${cases.length}</p>
        
        <h3>Listado de Casos:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background-color: #f3f4f6;">
            <tr>
              <th style="padding: 5px; border: 1px solid #ccc;">#</th>
              <th style="padding: 5px; border: 1px solid #ccc;">Fecha</th>
              <th style="padding: 5px; border: 1px solid #ccc;">Cirujano</th>
              <th style="padding: 5px; border: 1px solid #ccc;">Institución</th>
              <th style="padding: 5px; border: 1px solid #ccc;">Cirugía</th>
              <th style="padding: 5px; border: 1px solid #ccc;">Rol</th>
            </tr>
          </thead>
          <tbody>
            ${casesRows}
          </tbody>
        </table>
      </div>
    `;

        // 5. Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Asumiendo Gmail por el otro archivo
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'info@boardlatinoamericanodeperfusion.com',
            cc: 'director@boardlatinoamericanodeperfusion.com',
            subject: `Entrega de Casos Clínicos 2025 - PCC ${pccCode} - ${userName}`,
            html: emailHtml,
        });

        // 6. Update DB Records
        const { error: updateError } = await supabaseAdmin
            .from("clinical_case")
            .update({ submission_period: '2025' })
            .in('id', cases.map(c => c.id));

        if (updateError) throw new Error(`Error updating cases status: ${updateError.message}`);

        return { ok: true, message: "Casos sometidos correctamente." };

    } catch (error: any) {
        console.error("Submit Cases Error:", error);
        return { ok: false, message: error.message || "Error interno al someter casos." };
    }
}
