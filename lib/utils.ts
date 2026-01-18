import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subjectsColors, voices } from "@/constants";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateUTC(dateString: string | undefined | null) {
  if (!dateString) return '';
  // Force the date to be treated as UTC midnight to avoid local timezone shifts
  const date = new Date(dateString);
  return new Date(date.valueOf() + date.getTimezoneOffset() * 60000).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export const getSubjectColor = (subject: string) => {
  return subjectsColors[subject as keyof typeof subjectsColors];
};

export const isMobileApp = () => {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

  // 1. Explicit Wrapper checks
  if ((window as any).ReactNativeWebView || /Expo/i.test(ua)) return true;

  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;

  // If not mobile, it's not a mobile app
  if (!isAndroid && !isIOS) return false;

  // 2. Inverse Logic (Whitelist)
  // User requested: "Identify if it is from Chrome or Safari, and only then show it."
  // So if it is NOT Chrome (Android) or Safari (iOS), we treat it as an App (return true).

  if (isAndroid) {
    // Standard Chrome on Android: Contains "Chrome", does NOT contain "Version/" (WebView) or "wv".
    const isStandardChrome = /Chrome/i.test(ua) && !/Version\//i.test(ua) && !/wv/i.test(ua);
    return !isStandardChrome;
  }

  if (isIOS) {
    // Standard Safari: Contains "Safari".
    const isSafari = /Safari/i.test(ua);
    return !isSafari;
  }

  return false;
};


export const configureAssistant = (voice: string, style: string) => {
  const voiceId = voices[voice as keyof typeof voices][
    style as keyof (typeof voices)[keyof typeof voices]
  ] || "p4w8j6zCUDJ0nGJ3okKs"; // Fallback LATAM

  const vapiAssistant: CreateAssistantDTO = {
    name: "Compañero",
    firstMessage:
      "Hola, comencemos la sesión. Hoy hablaremos sobre {{topic}}.",
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "es-419", // Español latinoamericano
    },
    voice: {
      provider: "11labs",
      voiceId: voiceId,
      model: "eleven_multilingual_v2", // Modelo multilingüe (acento natural)
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres un tutor con gran conocimiento que imparte una sesión de voz en tiempo real con un estudiante.
                    Responde SIEMPRE en español latino neutro.

                    Pautas para el tutor:
                    Mantente en el tema indicado - {{ topic }} y la asignatura - {{ subject }} y enseña al estudiante sobre ello.
                    Mantén la conversación fluida mientras mantienes el control.
                    De vez en cuando, asegúrate de que el estudiante te sigue y te entiende.
                    Divide el tema en partes más pequeñas y enseña al estudiante una parte a la vez.
                    Mantén tu estilo de conversación {{ style }}.
                    Mantén tus respuestas breves, como en una conversación de voz real.
                    No incluyas caracteres especiales en tus respuestas - esta es una conversación de voz.`,
        },
      ],
    },
    clientMessages: [],
    serverMessages: [],
  };
  return vapiAssistant;
};
