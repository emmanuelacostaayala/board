// /components/PCCDashboard.tsx
'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { PCC_LIST, PccRecord } from '@/data/pccList';
import {
  assignPccToUser,
  createClinicalCase,
  createUceEvent,
  getMyPcc,
  listMyClinicalCases,
  listMyUceEvents,
  listTakenPccCodes,
  releaseMyPcc,
  
} from '@/lib/actions/pcc.actions';
import { userLooksLikePccName } from "@/lib/pcc.helpers";

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

export default function PCCDashboard(props: Props) {
  const { userId, userFirstName, userLastName, createdAtISO } = props;
  const fullName = `${userFirstName ?? ''} ${userLastName ?? ''}`.trim();

  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [pcc, setPcc] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();

  const [caseOpen, setCaseOpen] = useState(false);
  const [uceOpen, setUceOpen] = useState(false);

  // Form caso clínico
  const [caseDate, setCaseDate] = useState('');
  const [surgeonName, setSurgeonName] = useState('');
  const [institution, setInstitution] = useState('');
  const [surgeryType, setSurgeryType] = useState<string | undefined>(undefined);

  // Form UCE
  const [uceDate, setUceDate] = useState('');
  const [uceInstitution, setUceInstitution] = useState('');
  const [uceApproved, setUceApproved] = useState<'si' | 'no' | ''>('');
  const [uceName, setUceName] = useState('');
  const [uceCountry, setUceCountry] = useState('');
  const [uceNumber, setUceNumber] = useState<number>(0);
  const [uceEventTypes, setUceEventTypes] = useState<string[]>([]);
  const [uceInitials, setUceInitials] = useState('');

  // Tablas
  const [cases, setCases] = useState<any[]>([]);
  const [uces, setUces] = useState<any[]>([]);

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
      const ok = confirm('Ese usuario no se llama igual que tú. ¿Seguro que eres tú?');
      if (!ok) return;
    }
    startTransition(async () => {
      const res = await assignPccToUser({ userId, userFullName: fullName, pccCode: newCode });
      if (!res.ok) return alert(res.message);
      setPcc(res.pccCode);
      const codes = await listTakenPccCodes();
      setTaken(codes);
    });
  }

  function requirePccOrWarn(openSetter: (v: boolean) => void) {
    if (!pcc) return alert('Debes seleccionar tu PCC antes de continuar.');
    openSetter(true);
  }

  function certificateHref() {
    if (!pcc) return '#';
    const four = fourDigitsFromPcc(pcc);
    return `/PCC-${four}.pdf`; // PDFs en /public
  }

  async function handleRelease() {
    const ok = confirm('Vas a liberar tu PCC. ¿Continuar?');
    if (!ok) return;
    startTransition(async () => {
      await releaseMyPcc(userId);
      setPcc(null);
      const codes = await listTakenPccCodes();
      setTaken(codes);
    });
  }

  async function submitCase() {
    if (!pcc) return alert('Selecciona tu PCC primero.');
    if (!caseDate || !surgeonName || !institution || !surgeryType) {
      return alert('Completa todos los campos obligatorios.');
    }
    await createClinicalCase({
      userId,
      pccCode: pcc,
      caseDate,
      surgeonName,
      institution,
      surgeryType,
    });
    setCaseOpen(false);
    setCaseDate(''); setSurgeonName(''); setInstitution(''); setSurgeryType(undefined);
    const c = await listMyClinicalCases(userId);
    setCases(c);
    alert('Caso clínico registrado.');
  }

  async function submitUce() {
    if (!pcc) return alert('Selecciona tu PCC primero.');
    if (!uceDate || !uceInstitution || !uceName || !uceCountry || !uceNumber || !uceApproved) {
      return alert('Completa todos los campos obligatorios.');
    }
    await createUceEvent({
      userId, pccCode: pcc, eventDate: uceDate, institution: uceInstitution,
      approvedByALAP: uceApproved === 'si', eventName: uceName, country: uceCountry,
      ucesAcquired: Number(uceNumber), eventTypes: uceEventTypes, initials: uceInitials || ''
    });
    setUceOpen(false);
    setUceDate(''); setUceInstitution(''); setUceName(''); setUceCountry('');
    setUceNumber(0); setUceEventTypes([]); setUceInitials(''); setUceApproved('');
    const u = await listMyUceEvents(userId);
    setUces(u);
    alert('UCE registrada.');
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center gap-4">
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
          <Button onClick={() => requirePccOrWarn(setCaseOpen)}>
            Registra tu caso clínico
          </Button>
          <Button variant="destructive" onClick={() => requirePccOrWarn(setUceOpen)}>
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
        <h2 className="text-4xl font-extrabold mb-4">REGISTRO DE CASOS CLÍNICOS</h2>
        <div className="rounded-md border overflow-auto max-h-[420px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Fecha de Generación</TableHead>
                <TableHead>#PCC</TableHead>
                <TableHead>Nombre del Cirujano</TableHead>
                <TableHead>Nombre de Institución</TableHead>
                <TableHead>Tipo de Cirugía</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{new Date(c.case_date ?? c.caseDate).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>{Number(fourDigitsFromPcc(c.pcc_code ?? c.pccCode))}</TableCell>
                  <TableCell>{c.surgeon_name ?? c.surgeonName}</TableCell>
                  <TableCell>{c.institution}</TableCell>
                  <TableCell>{c.surgery_type ?? c.surgeryType}</TableCell>
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
        <h2 className="text-4xl font-extrabold mb-4">REGISTRO UCE (Actividad académica)</h2>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {uces.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.event_name ?? u.eventName}</TableCell>
                  <TableCell>{u.institution}</TableCell>
                  <TableCell>{new Date(u.event_date ?? u.eventDate).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>{u.country}</TableCell>
                  <TableCell>{Number(fourDigitsFromPcc(u.pcc_code ?? u.pccCode))}</TableCell>
                  <TableCell>{(u.approved_by_alap ?? u.approvedByALAP) ? 'Sí' : 'No'}</TableCell>
                  <TableCell>{u.uces_acquired ?? u.ucesAcquired}</TableCell>
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
            <DialogTitle className="text-3xl">REGISTRO DE CASOS CLÍNICOS</DialogTitle>
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

            <div className="space-y-2">
              <Label>Fecha de caso *</Label>
              <Input type="date" value={caseDate} onChange={e => setCaseDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nombre del Cirujano *</Label>
              <Input value={surgeonName} onChange={e => setSurgeonName(e.target.value)} placeholder="Ej. Dr. Juan Pérez" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Nombre de Institución *</Label>
              <Input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Nombre de la clínica / hospital" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Tipo de cirugía *</Label>
              <Select value={surgeryType} onValueChange={setSurgeryType}>
                <SelectTrigger><SelectValue placeholder="Selecciona el tipo de cirugía" /></SelectTrigger>
                <SelectContent>
                  {SURGERY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCaseOpen(false)}>Cancelar</Button>
            <Button onClick={submitCase}>Registrar caso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal UCE */}
      <Dialog open={uceOpen} onOpenChange={setUceOpen}>
        <DialogContent className="sm:max-w-[740px]">
          <DialogHeader>
            <DialogTitle className="text-3xl">Registro de UCE&apos;s</DialogTitle>
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
              <Input type="date" value={uceDate} onChange={e => setUceDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nombre de la Institución *</Label>
              <Input value={uceInstitution} onChange={e => setUceInstitution(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>El evento fue Avalado por ALAP *</Label>
              <Select value={uceApproved} onValueChange={(v: 'si' | 'no') => setUceApproved(v)}>
                <SelectTrigger><SelectValue placeholder="Indique si fue avalado por ALAP" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="si">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre del Evento *</Label>
              <Input value={uceName} onChange={e => setUceName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>País donde se celebró el evento *</Label>
              <Input value={uceCountry} onChange={e => setUceCountry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>UCE&apos;s Adquiridos *</Label>
              <Input type="number" min={0} value={uceNumber} onChange={e => setUceNumber(Number(e.target.value))} />
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
            <Button onClick={submitUce}>Registrar UCE</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
