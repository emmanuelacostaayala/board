// /components/PCCDashboard.tsx
'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { PCC_LIST, PccRecord } from '@/data/pccList';
import {
  assignPccToUser,
  createClinicalCase,
  createUceEvent,
  deleteClinicalCase,
  updateClinicalCase,
  deleteUceEvent,
  updateUceEvent,
  getMyPcc,
  listMyClinicalCases,
  listMyUceEvents,
  listTakenPccCodes,
  releaseMyPcc,

} from '@/lib/actions/pcc.actions';
import { formatDateUTC } from '@/lib/utils';
import { userLooksLikePccName } from "@/lib/pcc.helpers";

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from 'lucide-react';

type Props = {
  userId: string;
  userFirstName: string;
  userLastName: string;
  createdAtISO?: string | null;
};

const SURGERY_TYPES = [
  'Revascularización Coronaria',
  'Cirugía de la válvula mitral',
  'Cirugía de la válvula aórtica',
  'Congénito',
  'Cirugía de aorta ascendente',
  'Otro',
];

function fourDigitsFromPcc(pccCode: string) {
  const m = pccCode?.match(/PCC-(\d+)/i);
  if (!m) return '';
  return m[1].padStart(4, '0');
}

import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function PCCDashboard(props: Props) {
  const { userId, userFirstName, userLastName, createdAtISO } = props;
  const fullName = `${userFirstName ?? ''} ${userLastName ?? ''}`.trim();

  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [pcc, setPcc] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();

  const [caseOpen, setCaseOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any | null>(null); // Nuevo estado
  const [uceOpen, setUceOpen] = useState(false);
  const [editingUce, setEditingUce] = useState<any | null>(null); // For UCE editing

  // Form caso clínico
  const [caseDate, setCaseDate] = useState('');
  const [surgeonName, setSurgeonName] = useState('');
  const [institution, setInstitution] = useState('');
  const [surgeryType, setSurgeryType] = useState<string | undefined>(undefined);
  const [caseRole, setCaseRole] = useState<string | undefined>(undefined);

  // Form UCE

  const [uceDate, setUceDate] = useState('');
  const [uceInstitution, setUceInstitution] = useState('');
  const [uceApproved, setUceApproved] = useState<'si' | 'no' | ''>('');
  const [uceName, setUceName] = useState('');
  const [uceCountry, setUceCountry] = useState('');
  const [uceNumber, setUceNumber] = useState<number | null>(0); // ← permite null
  const [uceEventTypes, setUceEventTypes] = useState<string[]>([]);
  const [uceInitials, setUceInitials] = useState('');

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Tablas
  const [cases, setCases] = useState<any[]>([]);
  const [uces, setUces] = useState<any[]>([]);

  // Alert Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: '', description: '', action: () => { } });

  useEffect(() => {
    startTransition(async () => {
      const takenCodes = await listTakenPccCodes();
      setTaken(takenCodes);
      const mine = await getMyPcc(userId);
      if (mine?.pcc_code || mine?.pccCode) setPcc((mine as any).pcc_code ?? (mine as any).pccCode);

      const c = await listMyClinicalCases(userId);
      setCases(c);
      const u = await listMyUceEvents(userId);
      setUces(u);
    });
  }, [userId]);

  const availableList = useMemo<PccRecord[]>(
    () => PCC_LIST,
    []
  );

  async function handleAssign(newCode: string) {
    if (!newCode) return;
    const looksLike = userLooksLikePccName(fullName, newCode);
    if (!looksLike) {
      setConfirmConfig({
        open: true,
        title: "¿Seguro que eres tú?",
        description: "Ese usuario no se llama igual que tú.",
        action: () => proceedWithAssign(newCode),
      });
      return;
    }
    await proceedWithAssign(newCode);
  }

  async function proceedWithAssign(code: string) {
    startTransition(async () => {
      const res = await assignPccToUser({ userId, userFullName: fullName, pccCode: code });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setPcc(res.pccCode);
      const codes = await listTakenPccCodes();
      setTaken(codes);
      toast.success(`PCC ${code} asignado correctamente.`);
    });
  }

  function requirePccOrWarn(openSetter: (v: boolean) => void) {
    if (!pcc) {
      setConfirmConfig({
        open: true,
        title: "PCC Requerido",
        description: "Para registrar casos o UCE, primero debes seleccionar tu código PCC en el filtro superior.",
        action: () => { }, // No action needed, just close
      });
      return;
    }
    openSetter(true);
  }

  function certificateHref() {
    if (!pcc) return '#';
    const four = fourDigitsFromPcc(pcc);
    return `/PCC-${four}.pdf`; // PDFs en /public
  }

  async function handleRelease() {
    setConfirmConfig({
      open: true,
      title: "¿Liberar PCC?",
      description: "Vas a liberar tu PCC. ¿Continuar?",
      action: () => {
        startTransition(async () => {
          await releaseMyPcc(userId);
          setPcc(null);
          const codes = await listTakenPccCodes();
          setTaken(codes);
          toast.success("PCC liberado correctamente.");
        });
      },
    });
  }

  async function submitCase() {
    setAttemptedSubmit(true);
    if (!pcc) return toast.error('Selecciona tu PCC primero.');
    const missing: string[] = [];
    if (!caseDate) missing.push("Fecha de caso");
    if (!surgeonName) missing.push("Nombre del Cirujano");
    if (!institution) missing.push("Nombre de Institución");
    if (!surgeryType) missing.push("Tipo de cirugía");
    if (!caseRole) missing.push("Rol del Perfusionista");

    if (missing.length > 0) {
      setConfirmConfig({
        open: true,
        title: "Campos Faltantes",
        description: `Por favor completa los siguientes campos obligatorios: ${missing.join(", ")}.`,
        action: () => { }, // Close only
      });
      return;
    }

    // UPDATE
    if (editingCase) {
      startTransition(async () => {
        try {
          await updateClinicalCase({
            caseId: editingCase.id,
            userId,
            caseDate,
            surgeonName,
            institution,
            surgeryType,
            caseRole
          });
          toast.success('Caso actualizado correctamente.');
          setCaseOpen(false);
          setEditingCase(null);
          // Refresh
          const c = await listMyClinicalCases(userId);
          setCases(c);
        } catch (e: any) {
          toast.error(e.message || 'Error al actualizar');
        }
      });
      return;
    }

    // CREATE
    await createClinicalCase({
      userId,
      pccCode: pcc,
      caseDate,
      surgeonName,
      institution,
      surgeryType: surgeryType!,
      caseRole,
    });
    setCaseOpen(false);
    setEditingCase(null); // Clean up
    setCaseDate(''); setSurgeonName(''); setInstitution(''); setSurgeryType(undefined); setCaseRole(undefined);
    const c = await listMyClinicalCases(userId);
    setCases(c);
    toast.success('Caso clínico registrado.');
  }

  async function submitUce() {
    setAttemptedSubmit(true);
    if (!pcc) return toast.error('Selecciona tu PCC primero.');
    // Permitir null si el usuario marcó "No lo sé", pero para validar campos requeridos (si no es null debe ser >0 o algo, pero aquí solo chequeamos que no sea vacío si no está el check)
    // El check "No lo sé" pone uceNumber a null via checkbox.

    // Si uceNumber es 0 y no es null, es válido (puede haber eventos de 0 creditos?) -> Asumamos que sí o que el usuario pone algo.
    // La validación original era: const uceNumberInvalid = (uceNumber === null) ? false : !uceNumber; 
    // Si uceNumber es 0, !0 es true, asi que falla. Corrijamos para aceptar 0.
    // Pero espera, si es input number vacio? 

    if (!uceDate || !uceInstitution || !uceName || !uceCountry || !uceApproved) {
      return toast.error('Completa todos los campos obligatorios.');
    }
    // Decide create or update
    let res;
    if (editingUce) {
      res = await updateUceEvent({
        uceId: editingUce.id,
        userId,
        eventDate: uceDate,
        institution: uceInstitution,
        approvedByALAP: uceApproved === 'si',
        eventName: uceName,
        country: uceCountry,
        ucesAcquired: (uceNumber === null ? 0 : Number(uceNumber)),
        eventTypes: uceEventTypes,
        initials: uceInitials || ''
      });
    } else {
      res = await createUceEvent({
        userId, pccCode: pcc, eventDate: uceDate, institution: uceInstitution,
        approvedByALAP: uceApproved === 'si', eventName: uceName, country: uceCountry,
        // FIX: Si es null ("No lo sé"), enviamos 0 al backend para satisfacer NOT NULL
        ucesAcquired: (uceNumber === null ? 0 : Number(uceNumber)),
        eventTypes: uceEventTypes, initials: uceInitials || ''
      });
    }

    if (!res.ok) {
      console.error("UCE Submission Error:", res.message);
      toast.error(res.message);
      return;
    }

    setUceOpen(false);
    setEditingUce(null);
    setUceDate(''); setUceInstitution(''); setUceName(''); setUceCountry('');
    setUceNumber(0); setUceEventTypes([]); setUceInitials(''); setUceApproved('');
    const u = await listMyUceEvents(userId);
    setUces(u);
    toast.success(editingUce ? 'UCE actualizada correctamente.' : 'UCE registrada.');
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Barra superior */}
      {/* Barra superior */}
      <div className="flex flex-wrap items-center gap-4">
        {!pcc && (
          <Alert variant="destructive" className="w-full border-orange-500 text-orange-600 dark:border-orange-500 dark:text-orange-400 [&>svg]:text-orange-600">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Atención</AlertTitle>
            <AlertDescription>
              Debes seleccionar tu código PCC antes de poder registrar o visualizar tus casos.
            </AlertDescription>
          </Alert>
        )}

        <Button asChild disabled={!pcc}>
          <a href={certificateHref()} target="_blank" rel="noopener noreferrer">
            Certificado PCC
          </a>
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by PCC</span>
          <Select disabled={!!pcc || loading} onValueChange={handleAssign}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder={pcc ?? 'Select PCC'} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {availableList.map(r => {
                const takenByOther = taken.has(r.code) && r.code !== pcc;
                return (
                  <SelectItem key={r.code} value={r.code} disabled={takenByOther}>
                    {r.code} — {r.lastName}, {r.firstName}{takenByOther ? ' (tomado)' : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {!!pcc && (
            <Button variant="outline" onClick={handleRelease}>
              Cambiar PCC
            </Button>
          )}
        </div>

        <div className="ml-auto flex gap-2">
          <Button onClick={() => {
            setEditingCase(null); // Asegurar modo CREAR
            setCaseDate('');
            setSurgeonName('');
            setInstitution('');
            setSurgeryType(undefined);
            setCaseRole(undefined);
            setAttemptedSubmit(false); // Reset validation
            requirePccOrWarn(setCaseOpen);
          }}>
            Registra tu caso clínico
          </Button>
          <Button variant="destructive" onClick={() => {
            setEditingUce(null); // Ensure "Create" mode
            setUceDate('');
            setUceInstitution('');
            setUceName('');
            setUceCountry('');
            setUceNumber(0);
            setUceEventTypes([]);
            setUceInitials('');
            setUceApproved('');
            setAttemptedSubmit(false); // Reset validation
            requirePccOrWarn(setUceOpen);
          }}>
            Registra tu UCE
          </Button>
        </div>
      </div>

      {/* Perfil general */}
      <section>
        <h2 className="text-3xl font-bold mb-2">Perfil General</h2>
        {createdAtISO && (
          <p className="text-sm text-muted-foreground">
            Registrado en el Board desde: {new Date(createdAtISO).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        )}
        {pcc && <p className="text-sm mt-2">PCC asignado: <span className="font-semibold">{pcc}</span></p>}
      </section>

      {/* Tabla Casos Clínicos */}
      <section>
        <h2 className="text-4xl font-extrabold mb-4">REGISTRO DE CASOS CLÍNICOS 2025</h2>
        <div className="rounded-md border overflow-auto max-h-[420px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Fecha de Generación</TableHead>
                <TableHead>#PCC</TableHead>
                <TableHead>Nombre del Cirujano</TableHead>
                <TableHead>Rol del Perfusionista</TableHead>
                <TableHead>Nombre de Institución</TableHead>
                <TableHead>Tipo de Cirugía</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{formatDateUTC(c.case_date ?? c.caseDate)}</TableCell>
                  <TableCell>{Number(fourDigitsFromPcc(c.pcc_code ?? c.pccCode))}</TableCell>
                  <TableCell>{c.surgeon_name ?? c.surgeonName}</TableCell>
                  <TableCell>{c.case_role ?? c.caseRole}</TableCell>
                  <TableCell>{c.institution}</TableCell>
                  <TableCell>{c.surgery_type ?? c.surgeryType}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingCase(c);
                          // Cargar datos en el form
                          setCaseDate(c.case_date ?? c.caseDate);
                          setSurgeonName(c.surgeon_name ?? c.surgeonName);
                          setInstitution(c.institution);
                          setSurgeryType(c.surgery_type ?? c.surgeryType);
                          setSurgeryType(c.surgery_type ?? c.surgeryType);
                          setCaseRole(c.case_role ?? c.caseRole);
                          setAttemptedSubmit(false); // Reset validation
                          setCaseOpen(true);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                          setConfirmConfig({
                            open: true,
                            title: "¿Eliminar caso?",
                            description: "Esta acción no se puede deshacer.",
                            action: () => {
                              startTransition(async () => {
                                await deleteClinicalCase(c.id, userId);
                                toast.success("Caso eliminado.");
                                const u = await listMyClinicalCases(userId);
                                setCases(u);
                              });
                            }
                          });
                        }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {cases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aún no has registrado casos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Tabla UCE */}
      <section>
        <h2 className="text-4xl font-extrabold mb-4">REGISTRO UCE (Actividad académica 2024 a 2027)</h2>
        <div className="rounded-md border overflow-auto max-h-[420px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Evento</TableHead>
                <TableHead>Nombre de la Institución</TableHead>
                <TableHead>Fecha del Evento</TableHead>
                <TableHead>País</TableHead>
                <TableHead>PCC#</TableHead>
                <TableHead>Avalado por ALAP</TableHead>
                <TableHead>UCE Adquiridos</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uces.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.event_name ?? u.eventName}</TableCell>
                  <TableCell>{u.institution}</TableCell>
                  <TableCell>{formatDateUTC(u.event_date ?? u.eventDate)}</TableCell>
                  <TableCell>{u.country}</TableCell>
                  <TableCell>{Number(fourDigitsFromPcc(u.pcc_code ?? u.pccCode))}</TableCell>
                  <TableCell>{(u.approved_by_alap ?? u.approvedByALAP) ? 'Sí' : 'No'}</TableCell>
                  <TableCell>{u.uces_acquired ?? u.ucesAcquired}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingUce(u);
                          // Populate form
                          setUceDate(u.event_date ?? u.eventDate);
                          setUceInstitution(u.institution);
                          setUceName(u.event_name ?? u.eventName);
                          setUceCountry(u.country);
                          setUceApproved((u.approved_by_alap ?? u.approvedByALAP) ? 'si' : 'no');
                          setUceNumber(u.uces_acquired ?? u.ucesAcquired);
                          // Handle eventTypes CSV
                          const typesStr = u.event_types ?? u.eventTypes ?? '';
                          setUceEventTypes(typesStr ? typesStr.split(',') : []);
                          setUceInitials(u.initials || '');

                          setAttemptedSubmit(false);
                          setUceOpen(true);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                          setConfirmConfig({
                            open: true,
                            title: "¿Eliminar UCE?",
                            description: "Esta acción no se puede deshacer.",
                            action: () => {
                              startTransition(async () => {
                                await deleteUceEvent(u.id, userId);
                                toast.success("UCE eliminada.");
                                const updated = await listMyUceEvents(userId);
                                setUces(updated);
                              });
                            }
                          });
                        }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {uces.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aún no has registrado UCE.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Modal Caso Clínico */}
      <Dialog open={caseOpen} onOpenChange={setCaseOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle className="text-3xl">
              {editingCase ? 'Editar Caso Clínico' : 'REGISTRO DE CASOS CLÍNICOS 2025'}
            </DialogTitle>
            <DialogDescription>Completa la información. Los campos de identidad se llenan automáticamente.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre y apellido del Perfusionista</Label>
              <Input value={fullName} readOnly />
            </div>
            <div className="space-y-2">
              <Label>PCC #</Label>
              <Input value={pcc ? Number(fourDigitsFromPcc(pcc)) : ''} readOnly />
            </div>



            <div className="space-y-2 sm:col-span-2">
              <Label>Rol del Perfusionista *</Label>
              <Select value={caseRole} onValueChange={setCaseRole}>
                <SelectTrigger className={attemptedSubmit && !caseRole ? "border-red-500" : ""}><SelectValue placeholder="Selecciona tu rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Principal">Perfusionista Principal</SelectItem>
                  <SelectItem value="Asistente">Perfusionista Asistente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha de caso *</Label>
              <Input type="date" value={caseDate} onChange={e => setCaseDate(e.target.value)} className={attemptedSubmit && !caseDate ? "border-red-500" : ""} />
            </div>
            <div className="space-y-2">
              <Label>Nombre del Cirujano *</Label>
              <Input value={surgeonName} onChange={e => setSurgeonName(e.target.value)} placeholder="Ej. Dr. Juan Pérez" className={attemptedSubmit && !surgeonName ? "border-red-500" : ""} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Nombre de Institución *</Label>
              <Input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Nombre de la clínica / hospital" className={attemptedSubmit && !institution ? "border-red-500" : ""} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Tipo de cirugía *</Label>
              <Select value={surgeryType} onValueChange={setSurgeryType}>
                <SelectTrigger className={attemptedSubmit && !surgeryType ? "border-red-500" : ""}><SelectValue placeholder="Selecciona el tipo de cirugía" /></SelectTrigger>
                <SelectContent>
                  {SURGERY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCaseOpen(false)}>Cancelar</Button>
            <Button onClick={submitCase}>{editingCase ? 'Guardar Cambios' : 'Registrar caso'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal UCE */}
      <Dialog open={uceOpen} onOpenChange={setUceOpen}>
        <DialogContent className="sm:max-w-[740px]">
          <DialogHeader>
            <DialogTitle className="text-3xl">{editingUce ? 'Editar UCE' : "Registro de UCE's"}</DialogTitle>
            <DialogDescription>Completa la información del evento académico.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre y Apellido del PCC *</Label>
              <Input value={fullName} readOnly />
            </div>
            <div className="space-y-2">
              <Label>PCC # *</Label>
              <Input value={pcc ? Number(fourDigitsFromPcc(pcc)) : ''} readOnly />
            </div>

            <div className="space-y-2">
              <Label>Fecha del Evento *</Label>
              <Input type="date" value={uceDate} onChange={e => setUceDate(e.target.value)} className={attemptedSubmit && !uceDate ? "border-red-500" : ""} />
            </div>
            <div className="space-y-2">
              <Label>Nombre de la Institución *</Label>
              <Input value={uceInstitution} onChange={e => setUceInstitution(e.target.value)} className={attemptedSubmit && !uceInstitution ? "border-red-500" : ""} />
            </div>

            <div className="space-y-2">
              <Label>El evento fue Avalado por ALAP *</Label>
              <Select value={uceApproved} onValueChange={(v: 'si' | 'no') => setUceApproved(v)}>
                <SelectTrigger className={attemptedSubmit && !uceApproved ? "border-red-500" : ""}><SelectValue placeholder="Indique si fue avalado por ALAP" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="si">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre del Evento *</Label>
              <Input value={uceName} onChange={e => setUceName(e.target.value)} className={attemptedSubmit && !uceName ? "border-red-500" : ""} />
            </div>

            <div className="space-y-2">
              <Label>País donde se celebró el evento *</Label>
              <Input value={uceCountry} onChange={e => setUceCountry(e.target.value)} className={attemptedSubmit && !uceCountry ? "border-red-500" : ""} />
            </div>
            <div className="space-y-2">
              <Label>UCE&apos;s Adquiridos *</Label>
              <Input
                type="number"
                min={0}
                value={uceNumber ?? ''}
                onChange={e => setUceNumber(Number(e.target.value))}
                disabled={uceNumber === null}
                className={attemptedSubmit && (uceNumber === 0 && uceNumber !== null) ? "" : ""} // Valid logic tricky here, generally not empty if number or null(checkbox)
              />
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={uceNumber === null}
                  onCheckedChange={(ch) => setUceNumber(ch ? null : 0)}
                />
                No lo sé
              </label>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Tipo de Evento (marque lo que aplique)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Asistencia a Conferencia',
                  'Libro',
                  'Artículo Académico',
                  'Presentación o ponencia en evento',
                  'Encuesta ALAP',
                  'Simulación de Alta Fidelidad en Perfusión',
                  'Seminario Web (Webinar)',
                  'Simposio',
                  'Congreso',
                ].map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={uceEventTypes.includes(opt)}
                      onCheckedChange={(ch) => {
                        setUceEventTypes(prev => ch ? [...prev, opt] : prev.filter(x => x !== opt));
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Firma con sus iniciales</Label>
              <Input value={uceInitials} onChange={e => setUceInitials(e.target.value)} placeholder="Ej. EMH" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUceOpen(false)}>Cancelar</Button>
            <Button onClick={submitUce}>{editingUce ? 'Guardar Cambios' : 'Registrar UCE'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic Alert Dialog */}
      <AlertDialog open={confirmConfig.open} onOpenChange={(open: boolean) => setConfirmConfig(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              confirmConfig.action();
              setConfirmConfig(prev => ({ ...prev, open: false }));
            }}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
