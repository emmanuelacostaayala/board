// app/test-cert/page.tsx
// ⚠️ PÁGINA TEMPORAL DE PRUEBA — BORRAR DESPUÉS
export default function TestCertPage() {
  const exampleCodes = [
    { code: "PCC-0250", name: "Isác Cárdenas Martínez" },
    { code: "PCC-0251", name: "Héctor Abel Prokopchuk" },
    { code: "PCC-0252", name: "Pablo Ariel Bautista" },
  ];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        🧪 Test de Certificados PCC
      </h1>
      <p style={{ color: "#888", marginBottom: 30 }}>
        Página temporal para verificar cómo se ven los certificados PDF. Borrar
        después.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {exampleCodes.map(({ code, name }) => (
          <div
            key={code}
            style={{
              border: "1px solid #333",
              borderRadius: 12,
              padding: 20,
              background: "#111",
            }}
          >
            <p style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4 }}>
              {name}
            </p>
            <p style={{ color: "#aaa", marginBottom: 12 }}>Código: {code}</p>

            <div style={{ display: "flex", gap: 12 }}>
              <a
                href={`/api/certificate?pcc=${code}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                📄 Ver Certificado
              </a>
              <a
                href={`/api/certificate?pcc=${code}`}
                download={`${code}-Certificado.pdf`}
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  background: "#16a34a",
                  color: "#fff",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                ⬇️ Descargar PDF
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Embed del primer certificado para vista rápida */}
      <h2 style={{ fontSize: 22, fontWeight: "bold", marginTop: 40, marginBottom: 16 }}>
        Vista previa inline (PCC-0250)
      </h2>
      <iframe
        src="/api/certificate?pcc=PCC-0250"
        width="100%"
        height="700"
        style={{ border: "1px solid #333", borderRadius: 12 }}
      />

      <p style={{ color: "#f87171", marginTop: 30, fontSize: 14 }}>
        ⚠️ Esta página es solo para pruebas. Borrar{" "}
        <code>app/test-cert/page.tsx</code> cuando ya no sea necesaria.
      </p>
    </main>
  );
}
