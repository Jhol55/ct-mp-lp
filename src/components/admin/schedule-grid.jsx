"use client";

import { useEffect, useState, useTransition } from "react";
import { getSchedule, upsertScheduleSlot, deleteScheduleSlot } from "@/actions/schedule";

// Helper para gerar nome da aula a partir de modality e classType
function formatClassName(modality, classType) {
  if (!modality) return null;
  
  const modalityLabel = modality === "MUAY_THAI" ? "Muay Thai" : "Funcional";
  let typeLabel = null;
  
  if (classType === "KIDS") {
    typeLabel = "Kids";
  } else if (classType === "ADULTOS") {
    typeLabel = "Adultos";
  }
  
  if (typeLabel) {
    return `${modalityLabel} - ${typeLabel}`;
  }
  return modalityLabel;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const DAYS_OF_WEEK = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

// Gera horários de 30 em 30 minutos de 05:00 até 22:00
function generateTimeSlots() {
  const slots = [];
  for (let hour = 5; hour <= 22; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour < 22) {
      slots.push(`${String(hour).padStart(2, "0")}:30`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

const MODALITIES = [
  { value: "MUAY_THAI", label: "Muay Thai" },
  { value: "FUNCIONAL", label: "Funcional" },
];

const CLASS_TYPES = [
  { value: "ADULTOS", label: "Adultos" },
  { value: "KIDS", label: "Kids" },
  { value: "LIVRE", label: "Livre" },
];

export function ScheduleGrid({ unitId, disabled = false }) {
  const [slots, setSlots] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [modality, setModality] = useState("MUAY_THAI");
  const [classType, setClassType] = useState("LIVRE");
  const [durationMinutes, setDurationMinutes] = useState(60);

  async function loadSchedule() {
    if (!unitId) return;
    try {
      const data = await getSchedule(unitId);
      setSlots(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  function getSlot(dayOfWeek, time) {
    return slots.find(
      (s) => s.dayOfWeek === dayOfWeek && s.time === time,
    );
  }

  function openModal(dayOfWeek, time) {
    if (disabled || isPending) return;
    const slot = getSlot(dayOfWeek, time);
    setSelectedDay(dayOfWeek);
    setSelectedTime(time);
    setModality(slot?.modality || "MUAY_THAI");
    setClassType(slot?.classType || "LIVRE");
    setDurationMinutes(slot?.durationMinutes || 60);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedDay(null);
    setSelectedTime(null);
    setModality("MUAY_THAI");
    setClassType("LIVRE");
    setDurationMinutes(60);
  }

  async function handleSave() {
    if (!unitId || selectedDay === null || !selectedTime) return;

    startTransition(async () => {
      try {
        setError("");
        await upsertScheduleSlot(
          unitId,
          selectedDay,
          selectedTime,
          modality,
          classType,
          durationMinutes,
        );
        await loadSchedule();
        closeModal();
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function handleDelete() {
    if (!unitId || selectedDay === null || !selectedTime) return;

    startTransition(async () => {
      try {
        setError("");
        await deleteScheduleSlot(unitId, selectedDay, selectedTime);
        await loadSchedule();
        closeModal();
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  const hasExistingSlot = selectedDay !== null && selectedTime && getSlot(selectedDay, selectedTime);

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-muted bg-muted/50 px-3 py-2 text-left text-sm font-medium">
                  Horário
                </th>
                {DAYS_OF_WEEK.map((day) => (
                  <th
                    key={day.value}
                    className="border border-muted bg-muted/50 px-3 py-2 text-center text-sm font-medium"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time}>
                  <td className="border border-muted bg-muted/30 px-3 py-2 text-sm font-medium">
                    {time}
                  </td>
                  {DAYS_OF_WEEK.map((day) => {
                    const slot = getSlot(day.value, time);
                    const isEmpty = !slot || !slot.modality;
                    const displayName = slot ? formatClassName(slot.modality, slot.classType) : null;
                    return (
                      <td
                        key={`${day.value}-${time}`}
                        onClick={() => openModal(day.value, time)}
                        className={[
                          "border border-muted px-3 py-2 text-center text-sm transition cursor-pointer",
                          isEmpty
                            ? "bg-background hover:bg-muted/50"
                            : "bg-foreground text-background hover:bg-foreground/90",
                          disabled || isPending ? "cursor-not-allowed opacity-50" : "",
                        ].join(" ")}
                      >
                        {isEmpty ? (
                          <span className="text-muted-foreground text-xs">
                            Clique para adicionar
                          </span>
                        ) : (
                          <span className="font-medium">{displayName}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edição */}
      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {hasExistingSlot ? "Editar horário" : "Adicionar horário"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slotModality">Modalidade</Label>
              <Select
                value={modality}
                onValueChange={setModality}
                disabled={isPending}
              >
                <SelectTrigger id="slotModality" className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {MODALITIES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slotClassType">Tipo</Label>
              <Select
                value={classType}
                onValueChange={setClassType}
                disabled={isPending}
              >
                <SelectTrigger id="slotClassType" className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slotDuration">Duração da aula (minutos)</Label>
              <Input
                id="slotDuration"
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > 0) {
                    setDurationMinutes(value);
                  }
                }}
                placeholder="60"
                disabled={isPending}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {selectedDay !== null && selectedTime ? (
                <>
                  {DAYS_OF_WEEK.find((d) => d.value === selectedDay)?.label} às {selectedTime}
                </>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            {hasExistingSlot ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                Deletar
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isPending}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
