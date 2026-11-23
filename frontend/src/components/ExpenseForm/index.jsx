import { useEffect, useRef, useState } from "react";
import Input from "../Input";
import Select from "../Select";
import Button from "../Button";
import AttachmentField from "../AttachmentField";
import { validateExpense } from "../../utils/validators";
import { todayISO } from "../../utils/format";
import { prepareFiles } from "../../utils/attachments";
import { attachmentService } from "../../services/attachmentService";
import { useToast } from "../../hooks/useToast";

let nextKey = 0;

const savedItem = (attachment) => ({
  key: attachment.id,
  name: attachment.originalName,
  mimeType: attachment.mimeType,
  size: attachment.size,
  status: "saved",
  attachment,
});

const queuedItem = (file) => ({
  key: `new-${nextKey++}`,
  name: file.name,
  mimeType: file.type,
  size: file.size,
  status: "queued",
  progress: 0,
  file,
});

// onSubmit(values, expenseId) salva a despesa e devolve o registro salvo
// (ou null em caso de erro). Depois disso o formulário envia/remove os
// comprovantes e, se tudo der certo, chama onSaved().
function ExpenseForm({
  initialValues,
  categories = [],
  onSubmit,
  onSaved,
  onCancel,
  onBusyChange,
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    description: initialValues?.description || "",
    amount: initialValues?.amount ?? "",
    date: initialValues?.date ? String(initialValues.date).slice(0, 10) : todayISO(),
    status: initialValues?.status || "PENDENTE",
    categoryId: initialValues?.categoryId || initialValues?.Category?.id || "",
  });
  const [errors, setErrors] = useState({});
  const [items, setItems] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [loadingAttachments, setLoadingAttachments] = useState(
    Boolean(initialValues?.id && initialValues?.attachmentsCount)
  );
  const [submitting, setSubmitting] = useState(false);

  const expenseIdRef = useRef(initialValues?.id || null);

  const expenseId = initialValues?.id;
  const hasAttachments = Boolean(initialValues?.attachmentsCount);

  useEffect(() => {
    if (!expenseId || !hasAttachments) return;
    let active = true;
    attachmentService
      .list(expenseId)
      .then((list) => active && setItems(list.map(savedItem)))
      .catch(() => active && setAttachmentError("Não foi possível carregar os comprovantes."))
      .finally(() => active && setLoadingAttachments(false));
    return () => {
      active = false;
    };
  }, [expenseId, hasAttachments]);

  useEffect(() => {
    onBusyChange?.(submitting);
  }, [submitting, onBusyChange]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function updateItem(key, changes) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...changes } : it)));
  }

  async function handleAdd(fileList) {
    setAttachmentError("");
    const { files, error } = await prepareFiles(fileList, items.length);
    if (error) {
      setAttachmentError(error);
      return;
    }
    setItems((prev) => [...prev, ...files.map(queuedItem)]);
  }

  function handleRemove(item) {
    setAttachmentError("");
    if (item.status === "saved") {
      setRemovedIds((prev) => [...prev, item.attachment.id]);
    }
    setItems((prev) => prev.filter((it) => it.key !== item.key));
  }

  async function handlePreview(item) {
    const win = window.open("", "_blank");
    try {
      const blob = item.file || (await attachmentService.getBlob(item.attachment.id));
      const url = URL.createObjectURL(blob);
      if (win) win.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      win?.close();
      toast.error(err.message || "Não foi possível abrir o comprovante.");
    }
  }

  async function syncAttachments(id) {
    let ok = true;

    for (const removedId of removedIds) {
      try {
        await attachmentService.remove(removedId);
        setRemovedIds((prev) => prev.filter((x) => x !== removedId));
      } catch {
        ok = false;
      }
    }

    for (const item of items) {
      if (item.status !== "queued" && item.status !== "error") continue;
      updateItem(item.key, { status: "uploading", progress: 0 });
      try {
        const attachment = await attachmentService.upload(id, item.file, (progress) =>
          updateItem(item.key, { progress })
        );
        updateItem(item.key, { ...savedItem(attachment), key: item.key });
      } catch {
        ok = false;
        updateItem(item.key, { status: "error" });
      }
    }

    return ok;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateExpense(form);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);
    setAttachmentError("");
    try {
      const saved = await onSubmit(
        { ...form, amount: Number(form.amount) },
        expenseIdRef.current
      );
      if (!saved) return;
      expenseIdRef.current = saved.id;

      if (await syncAttachments(saved.id)) {
        onSaved();
      } else {
        setAttachmentError(
          "A despesa foi salva, mas algum comprovante não foi enviado ou removido. Clique em Salvar para tentar de novo."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Descrição"
        id="description"
        name="description"
        value={form.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Ex.: Mercado"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Valor (R$)"
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="0,00"
        />
        <Input
          label="Data"
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          error={errors.date}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Categoria"
          id="categoryId"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          error={errors.categoryId}
        >
          <option value="">Selecione...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="PENDENTE">Pendente</option>
          <option value="PAGA">Paga</option>
        </Select>
      </div>

      <div className="my-1 h-px bg-border" />

      <AttachmentField
        items={items}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onPreview={handlePreview}
        error={attachmentError}
        loading={loadingAttachments}
        disabled={submitting}
      />

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}

export default ExpenseForm;
