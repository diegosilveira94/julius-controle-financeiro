import { useCallback, useEffect, useRef, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import ExpenseForm from "../../components/ExpenseForm";
import ExpenseFilters from "../../components/ExpenseFilters";
import AttachmentViewer from "../../components/AttachmentViewer";
import Icon from "../../components/Icon";
import Spinner from "../../components/Spinner";
import { expenseService } from "../../services/expenseService";
import { categoryService } from "../../services/categoryService";
import { attachmentService } from "../../services/attachmentService";
import { useToast } from "../../hooks/useToast";
import { formatCurrency, formatDate } from "../../utils/format";
import { ATTACHMENT_RULES, prepareFiles } from "../../utils/attachments";

const EMPTY_FILTERS = {
  categoryId: "",
  status: "",
  hasAttachment: "",
  minAmount: "",
  maxAmount: "",
  startDate: "",
  endDate: "",
};

function Expenses() {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [attachingId, setAttachingId] = useState(null);
  // Marca que algo foi salvo dentro de um modal, para recarregar ao fechar.
  const changedRef = useRef(false);
  const quickInputRef = useRef(null);
  const attachTargetRef = useRef(null);

  const loadExpenses = useCallback(
    async (activeFilters) => {
      setLoading(true);
      try {
        const data = await expenseService.list(activeFilters);
        setExpenses(data || []);
      } catch (err) {
        toast.error(err.message || "Erro ao carregar despesas.");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Carrega categorias uma vez (para o select do formulário e dos filtros).
  useEffect(() => {
    categoryService
      .list()
      .then((data) => setCategories(data || []))
      .catch(() => {});
  }, []);

  // Recarrega despesas quando os filtros mudam (com debounce para evitar flood).
  useEffect(() => {
    const timer = setTimeout(() => loadExpenses(filters), 300);
    return () => clearTimeout(timer);
  }, [filters, loadExpenses]);

  function reloadIfChanged() {
    if (!changedRef.current) return;
    changedRef.current = false;
    loadExpenses(filters);
  }

  function openCreate() {
    if (categories.length === 0) {
      toast.info("Crie uma categoria antes de adicionar despesas.");
      return;
    }
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(expense) {
    setEditing(expense);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    reloadIfChanged();
  }

  async function handleSubmit(values, id) {
    try {
      const saved = id
        ? await expenseService.update(id, values)
        : await expenseService.create(values);
      changedRef.current = true;
      return saved;
    } catch (err) {
      toast.error(err.message || "Erro ao salvar despesa.");
      return null;
    }
  }

  function handleSaved() {
    toast.success(editing ? "Despesa atualizada." : "Despesa criada.");
    setModalOpen(false);
    setEditing(null);
    reloadIfChanged();
  }

  function closeViewer() {
    setViewing(null);
    reloadIfChanged();
  }

  function openQuickAttach(expense) {
    attachTargetRef.current = expense;
    quickInputRef.current?.click();
  }

  async function handleQuickAttach(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    const expense = attachTargetRef.current;
    if (!expense || picked.length === 0) return;

    setAttachingId(expense.id);
    try {
      const { files, error } = await prepareFiles(picked, expense.attachmentsCount || 0);
      if (error) {
        toast.error(error);
        return;
      }
      for (const file of files) {
        await attachmentService.upload(expense.id, file);
      }
      toast.success(files.length > 1 ? "Comprovantes anexados." : "Comprovante anexado.");
      loadExpenses(filters);
    } catch (err) {
      toast.error(err.message || "Erro ao enviar comprovante.");
      loadExpenses(filters);
    } finally {
      setAttachingId(null);
    }
  }

  async function handleDelete() {
    setRemoving(true);
    try {
      await expenseService.remove(deleting.id);
      toast.success("Despesa excluída.");
      setDeleting(null);
      loadExpenses(filters);
    } catch (err) {
      toast.error(err.message || "Erro ao excluir despesa.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Despesas"
        subtitle="Gerencie suas despesas"
        action={<Button onClick={openCreate}>Nova despesa</Button>}
      />

      <ExpenseFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      {loading ? (
        <Loading label="Carregando despesas..." />
      ) : expenses.length === 0 ? (
        <EmptyState
          title="Nenhuma despesa encontrada"
          message="Ajuste os filtros ou cadastre uma nova despesa."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Comprovante</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map((exp) => {
                const count = exp.attachmentsCount || 0;
                return (
                  <tr key={exp.id} className="bg-surface/40 hover:bg-surface">
                    <td className="px-4 py-3 text-gray-100">
                      {exp.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {exp.Category?.name || "Sem categoria"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-100">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={exp.status} />
                    </td>
                    <td className="px-4 py-3">
                      {attachingId === exp.id ? (
                        <span className="inline-flex items-center gap-2 text-xs text-gray-400">
                          <Spinner size={14} /> Enviando…
                        </span>
                      ) : count > 0 ? (
                        <button
                          type="button"
                          onClick={() => setViewing(exp)}
                          aria-label={`Ver ${count} ${count > 1 ? "comprovantes" : "comprovante"} de ${exp.description}`}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 text-xs text-gray-200 transition-colors hover:border-primary"
                        >
                          <Icon name="paperclip" size={15} />
                          {count}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openQuickAttach(exp)}
                          aria-label={`Anexar comprovante a ${exp.description}`}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-dashed border-gray-600 px-2.5 text-xs text-indigo-300 transition-colors hover:border-primary"
                        >
                          <Icon name="plus" size={14} strokeWidth={2.2} />
                          Anexar
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => openEdit(exp)}
                          className="px-3 py-1 text-xs"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setDeleting(exp)}
                          className="px-3 py-1 text-xs"
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <input
        ref={quickInputRef}
        type="file"
        accept={ATTACHMENT_RULES.accept}
        multiple
        onChange={handleQuickAttach}
        className="hidden"
      />

      <Modal
        open={modalOpen}
        title={editing ? "Editar despesa" : "Nova despesa"}
        onClose={closeModal}
      >
        <ExpenseForm
          key={editing?.id || "new"}
          initialValues={editing}
          categories={categories}
          onSubmit={handleSubmit}
          onSaved={handleSaved}
          onCancel={closeModal}
          onBusyChange={setSaving}
        />
      </Modal>

      {viewing && (
        <AttachmentViewer
          expense={viewing}
          onClose={closeViewer}
          onChanged={() => (changedRef.current = true)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir despesa"
        message={`Deseja excluir a despesa "${deleting?.description}"?${
          deleting?.attachmentsCount ? " Os comprovantes anexados também serão excluídos." : ""
        }`}
        confirmLabel="Excluir"
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => !removing && setDeleting(null)}
      />
    </div>
  );
}

export default Expenses;
