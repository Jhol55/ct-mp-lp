"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { createPlan } from "@/actions/plans";
import { createUnit, getUnit, listUnits, updateUnit } from "@/actions/units";
import { presignUpload } from "@/actions/uploads";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const BILLING_MODELS = [
  { value: "MONTHLY", label: "Mensal" },
  { value: "SEMIANNUAL", label: "Semestral" },
  { value: "ANNUAL", label: "Anual" },
];

function formatMoneyBRLFromCents(cents) {
  const n = Number(cents || 0) / 100;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  // Modal: new unit
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");

  // Modal: new plan
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [frequencyLabel, setFrequencyLabel] = useState("");
  const [priceRows, setPriceRows] = useState([{ model: "MONTHLY", price: "" }]);

  const canSubmitPlan = useMemo(() => {
    return (
      selectedUnitId &&
      planName.trim().length > 0 &&
      frequencyLabel.trim().length > 0
    );
  }, [selectedUnitId, planName, frequencyLabel]);

  async function refreshUnits() {
    const data = await listUnits();
    setUnits(Array.isArray(data) ? data : []);
    if (!selectedUnitId && data?.[0]?.id) {
      setSelectedUnitId(data[0].id);
    }
  }

  async function refreshSelectedUnit(id) {
    if (!id) return;
    const u = await getUnit(id);
    setSelectedUnit(u);
  }

  useEffect(() => {
    startTransition(async () => {
      try {
        await refreshUnits();
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startTransition(async () => {
      try {
        setError("");
        setSelectedUnit(null);
        await refreshSelectedUnit(selectedUnitId);
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitId]);

  function addPriceRow() {
    setPriceRows((rows) => [...rows, { model: "SEMIANNUAL", price: "" }]);
  }

  function removePriceRow(idx) {
    setPriceRows((rows) => rows.filter((_, i) => i !== idx));
  }

  async function handleCreateUnit() {
    const name = newUnitName.trim();
    if (!name) return;

    startTransition(async () => {
      try {
        setError("");
        const created = await createUnit({ name });
        setNewUnitName("");
        setUnitModalOpen(false);
        await refreshUnits();
        if (created?.id) setSelectedUnitId(created.id);
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function handleUploadPlansImage(file) {
    if (!selectedUnitId || !file) return;
    startTransition(async () => {
      try {
        setError("");
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const { uploadUrl, publicUrl, key } = await presignUpload({
          contentType: file.type || "image/jpeg",
          ext,
        });

        const put = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "image/jpeg",
          },
          body: file,
        });
        if (!put.ok) {
          throw new Error(`Upload falhou (${put.status})`);
        }

        await updateUnit(selectedUnitId, {
          plansImageUrl: publicUrl,
          plansImageKey: key,
        });
        await refreshSelectedUnit(selectedUnitId);
        await refreshUnits();
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function handleCreatePlan(e) {
    e.preventDefault();
    if (!selectedUnitId) return;

    startTransition(async () => {
      try {
        setError("");
        const prices = priceRows
          .map((r) => ({
            model: r.model,
            priceCents: Math.round(
              Number(String(r.price).replace(",", ".")) * 100,
            ),
          }))
          .filter((p) => p.model && Number.isFinite(p.priceCents) && p.priceCents > 0);

        await createPlan(selectedUnitId, {
          name: planName.trim(),
          frequencyLabel: frequencyLabel.trim(),
          prices,
        });

        setPlanName("");
        setFrequencyLabel("");
        setPriceRows([{ model: "MONTHLY", price: "" }]);
        setPlanModalOpen(false);
        await refreshSelectedUnit(selectedUnitId);
      } catch (e2) {
        setError(String(e2?.message || e2));
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] gap-6">
      {/* ── Sidebar: units list ── */}
      <aside className="w-72 shrink-0 rounded-2xl border bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Unidades</div>
            <div className="text-xs text-muted-foreground">Suas unidades</div>
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setUnitModalOpen(true)}
            title="Adicionar unidade"
          >
            +
          </Button>
        </div>

        <div className="space-y-2">
          {units.map((u) => {
            const active = u.id === selectedUnitId;
            return (
              <button
                key={u.id}
                onClick={() => setSelectedUnitId(u.id)}
                className={[
                  "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                  active ? "bg-muted" : "hover:bg-muted/60",
                ].join(" ")}
              >
                <div className="font-medium">{u.name}</div>
              </button>
            );
          })}
          {!units.length ? (
            <div className="text-sm text-muted-foreground">
              Nenhuma unidade ainda.
            </div>
          ) : null}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="text-3xl font-semibold">
          {selectedUnit?.name || "Selecione uma unidade"}
        </div>
        <div className="text-sm text-muted-foreground">
          Gerencie planos e valores desta unidade
        </div>

        {/* ── Plans image upload ── */}
        <Card>
          <CardHeader>
            <CardTitle>Foto dos planos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Faça upload da imagem que contém todos os planos
            </p>

            <div className="rounded-xl border border-dashed p-6 text-center">
              <Label htmlFor="plansImage">Escolher arquivo</Label>
              <Input
                id="plansImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleUploadPlansImage(e.target.files?.[0])}
                disabled={!selectedUnitId || isPending}
                className="mt-2"
              />
            </div>

            {selectedUnit?.plansImageUrl ? (
              <div className="overflow-hidden rounded-xl border">
                <Image
                  src={selectedUnit.plansImageUrl}
                  alt="Foto dos planos"
                  width={1200}
                  height={800}
                  className="h-auto w-full"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* ── Plans list ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Planos</CardTitle>
            <Button
              variant="outline"
              onClick={() => setPlanModalOpen(true)}
              disabled={!selectedUnitId || isPending}
            >
              + Adicionar plano
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedUnit?.plans?.length ? (
              selectedUnit.plans.map((p) => (
                <div key={p.id} className="rounded-xl border p-4">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Frequência: {p.frequencyLabel}
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    {p.prices?.map((pr) => (
                      <div key={pr.id} className="flex justify-between">
                        <span>
                          {BILLING_MODELS.find((m) => m.value === pr.model)?.label ??
                            pr.model}
                        </span>
                        <span className="font-medium">
                          {formatMoneyBRLFromCents(pr.priceCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Nenhum plano ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ══════ Modal: Nova unidade ══════ */}
      <Dialog open={unitModalOpen} onOpenChange={setUnitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova unidade</DialogTitle>
            <DialogDescription>
              Digite o nome da nova unidade
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="modalUnitName">Nome da unidade</Label>
            <Input
              id="modalUnitName"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="Ex: Academia Centro"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateUnit();
              }}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUnitModalOpen(false);
                setNewUnitName("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUnit}
              disabled={isPending || !newUnitName.trim()}
            >
              Criar unidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════ Modal: Novo plano ══════ */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo plano</DialogTitle>
            <DialogDescription>
              Preencha os dados do plano para {selectedUnit?.name || "a unidade"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modalPlanName">Nome do plano</Label>
              <Input
                id="modalPlanName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ex: Basic"
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalFrequencyLabel">Frequência</Label>
              <Input
                id="modalFrequencyLabel"
                value={frequencyLabel}
                onChange={(e) => setFrequencyLabel(e.target.value)}
                placeholder="Ex: 4 a 5x semana"
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Modelos de pagamento</div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPriceRow}
                disabled={isPending}
              >
                + Adicionar modelo
              </Button>
            </div>

            <div className="space-y-3">
              {priceRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3">
                  <div className="col-span-6">
                    <Label>Modelo</Label>
                    <select
                      value={row.model}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPriceRows((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, model: v } : r)),
                        );
                      }}
                      disabled={isPending}
                      className="mt-2 flex h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                    >
                      {BILLING_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <Label>Valor (R$)</Label>
                    <Input
                      value={row.price}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPriceRows((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, price: v } : r)),
                        );
                      }}
                      placeholder="Ex: 99,90"
                      disabled={isPending}
                      className="mt-2"
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePriceRow(idx)}
                      disabled={isPending || priceRows.length <= 1}
                      title="Remover"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPlanModalOpen(false);
                  setPlanName("");
                  setFrequencyLabel("");
                  setPriceRows([{ model: "MONTHLY", price: "" }]);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmitPlan || isPending}>
                Adicionar plano
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
