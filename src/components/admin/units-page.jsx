"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Pencil, Upload, Save, Trash2 } from "lucide-react";
import { createPlan, updatePlan } from "@/actions/plans";
import { createUnit, deleteUnit, getUnit, listUnits, updateUnit } from "@/actions/units";
import { createPartner, deletePartner, listPartners, updatePartner } from "@/actions/partners";
import { listModalities, updateModalityImage } from "@/actions/modalities";
import { presignUpload } from "@/actions/uploads";
import { ScheduleGrid } from "@/components/admin/schedule-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const BILLING_MODELS = [
  { value: "MONTHLY", label: "Mensal" },
  { value: "SEMIANNUAL", label: "Semestral" },
  { value: "ANNUAL", label: "Anual" },
];

const FREQUENCY_OPTIONS = [
  { value: "2 a 3x por semana", label: "2 a 3x por semana" },
  { value: "4 a 5x por semana", label: "4 a 5x por semana" },
  { value: "Livre", label: "Livre (quantas vezes quiser por semana)" },
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
  const scheduleFileInputRef = useRef(null);
  const scheduleSaveRef = useRef(null); // Ref para função de salvar do grid
  const modalityImageInputRefs = useRef({}); // Refs para upload de imagens das modalidades (objeto com chaves sendo modalityId)

  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasUnsavedScheduleChanges, setHasUnsavedScheduleChanges] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Address fields
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Payment and cancellation fields
  const [paymentMethods, setPaymentMethods] = useState("");
  const [cancellationRules, setCancellationRules] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");

  // Modal: new unit
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");

  // Modal: edit unit name
  const [editUnitModalOpen, setEditUnitModalOpen] = useState(false);
  const [editUnitName, setEditUnitName] = useState("");

  // Modal: delete unit
  const [deleteUnitModalOpen, setDeleteUnitModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);

  // Modal: new plan
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planModalityId, setPlanModalityId] = useState(null); // ID da modalidade para o plano sendo criado
  const [planName, setPlanName] = useState("");
  const [frequencyLabel, setFrequencyLabel] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [notes, setNotes] = useState("");
  const [priceRows, setPriceRows] = useState([{ model: "MONTHLY", price: "" }]);

  // Modal: edit plan
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [editPlanId, setEditPlanId] = useState(null);
  const [editPlanModalityId, setEditPlanModalityId] = useState(null); // ID da modalidade para o plano sendo editado
  const [editPlanName, setEditPlanName] = useState("");
  const [editFrequencyLabel, setEditFrequencyLabel] = useState("");

  // Partners
  const [partners, setPartners] = useState([]);

  // Modalities
  const [modalities, setModalities] = useState([]);
  
  // Modal: new partner
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerRulesAndNotes, setPartnerRulesAndNotes] = useState("");

  // Modal: edit partner
  const [editPartnerModalOpen, setEditPartnerModalOpen] = useState(false);
  const [editPartnerId, setEditPartnerId] = useState(null);
  const [editPartnerName, setEditPartnerName] = useState("");
  const [editPartnerRulesAndNotes, setEditPartnerRulesAndNotes] = useState("");

  // Modal: delete partner
  const [deletePartnerModalOpen, setDeletePartnerModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [editMinAge, setEditMinAge] = useState("");
  const [editMaxAge, setEditMaxAge] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPriceRows, setEditPriceRows] = useState([]);

  const canSubmitPlan = useMemo(() => {
    return (
      selectedUnitId &&
      planModalityId &&
      planName.trim().length > 0 &&
      frequencyLabel.trim().length > 0
    );
  }, [selectedUnitId, planModalityId, planName, frequencyLabel]);

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
        // Carregar parceiros e modalidades
        if (selectedUnitId) {
          const partnersData = await listPartners(selectedUnitId);
          setPartners(Array.isArray(partnersData) ? partnersData : []);
          const modalitiesData = await listModalities(selectedUnitId);
          setModalities(Array.isArray(modalitiesData) ? modalitiesData : []);
        } else {
          setPartners([]);
          setModalities([]);
        }
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitId]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges || hasUnsavedScheduleChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, hasUnsavedScheduleChanges]);

  useEffect(() => {
    if (selectedUnit) {
      setAddress(selectedUnit.address || "");
      setAddressNumber(selectedUnit.addressNumber || "");
      setNeighborhood(selectedUnit.neighborhood || "");
      setCity(selectedUnit.city || "");
      setState(selectedUnit.state || "");
      setZipCode(selectedUnit.zipCode || "");
      setPaymentMethods(selectedUnit.paymentMethods || "");
      setCancellationRules(selectedUnit.cancellationRules || "");
      setGeneralNotes(selectedUnit.generalNotes || "");
      setHasUnsavedChanges(false);
    }
  }, [selectedUnit]);

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

  async function handleUploadModalityImage(modalityId, file) {
    if (!selectedUnitId || !modalityId || !file) return;
    startTransition(async () => {
      try {
        setError("");
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const { uploadUrl, publicUrl, key } = await presignUpload({
          contentType: file.type || "image/jpeg",
          ext,
          type: "plans",
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

        await updateModalityImage(selectedUnitId, modalityId, publicUrl, key);
        await refreshModalities();
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function refreshModalities() {
    if (!selectedUnitId) return;
    try {
      const modalitiesData = await listModalities(selectedUnitId);
      setModalities(Array.isArray(modalitiesData) ? modalitiesData : []);
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function handleUploadScheduleImage(file) {
    if (!selectedUnitId || !file) return;
    startTransition(async () => {
      try {
        setError("");
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const { uploadUrl, publicUrl, key } = await presignUpload({
          contentType: file.type || "image/jpeg",
          ext,
          type: "schedule",
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
          scheduleImageUrl: publicUrl,
          scheduleImageKey: key,
        });
        await refreshSelectedUnit(selectedUnitId);
        await refreshUnits();
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function handleSaveAddress() {
    if (!selectedUnitId) return;
    startTransition(async () => {
      try {
        setError("");
        await updateUnit(selectedUnitId, {
          address,
          addressNumber,
          neighborhood,
          city,
          state,
          zipCode,
        });
        await refreshSelectedUnit(selectedUnitId);
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function handleSaveAll() {
    if (!selectedUnitId) return;
    startTransition(async () => {
      try {
        setError("");
        
        // Salvar nome da unidade se foi editado
        if (editUnitName.trim() && editUnitName.trim() !== selectedUnit?.name) {
          await updateUnit(selectedUnitId, { name: editUnitName.trim() });
          setEditUnitName("");
          setEditUnitModalOpen(false);
        }

        // Salvar campos de endereço
        await updateUnit(selectedUnitId, {
          address,
          addressNumber,
          neighborhood,
          city,
          state,
          zipCode,
          paymentMethods,
          cancellationRules,
          generalNotes,
        });

        // Salvar mudanças do grid de horários
        if (hasUnsavedScheduleChanges && scheduleSaveRef.current) {
          await scheduleSaveRef.current();
        }

        await refreshSelectedUnit(selectedUnitId);
        await refreshUnits();
        setHasUnsavedChanges(false);
        setHasUnsavedScheduleChanges(false);
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function handleDeleteUnit() {
    if (!unitToDelete) return;
    startTransition(async () => {
      try {
        setError("");
        await deleteUnit(unitToDelete.id);
        
        // Se a unidade deletada estava selecionada, limpar a seleção
        if (unitToDelete.id === selectedUnitId) {
          setSelectedUnitId(null);
          setSelectedUnit(null);
        }
        
        // Atualizar a lista de unidades
        await refreshUnits();
        
        // Fechar o modal
        setDeleteUnitModalOpen(false);
        setUnitToDelete(null);
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function refreshPartners() {
    if (!selectedUnitId) return;
    try {
      const partnersData = await listPartners(selectedUnitId);
      setPartners(Array.isArray(partnersData) ? partnersData : []);
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function handleCreatePartner(e) {
    e?.preventDefault();
    if (!selectedUnitId) return;
    startTransition(async () => {
      try {
        setError("");
        await createPartner(selectedUnitId, {
          name: partnerName.trim(),
          rulesAndNotes: partnerRulesAndNotes.trim() || null,
        });
        setPartnerName("");
        setPartnerRulesAndNotes("");
        setPartnerModalOpen(false);
        await refreshPartners();
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  function openEditPartnerModal(partner) {
    setEditPartnerId(partner.id);
    setEditPartnerName(partner.name);
    setEditPartnerRulesAndNotes(partner.rulesAndNotes || "");
    setEditPartnerModalOpen(true);
  }

  async function handleEditPartner(e) {
    e?.preventDefault();
    if (!selectedUnitId || !editPartnerId) return;
    startTransition(async () => {
      try {
        setError("");
        await updatePartner(selectedUnitId, editPartnerId, {
          name: editPartnerName.trim(),
          rulesAndNotes: editPartnerRulesAndNotes.trim() || null,
        });
        setEditPartnerModalOpen(false);
        setEditPartnerId(null);
        setEditPartnerName("");
        setEditPartnerRulesAndNotes("");
        await refreshPartners();
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function handleDeletePartner() {
    if (!selectedUnitId || !partnerToDelete) return;
    startTransition(async () => {
      try {
        setError("");
        await deletePartner(selectedUnitId, partnerToDelete.id);
        await refreshPartners();
        setDeletePartnerModalOpen(false);
        setPartnerToDelete(null);
      } catch (e) {
        setError(String(e?.message || e));
      }
    });
  }

  async function handleCreatePlan(e) {
    e.preventDefault();
    if (!selectedUnitId || !planModalityId) return;

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

        await createPlan(selectedUnitId, planModalityId, {
          name: planName.trim(),
          frequencyLabel: frequencyLabel.trim(),
          minAge: minAge.trim() ? Number(minAge) : null,
          maxAge: maxAge.trim() ? Number(maxAge) : null,
          notes: notes.trim() || null,
          prices,
        });

        setPlanName("");
        setFrequencyLabel("");
        setMinAge("");
        setMaxAge("");
        setNotes("");
        setPriceRows([{ model: "MONTHLY", price: "" }]);
        setPlanModalityId(null);
        setPlanModalOpen(false);
        await refreshModalities();
      } catch (e2) {
        setError(String(e2?.message || e2));
      }
    });
  }

  function openEditUnitModal() {
    setEditUnitName(selectedUnit?.name || "");
    setEditUnitModalOpen(true);
  }

  async function handleEditUnitName() {
    const name = editUnitName.trim();
    if (!name || !selectedUnitId) return;

    // Apenas marca como mudança não salva, não salva ainda
    if (name !== selectedUnit?.name) {
      setHasUnsavedChanges(true);
    }
    setEditUnitModalOpen(false);
  }

  function openEditPlanModal(plan, modalityId) {
    setEditPlanId(plan.id);
    setEditPlanModalityId(modalityId);
    setEditPlanName(plan.name);
    setEditFrequencyLabel(plan.frequencyLabel);
    setEditMinAge(plan.minAge ? String(plan.minAge) : "");
    setEditMaxAge(plan.maxAge ? String(plan.maxAge) : "");
    setEditNotes(plan.notes || "");
    setEditPriceRows(
      plan.prices?.length
        ? plan.prices.map((pr) => ({
            model: pr.model,
            price: String((pr.priceCents / 100).toFixed(2)).replace(".", ","),
          }))
        : [{ model: "MONTHLY", price: "" }],
    );
    setEditPlanModalOpen(true);
  }

  function addEditPriceRow() {
    setEditPriceRows((rows) => [...rows, { model: "SEMIANNUAL", price: "" }]);
  }

  function removeEditPriceRow(idx) {
    setEditPriceRows((rows) => rows.filter((_, i) => i !== idx));
  }

  async function handleEditPlan(e) {
    e.preventDefault();
    if (!selectedUnitId || !editPlanId || !editPlanModalityId) return;

    startTransition(async () => {
      try {
        setError("");
        const prices = editPriceRows
          .map((r) => ({
            model: r.model,
            priceCents: Math.round(
              Number(String(r.price).replace(",", ".")) * 100,
            ),
          }))
          .filter((p) => p.model && Number.isFinite(p.priceCents) && p.priceCents > 0);

        await updatePlan(selectedUnitId, editPlanModalityId, editPlanId, {
          name: editPlanName.trim(),
          frequencyLabel: editFrequencyLabel.trim(),
          minAge: editMinAge.trim() ? Number(editMinAge) : null,
          maxAge: editMaxAge.trim() ? Number(editMaxAge) : null,
          notes: editNotes.trim() || null,
          prices,
        });

        setEditPlanModalOpen(false);
        setEditPlanModalityId(null);
        await refreshModalities();
      } catch (e2) {
        setError(String(e2?.message || e2));
      }
    });
  }

  const canSubmitEditPlan = useMemo(() => {
    return (
      editPlanId &&
      editPlanName.trim().length > 0 &&
      editFrequencyLabel.trim().length > 0
    );
  }, [editPlanId, editPlanName, editFrequencyLabel]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] gap-6">
      {/* ── Sidebar: units list ── */}
      <aside className="w-56 shrink-0 rounded-2xl border bg-background p-4">
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
              <div
                key={u.id}
                className={[
                  "flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm transition",
                  active ? "bg-muted" : "hover:bg-muted/60",
                ].join(" ")}
              >
                <button
                  onClick={() => {
                    if (hasUnsavedChanges || hasUnsavedScheduleChanges) {
                      setPendingNavigation(() => () => setSelectedUnitId(u.id));
                      setShowUnsavedChangesModal(true);
                    } else {
                      setSelectedUnitId(u.id);
                    }
                  }}
                  className="flex-1 text-left"
                >
                  <div className="font-medium">{u.name}</div>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUnitToDelete(u);
                    setDeleteUnitModalOpen(true);
                  }}
                  title="Excluir unidade"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
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

        <div className="flex items-center gap-3">
          <div className="text-3xl font-semibold">
            {selectedUnit?.name || "Selecione uma unidade"}
          </div>
          {selectedUnit ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={openEditUnitModal}
                title="Editar nome da unidade"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={(!hasUnsavedChanges && !hasUnsavedScheduleChanges) || isPending}
                className="ml-auto"
                variant={hasUnsavedChanges || hasUnsavedScheduleChanges ? "default" : "outline"}
              >
                <Save className="size-4 mr-2" />
                Salvar
              </Button>
            </>
          ) : null}
        </div>
        <div className="text-sm text-muted-foreground">
          Gerencie planos e valores desta unidade
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="planos" className="w-full">
          <TabsList>
            <TabsTrigger value="planos">Planos</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
            <TabsTrigger value="horarios">Horários</TabsTrigger>
            <TabsTrigger value="parceiros">Parceiros</TabsTrigger>
            <TabsTrigger value="observacoes">Observações Gerais</TabsTrigger>
          </TabsList>

          {/* ── Tab: Planos ── */}
          <TabsContent value="planos" className="space-y-6 mt-6">
            {/* ── Payment methods and cancellation rules ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paymentMethods">Formas de Pagamento</Label>
                <Textarea
                  id="paymentMethods"
                  value={paymentMethods}
                  onChange={(e) => {
                    setPaymentMethods(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Descreva as formas de pagamento aceitas..."
                  className="min-h-[120px]"
                  disabled={!selectedUnitId || isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellationRules">Regras de Cancelamento</Label>
                <Textarea
                  id="cancellationRules"
                  value={cancellationRules}
                  onChange={(e) => {
                    setCancellationRules(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Descreva as regras de cancelamento..."
                  className="min-h-[120px]"
                  disabled={!selectedUnitId || isPending}
                />
              </div>
            </div>

            {/* ── Nested Tabs for Modalities ── */}
            <Tabs defaultValue="muay-thai" className="w-full">
              <TabsList>
                <TabsTrigger value="muay-thai">Muay Thai</TabsTrigger>
                <TabsTrigger value="funcional">Funcional</TabsTrigger>
              </TabsList>

              {modalities.map((modality) => {
                const modalityName = modality.modality === "MUAY_THAI" ? "Muay Thai" : "Funcional";
                const tabValue = modality.modality === "MUAY_THAI" ? "muay-thai" : "funcional";
                
                return (
                  <TabsContent key={modality.id} value={tabValue} className="space-y-6 mt-6">
                    {/* ── Modality image upload ── */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Imagem dos Planos</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Faça upload da imagem contendo os planos disponíveis para {modalityName}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <input
                          ref={(el) => {
                            modalityImageInputRefs.current[modality.id] = el;
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadModalityImage(modality.id, e.target.files?.[0])}
                          disabled={!selectedUnitId || isPending}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => modalityImageInputRefs.current[modality.id]?.click()}
                          disabled={!selectedUnitId || isPending}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleUploadModalityImage(modality.id, file);
                          }}
                          className="flex w-full h-full min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-6 transition hover:border-muted-foreground/50 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {modality.imageUrl ? (
                            <Image
                              src={`/api/image?url=${encodeURIComponent(modality.imageUrl)}`}
                              alt={`Imagem dos planos - ${modalityName}`}
                              width={600}
                              height={300}
                              className="max-h-64 w-auto rounded-lg object-contain"
                            />
                          ) : (
                            <>
                              <Upload className="mb-2 size-8 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Arraste uma imagem aqui ou
                              </span>
                              <span className="mt-2 inline-flex items-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm">
                                Selecionar Arquivo
                              </span>
                            </>
                          )}
                        </button>
                      </CardContent>
                    </Card>

                    {/* ── Plans list ── */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Planos</CardTitle>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPlanModalityId(modality.id);
                            setPlanModalOpen(true);
                          }}
                          disabled={!selectedUnitId || isPending}
                        >
                          + Adicionar plano
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {modality.plans?.length ? (
                          modality.plans.map((p) => (
                            <div key={p.id} className="rounded-xl border p-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{p.name}</div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openEditPlanModal(p, modality.id)}
                                  title="Editar plano"
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              </div>
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
                  </TabsContent>
                );
              })}
            </Tabs>
          </TabsContent>

          {/* ── Tab: Endereço ── */}
          <TabsContent value="endereco" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Preencha o endereço da unidade
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Ex: Rua das Flores"
                    disabled={!selectedUnitId || isPending}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="addressNumber">Número</Label>
                    <Input
                      id="addressNumber"
                      value={addressNumber}
                      onChange={(e) => {
                        setAddressNumber(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Ex: 123"
                      disabled={!selectedUnitId || isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => {
                        setZipCode(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Ex: 12345-678"
                      disabled={!selectedUnitId || isPending}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={neighborhood}
                    onChange={(e) => {
                      setNeighborhood(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Ex: Centro"
                    disabled={!selectedUnitId || isPending}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Ex: São Paulo"
                      disabled={!selectedUnitId || isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Ex: SP"
                      disabled={!selectedUnitId || isPending}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Horários ── */}
          <TabsContent value="horarios" className="space-y-6 mt-6">
            {/* ── Schedule image upload ── */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem dos Horários</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Faça upload da imagem contendo os horários disponíveis
                </p>
              </CardHeader>
              <CardContent>
                <input
                  ref={scheduleFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadScheduleImage(e.target.files?.[0])}
                  disabled={!selectedUnitId || isPending}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => scheduleFileInputRef.current?.click()}
                  disabled={!selectedUnitId || isPending}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUploadScheduleImage(file);
                  }}
                  className="flex w-full h-full min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-6 transition hover:border-muted-foreground/50 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selectedUnit?.scheduleImageUrl ? (
                    <Image
                      src={`/api/image?url=${encodeURIComponent(selectedUnit.scheduleImageUrl)}`}
                      alt="Imagem dos horários"
                      width={600}
                      height={300}
                      className="max-h-64 w-auto rounded-lg object-contain"
                    />
                  ) : (
                    <>
                      <Upload className="mb-2 size-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Arraste uma imagem aqui ou
                      </span>
                      <span className="mt-2 inline-flex items-center rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm">
                        Selecionar Arquivo
                      </span>
                    </>
                  )}
                </button>
              </CardContent>
            </Card>

            {/* ── Schedule Grid ── */}
            <Card>
              <CardHeader>
                <CardTitle>Grade de Horários</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Clique nas células para adicionar ou editar horários das aulas
                </p>
              </CardHeader>
              <CardContent>
                <ScheduleGrid
                  unitId={selectedUnitId}
                  disabled={!selectedUnitId || isPending}
                  onUnsavedChanges={(hasChanges) => setHasUnsavedScheduleChanges(hasChanges)}
                  onSave={(saveFn) => {
                    scheduleSaveRef.current = saveFn;
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Parceiros ── */}
          <TabsContent value="parceiros" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Parceiros</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie os parceiros desta unidade (ex: Wellhub/Gympass, Totalpass)
                </p>
              </div>
              <Button
                onClick={() => setPartnerModalOpen(true)}
                disabled={!selectedUnitId || isPending}
              >
                + Adicionar Parceiro
              </Button>
            </div>

            {partners.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum parceiro cadastrado ainda.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {partners.map((partner) => (
                  <Card key={partner.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditPartnerModal(partner)}
                            title="Editar parceiro"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setPartnerToDelete(partner);
                              setDeletePartnerModalOpen(true);
                            }}
                            title="Excluir parceiro"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {partner.rulesAndNotes ? (
                      <CardContent>
                        <div className="space-y-2">
                          <Label>Regras e Observações</Label>
                          <div className="rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                            {partner.rulesAndNotes}
                          </div>
                        </div>
                      </CardContent>
                    ) : null}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Observações Gerais ── */}
          <TabsContent value="observacoes" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Observações Gerais</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adicione observações gerais sobre esta unidade
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="generalNotes">Observações</Label>
                  <Textarea
                    id="generalNotes"
                    value={generalNotes}
                    onChange={(e) => {
                      setGeneralNotes(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Digite observações gerais sobre a unidade..."
                    className="min-h-[200px]"
                    disabled={!selectedUnitId || isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ══════ Modal: Alterações não salvas ══════ */}
      <Dialog open={showUnsavedChangesModal} onOpenChange={setShowUnsavedChangesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Você tem alterações não salvas</DialogTitle>
            <DialogDescription>
              Deseja salvar suas alterações antes de sair?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUnsavedChangesModal(false);
                setPendingNavigation(null);
              }}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                setShowUnsavedChangesModal(false);
                setHasUnsavedChanges(false);
                setHasUnsavedScheduleChanges(false);
                // Resetar estados para descartar mudanças
                if (selectedUnitId) {
                  await refreshSelectedUnit(selectedUnitId);
                }
                if (pendingNavigation) {
                  pendingNavigation();
                  setPendingNavigation(null);
                }
              }}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Sair sem salvar
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await handleSaveAll();
                setShowUnsavedChangesModal(false);
                if (pendingNavigation) {
                  pendingNavigation();
                  setPendingNavigation(null);
                }
              }}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Salvar e sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Select
                value={frequencyLabel}
                onValueChange={setFrequencyLabel}
                disabled={isPending}
              >
                <SelectTrigger id="modalFrequencyLabel" className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="modalMinAge">Idade mínima</Label>
                <Input
                  id="modalMinAge"
                  type="number"
                  min="0"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  placeholder="Ex: 18 (opcional)"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modalMaxAge">Idade máxima</Label>
                <Input
                  id="modalMaxAge"
                  type="number"
                  min="0"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  placeholder="Ex: 65 (opcional)"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalNotes">Observações</Label>
              <Textarea
                id="modalNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre o plano (opcional)"
                disabled={isPending}
                rows={4}
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
                <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-6">
                    <Label>Modelo</Label>
                    <Select
                      value={row.model}
                      onValueChange={(v) => {
                        setPriceRows((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, model: v } : r)),
                        );
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger className="mt-2 h-11 w-full rounded-xl">
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {BILLING_MODELS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <div className="col-span-1 flex items-center justify-center h-9">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePriceRow(idx)}
                      disabled={isPending || priceRows.length <= 1}
                      title="Remover"
                      className="h-11 w-11"
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
                  setMinAge("");
                  setMaxAge("");
                  setNotes("");
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

      {/* ══════ Modal: Editar nome da unidade ══════ */}
      <Dialog open={editUnitModalOpen} onOpenChange={(open) => {
        setEditUnitModalOpen(open);
        if (!open) {
          // Se fechar sem salvar e o nome foi alterado, marca como mudança não salva
          if (editUnitName.trim() && editUnitName.trim() !== selectedUnit?.name) {
            setHasUnsavedChanges(true);
          }
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar unidade</DialogTitle>
            <DialogDescription>
              Altere o nome da unidade
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="editUnitName">Nome da unidade</Label>
            <Input
              id="editUnitName"
              value={editUnitName}
              onChange={(e) => setEditUnitName(e.target.value)}
              placeholder="Ex: Academia Centro"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditUnitName();
              }}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditUnitModalOpen(false);
                // Se o nome foi alterado, marca como mudança não salva
                if (editUnitName.trim() && editUnitName.trim() !== selectedUnit?.name) {
                  setHasUnsavedChanges(true);
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditUnitName}
              disabled={isPending || !editUnitName.trim()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════ Modal: Editar plano ══════ */}
      <Dialog open={editPlanModalOpen} onOpenChange={setEditPlanModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar plano</DialogTitle>
            <DialogDescription>
              Altere os dados do plano
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditPlan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editPlanName">Nome do plano</Label>
              <Input
                id="editPlanName"
                value={editPlanName}
                onChange={(e) => setEditPlanName(e.target.value)}
                placeholder="Ex: Basic"
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editFrequencyLabel">Frequência</Label>
              <Select
                value={editFrequencyLabel}
                onValueChange={setEditFrequencyLabel}
                disabled={isPending}
              >
                <SelectTrigger id="editFrequencyLabel" className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="editMinAge">Idade mínima</Label>
                <Input
                  id="editMinAge"
                  type="number"
                  min="0"
                  value={editMinAge}
                  onChange={(e) => setEditMinAge(e.target.value)}
                  placeholder="Ex: 18 (opcional)"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMaxAge">Idade máxima</Label>
                <Input
                  id="editMaxAge"
                  type="number"
                  min="0"
                  value={editMaxAge}
                  onChange={(e) => setEditMaxAge(e.target.value)}
                  placeholder="Ex: 65 (opcional)"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Observações</Label>
              <Textarea
                id="editNotes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Observações sobre o plano (opcional)"
                disabled={isPending}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Modelos de pagamento</div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEditPriceRow}
                disabled={isPending}
              >
                + Adicionar modelo
              </Button>
            </div>

            <div className="space-y-3">
              {editPriceRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-6">
                    <Label>Modelo</Label>
                    <Select
                      value={row.model}
                      onValueChange={(v) => {
                        setEditPriceRows((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, model: v } : r)),
                        );
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger className="mt-2 h-11 w-full rounded-xl">
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {BILLING_MODELS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5">
                    <Label>Valor (R$)</Label>
                    <Input
                      value={row.price}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditPriceRows((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, price: v } : r)),
                        );
                      }}
                      placeholder="Ex: 99,90"
                      disabled={isPending}
                      className="mt-2"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-9">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEditPriceRow(idx)}
                      disabled={isPending || editPriceRows.length <= 1}
                      title="Remover"
                      className="h-11 w-11"
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
                onClick={() => setEditPlanModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmitEditPlan || isPending}>
                Salvar plano
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════ Modal: Novo parceiro ══════ */}
      <Dialog open={partnerModalOpen} onOpenChange={setPartnerModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Parceiro</DialogTitle>
            <DialogDescription>
              Adicione um novo parceiro para esta unidade
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePartner} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partnerName">Nome do Parceiro</Label>
              <Input
                id="partnerName"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Ex: Wellhub/Gympass, Totalpass"
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerRulesAndNotes">Regras e Observações</Label>
              <Textarea
                id="partnerRulesAndNotes"
                value={partnerRulesAndNotes}
                onChange={(e) => setPartnerRulesAndNotes(e.target.value)}
                placeholder="Descreva as regras e observações sobre este parceiro (opcional)"
                disabled={isPending}
                rows={6}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPartnerModalOpen(false);
                  setPartnerName("");
                  setPartnerRulesAndNotes("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!partnerName.trim() || isPending}>
                Adicionar parceiro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════ Modal: Editar parceiro ══════ */}
      <Dialog open={editPartnerModalOpen} onOpenChange={setEditPartnerModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Parceiro</DialogTitle>
            <DialogDescription>
              Altere os dados do parceiro
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditPartner} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editPartnerName">Nome do Parceiro</Label>
              <Input
                id="editPartnerName"
                value={editPartnerName}
                onChange={(e) => setEditPartnerName(e.target.value)}
                placeholder="Ex: Wellhub/Gympass, Totalpass"
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPartnerRulesAndNotes">Regras e Observações</Label>
              <Textarea
                id="editPartnerRulesAndNotes"
                value={editPartnerRulesAndNotes}
                onChange={(e) => setEditPartnerRulesAndNotes(e.target.value)}
                placeholder="Descreva as regras e observações sobre este parceiro (opcional)"
                disabled={isPending}
                rows={6}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditPartnerModalOpen(false);
                  setEditPartnerId(null);
                  setEditPartnerName("");
                  setEditPartnerRulesAndNotes("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!editPartnerName.trim() || isPending}>
                Salvar parceiro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════ Modal: Excluir parceiro ══════ */}
      <Dialog open={deletePartnerModalOpen} onOpenChange={setDeletePartnerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Parceiro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o parceiro "{partnerToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeletePartnerModalOpen(false);
                setPartnerToDelete(null);
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePartner}
              disabled={isPending}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════ Modal: Excluir unidade ══════ */}
      <Dialog open={deleteUnitModalOpen} onOpenChange={setDeleteUnitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Unidade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a unidade "{unitToDelete?.name}"? Esta ação não pode ser desfeita e todos os planos, horários e dados relacionados serão permanentemente removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteUnitModalOpen(false);
                setUnitToDelete(null);
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUnit}
              disabled={isPending}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
