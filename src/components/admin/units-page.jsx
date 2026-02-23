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

const BILLING_MODELS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "SEMIANNUAL", label: "Semiannual" },
  { value: "ANNUAL", label: "Annual" },
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

  const [newUnitName, setNewUnitName] = useState("");

  // Plan form
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
          throw new Error(`Upload failed (${put.status})`);
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
        await refreshSelectedUnit(selectedUnitId);
      } catch (e2) {
        setError(String(e2?.message || e2));
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] gap-6">
      <aside className="w-72 shrink-0 rounded-2xl border bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Units</div>
            <div className="text-xs text-muted-foreground">Your units</div>
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={handleCreateUnit}
            disabled={isPending || !newUnitName.trim()}
            title="Add unit"
          >
            +
          </Button>
        </div>

        <div className="mb-4 space-y-2">
          <Label htmlFor="newUnitName">Unit name</Label>
          <Input
            id="newUnitName"
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            placeholder="Ex: Downtown Gym"
          />
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
            <div className="text-sm text-muted-foreground">No units yet.</div>
          ) : null}
        </div>
      </aside>

      <div className="flex-1 space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="text-3xl font-semibold">
          {selectedUnit?.name || "Select a unit"}
        </div>
        <div className="text-sm text-muted-foreground">
          Manage plans and pricing for this unit
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plans image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload the image that contains all available plans
            </p>

            <div className="rounded-xl border border-dashed p-6 text-center">
              <Label htmlFor="plansImage">Choose file</Label>
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
                  alt="Plans image"
                  width={1200}
                  height={800}
                  className="h-auto w-full"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan name</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ex: Basic"
                  disabled={!selectedUnitId || isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequencyLabel">Frequency</Label>
                <Input
                  id="frequencyLabel"
                  value={frequencyLabel}
                  onChange={(e) => setFrequencyLabel(e.target.value)}
                  placeholder="Ex: 4–5x/week"
                  disabled={!selectedUnitId || isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Billing models</div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPriceRow}
                  disabled={!selectedUnitId || isPending}
                >
                  + Add model
                </Button>
              </div>

              <div className="space-y-3">
                {priceRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3">
                    <div className="col-span-6">
                      <Label>Model</Label>
                      <select
                        value={row.model}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPriceRows((rows) =>
                            rows.map((r, i) => (i === idx ? { ...r, model: v } : r)),
                          );
                        }}
                        disabled={!selectedUnitId || isPending}
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
                      <Label>Price (BRL)</Label>
                      <Input
                        value={row.price}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPriceRows((rows) =>
                            rows.map((r, i) => (i === idx ? { ...r, price: v } : r)),
                          );
                        }}
                        placeholder="Ex: 99,90"
                        disabled={!selectedUnitId || isPending}
                        className="mt-2"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removePriceRow(idx)}
                        disabled={isPending || priceRows.length <= 1}
                        title="Remove"
                      >
                        🗑
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={!canSubmitPlan || isPending}>
                Add plan
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedUnit?.plans?.length ? (
              selectedUnit.plans.map((p) => (
                <div key={p.id} className="rounded-xl border p-4">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Frequency: {p.frequencyLabel}
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
              <div className="text-sm text-muted-foreground">No plans yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

