// app/my-journey/page.tsx

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";
import PCCDashboard from "@/components/PCCDashboard";

const MyJourney = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const companions = await getUserCompanions(user.id);
  const sessionHistory = await getUserSessions(user.id);
  const bookmarkedCompanions = await getBookmarkedCompanions(user.id);

  return (
    <main className="min-lg:w-3/4 space-y-10">
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
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image
                src="/icons/check.svg"
                alt="checkmark"
                width={22}
                height={22}
              />
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
        </div>
      </section>

      {/* Barra PCC + tablas + modales */}
      <PCCDashboard
        userId={user.id}
        userFirstName={user.firstName ?? ""}
        userLastName={user.lastName ?? ""}
        createdAtISO={user.createdAt ? new Date(user.createdAt).toISOString() : null}
      />

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
            <CompanionsList
              title="Recent Sessions"
              companions={sessionHistory}
            />
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
};

export default MyJourney;
