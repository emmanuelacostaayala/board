export const subjects = [
  "perfusion-basic",
  "cec-advanced",
  "emergencies", 
  "pediatrics",
  "pharmacology",
  "monitoring",
  "equipment",
  "hemodynamics",
];

export const subjectsColors = {
  "perfusion-basic": "#E3F2FD",    // Azul claro
  "cec-advanced": "#F3E5F5",      // Púrpura claro
  "emergencies": "#FFEBEE",       // Rojo claro
  "pediatrics": "#E8F5E8",        // Verde claro
  "pharmacology": "#FFF3E0",      // Naranja claro
  "monitoring": "#E1F5FE",        // Cian claro
  "equipment": "#F1F8E9",         // Verde lima claro
  "hemodynamics": "#FFF8E1",      // Amarillo claro
};

export const voices = {
  // IDs de voces LATAM (ejemplo)
  male:   { casual: "9ex3ULzEJpgppkMxiT5I", formal: "9ex3ULzEJpgppkMxiT5I" },
  female: { casual: "p4w8j6zCUDJ0nGJ3okKs", formal: "p4w8j6zCUDJ0nGJ3okKs" },
};

export const recentSessions = [
  {
    id: "1",
    subject: "perfusion-basic",
    name: "Dr. Perfú - Especialista en Fundamentos",
    topic: "Principios Básicos de Perfusión Cardiovascular",
    duration: 45,
    color: "#E3F2FD",
  },
  {
    id: "2",
    subject: "cec-advanced", 
    name: "Dra. CEC - Experta en Circulación",
    topic: "Técnicas Avanzadas de Circulación Extracorpórea",
    duration: 60,
    color: "#F3E5F5",
  },
  {
    id: "3",
    subject: "emergencies",
    name: "Dr. Urgente - Manejo de Crisis",
    topic: "Complicaciones y Emergencias en Perfusión",
    duration: 30,
    color: "#FFEBEE",
  },
  {
    id: "4",
    subject: "pediatrics",
    name: "Dra. Pediátrica - Especialista Infantil", 
    topic: "Perfusión en Pacientes Pediátricos",
    duration: 50,
    color: "#E8F5E8",
  },
  {
    id: "5",
    subject: "pharmacology",
    name: "Dr. Farma - Experto en Medicamentos",
    topic: "Anticoagulación y Protocolos Farmacológicos",
    duration: 40,
    color: "#FFF3E0",
  },
  {
    id: "6",
    subject: "monitoring",
    name: "Dra. Monitor - Vigilancia Hemodinámica",
    topic: "Parámetros de Monitoreo en CEC",
    duration: 35,
    color: "#E1F5FE",
  },
];
