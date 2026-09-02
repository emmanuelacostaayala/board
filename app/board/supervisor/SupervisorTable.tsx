"use client";

import { useMemo, useState } from "react";

export type SupervisorRow = {
  pccCode: string;
  name: string;
  email: string | null;
  status: string;
  registered: boolean;
  cases: number;
  uces: number;
};

const STATUS_STYLES: Record<string, string> = {
  Activo: "bg-green-100 text-green-800",
  Verificada: "bg-green-100 text-green-800",
  Revision: "bg-yellow-100 text-yellow-800",
  "Inactivo 1": "bg-red-100 text-red-800",
  "Inactivo 2": "bg-orange-100 text-orange-800",
  Emeritus: "bg-purple-100 text-purple-800",
};

const STATUS_LABELS: Record<string, string> = {
  Revision: "En Revisión",
};

// Quita tildes para que buscar "jose" encuentre "José".
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export default function SupervisorTable({ rows }: { rows: SupervisorRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todos");
  const [registro, setRegistro] = useState("todos");

  const statuses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return rows.filter((r) => {
      if (status !== "todos" && r.status !== status) return false;
      if (registro === "si" && !r.registered) return false;
      if (registro === "no" && r.registered) return false;
      if (!q) return true;
      return normalize(
        [r.name, r.pccCode, r.email || ""].join(" ")
      ).includes(q);
    });
  }, [rows, query, status, registro]);

  const activos = filtered.filter(
    (r) => r.status === "Activo" || r.status === "Verificada"
  ).length;

  return (
    <>
      {/* Controles de filtrado */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, código PCC o correo…"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todos los estados</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] || s}
            </option>
          ))}
        </select>

        <select
          value={registro}
          onChange={(e) => setRegistro(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Registrados y no registrados</option>
          <option value="si">Solo registrados</option>
          <option value="no">Solo no registrados</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
        <p>
          Mostrando <span className="font-bold text-gray-900">{filtered.length}</span> de{" "}
          {rows.length} perfusionistas
        </p>
        <p>
          <span className="font-bold text-green-700">{activos}</span> activos
        </p>
      </div>

      <div className="rounded-md border bg-white shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Código PCC</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-center">Registrado</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-center">Casos</th>
              <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-center">UCEs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((r) => (
              <tr key={r.pccCode} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {r.pccCode}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
                <td className="px-6 py-4 text-gray-500">{r.email || "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[r.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {STATUS_LABELS[r.status] || r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {r.registered ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center tabular-nums text-gray-900">{r.cases}</td>
                <td className="px-6 py-4 text-center tabular-nums text-gray-900">{r.uces}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Ningún perfusionista coincide con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
