// app/my-journey/page.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentUser } from "@clerk/nextjs/server"; // server-only import OK aquí
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import { getMyPcc, hasSubmittedCases } from "@/lib/actions/pcc.actions"; // <- añadido
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";
import PaymentAlertButton from "@/components/PaymentAlertButton";
import PCCDashboard from "@/components/PCCDashboard";
import PaymentButtons from "@/components/PaymentButtons";
// PaymentsRecent removed intentionally per your request

const MyJourney = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  try {

    // fetch user-related data (usando user.id tal y como tienes ahora)
    const companions = await getUserCompanions(user.id);
    const sessionHistory = await getUserSessions(user.id);
    const bookmarkedCompanions = await getBookmarkedCompanions(user.id);

    // FETCH PCC assignment (single source of truth for PCC status)
    const myPcc = await getMyPcc(user.id);
    const hasSubmitted = await hasSubmittedCases(user.id);

    // Display PCC status:
    // 1) Si ha sometido sus casos (y por lo tanto pagó), es Activo.
    // 2) si la fila pcc_assignment tiene 'status' -> usarlo
    // 3) else -> "Revision"
    let displayPccStatus = "Revision";
    if (hasSubmitted) {
      displayPccStatus = "Activo";
    } else {
      displayPccStatus = (myPcc?.status as string) ?? (myPcc?.pcc_code ? "Revision" : "Revision");
    }


    const statusIcons: Record<string, { icon: string; label: string }> = {
      Revision: { icon: "⏳", label: "En Revisión" },
      Activo: { icon: "✅", label: "Activo" },
      Verificada: { icon: "✅", label: "Verificada" },
      "Inactivo 1": { icon: "🚫", label: "Inactivo 1" },
      "Inactivo 2": { icon: "⚠️", label: "Inactivo 2" },
      Emeritus: { icon: "🏅", label: "Emeritus" },
    };

    const { icon, label } =
      statusIcons[displayPccStatus as keyof typeof statusIcons] ??
      statusIcons["Revision"];

    return (
      <main className="w-full lg:w-3/4 mx-auto space-y-10">
        {/* Header con info del usuario */}
        <section className="flex justify-between gap-4 max-sm:flex-col items-center">
          <div className="flex gap-4 items-center">
            <Image
              src={user.imageUrl}
              alt={user.firstName || "user"}
              width={110}
              height={110}
              className="rounded-full"
            />
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-2xl">
                {user.firstName} {user.lastName} <span className="ml-2">{icon}</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                {user.emailAddresses[0]?.emailAddress}
              </p>

              {/* Mostrar estado PCC (viene de pcc_assignment) */}
              <p className="text-sm font-medium">Status PCC: {label}</p>
              {myPcc?.pcc_code ? (
                <p className="text-xs text-muted-foreground">
                  Assigned PCC: <span className="font-medium">{myPcc.pcc_code}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
              <div className="flex gap-2 items-center">
                <Image src="/icons/check.svg" alt="checkmark" width={22} height={22} />
                <p className="text-2xl font-bold">{sessionHistory.length}</p>
              </div>
              <div>Secciones completadas</div>
            </div>
            <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
              <div className="flex gap-2 items-center">
                <Image src="/icons/cap.svg" alt="cap" width={22} height={22} />
                <p className="text-2xl font-bold">{companions.length}</p>
              </div>
              <div>Acompañantes creados</div>
            </div>

            {/* BOTÓN SIMPLE que abre el sitio de pago en una pestaña nueva */}

          </div>
        </section>

        {/* Barra PCC + tablas + modales */}
        <PCCDashboard
          userId={user.id}
          userFirstName={user.firstName ?? ""}
          userLastName={user.lastName ?? ""}
          userEmail={user.emailAddresses[0]?.emailAddress ?? ""} // Nuevo prop
          createdAtISO={
            user.createdAt ? new Date(user.createdAt).toISOString() : null
          }
        />

        {/* Pagos */}
        <section className="my-6">
          <h2 className="text-xl font-semibold mb-3">Pagos</h2>
          <PaymentButtons userEmail={user.emailAddresses[0]?.emailAddress ?? ""} />
        </section>

        {/* Secciones que ya tenías */}
        <Accordion type="multiple">
          <AccordionItem value="bookmarks">
            <AccordionTrigger className="text-2xl font-bold">
              Acompañantes favoritos {`(${bookmarkedCompanions.length})`}
            </AccordionTrigger>
            <AccordionContent>
              <CompanionsList
                companions={bookmarkedCompanions}
                title="Bookmarked Companions"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recent">
            <AccordionTrigger className="text-2xl font-bold">
              Secciones recientes
            </AccordionTrigger>
            <AccordionContent>
              <CompanionsList title="Recent Sessions" companions={sessionHistory} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="companions">
            <AccordionTrigger className="text-2xl font-bold">
              Mis Acompañantes IA {`(${companions.length})`}
            </AccordionTrigger>
            <AccordionContent>
              <CompanionsList title="My Companions" companions={companions} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>
    );
  } catch (err) {
    console.error("Error in MyJourney page:", err);
    return (
      <div className="p-6 text-red-600">
        Ocurrió un error cargando tu panel. Revisa la consola del servidor.
      </div>
    );
  }
};

export default MyJourney;
