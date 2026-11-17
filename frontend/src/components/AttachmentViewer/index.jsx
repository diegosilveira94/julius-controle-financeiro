import { useEffect, useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Icon from "../Icon";
import Spinner from "../Spinner";
import StatusBadge from "../StatusBadge";
import { attachmentService } from "../../services/attachmentService";
import { useToast } from "../../hooks/useToast";
import { formatCurrency, formatDate } from "../../utils/format";
import { fileKind, formatFileSize, isPdf } from "../../utils/attachments";

const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3];

function formatDateTime(value) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function ToolbarButton({ label, icon, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-11 items-center justify-center rounded-md text-gray-200 transition-colors hover:bg-surface-2 disabled:opacity-40"
    >
      <Icon name={icon} />
    </button>
  );
}

// Abre os comprovantes de uma despesa. onChanged é chamado quando um
// comprovante é excluído, para a listagem atualizar a contagem.
function AttachmentViewer({ expense, onClose, onChanged }) {
  const toast = useToast();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState({ id: null, url: null });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const expenseId = expense.id;
  const current = attachments[index];
  const currentId = current?.id;

  useEffect(() => {
    let active = true;
    attachmentService
      .list(expenseId)
      .then((list) => active && setAttachments(list))
      .catch((err) => active && toast.error(err.message || "Erro ao carregar comprovantes."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [expenseId, toast]);

  useEffect(() => {
    if (!currentId) return;
    let active = true;
    let url = null;
    attachmentService
      .getBlob(currentId)
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setPreview({ id: currentId, url });
      })
      .catch((err) => active && toast.error(err.message || "Erro ao abrir comprovante."));
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [currentId, toast]);

  function goTo(i) {
    setIndex(i);
    setZoom(1);
    setRotation(0);
    setConfirming(false);
  }

  function changeZoom(direction) {
    const pos = ZOOM_STEPS.indexOf(zoom) + direction;
    if (pos >= 0 && pos < ZOOM_STEPS.length) setZoom(ZOOM_STEPS[pos]);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await attachmentService.remove(current.id);
      const remaining = attachments.filter((a) => a.id !== current.id);
      setAttachments(remaining);
      goTo(Math.min(index, Math.max(0, remaining.length - 1)));
      onChanged();
      toast.success("Comprovante excluído.");
      if (remaining.length === 0) onClose();
    } catch (err) {
      toast.error(err.message || "Erro ao excluir comprovante.");
    } finally {
      setDeleting(false);
    }
  }

  const previewUrl = preview.id === currentId ? preview.url : null;
  const showingPdf = current && isPdf(current.mimeType);

  return (
    <Modal
      open
      size="xl"
      title={current?.originalName || "Comprovantes"}
      onClose={onClose}
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : !current ? (
        <p className="py-10 text-center text-sm text-gray-400">
          Esta despesa não tem comprovantes.
        </p>
      ) : (
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="relative flex h-[60vh] min-h-80 flex-1 items-center justify-center overflow-hidden rounded-md bg-background">
            {!previewUrl ? (
              <Spinner />
            ) : showingPdf ? (
              <iframe
                src={previewUrl}
                title={current.originalName}
                className="h-full w-full"
              />
            ) : (
              <img
                src={previewUrl}
                alt={`Comprovante ${current.originalName}`}
                className="max-h-full max-w-full object-contain transition-transform"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              />
            )}

            {attachments.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0}
                  aria-label="Arquivo anterior"
                  className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-gray-200 disabled:opacity-40"
                >
                  <Icon name="chevronLeft" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  disabled={index === attachments.length - 1}
                  aria-label="Próximo arquivo"
                  className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-gray-200 disabled:opacity-40"
                >
                  <Icon name="chevronRight" />
                </button>
              </>
            )}

            {previewUrl && !showingPdf && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-border bg-surface p-1">
                <ToolbarButton
                  label="Diminuir zoom"
                  icon="zoomOut"
                  onClick={() => changeZoom(-1)}
                  disabled={zoom === ZOOM_STEPS[0]}
                />
                <span className="min-w-12 text-center text-sm text-gray-300">
                  {Math.round(zoom * 100)}%
                </span>
                <ToolbarButton
                  label="Aumentar zoom"
                  icon="zoomIn"
                  onClick={() => changeZoom(1)}
                  disabled={zoom === ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                />
                <div className="mx-1 h-6 w-px bg-border" />
                <ToolbarButton
                  label="Girar imagem"
                  icon="rotate"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                />
              </div>
            )}
          </div>

          <aside className="flex w-full flex-col gap-5 md:w-72">
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Lançamento
              </h3>
              <p className="font-semibold text-gray-100">{expense.description}</p>
              <p className="text-sm text-gray-300">
                {formatCurrency(expense.amount)} · {formatDate(expense.date)}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {expense.Category?.name || "Sem categoria"} ·
                <StatusBadge status={expense.status} />
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Arquivo
              </h3>
              <dl className="grid grid-cols-[5rem_1fr] gap-y-1.5 text-sm">
                <dt className="text-gray-400">Tipo</dt>
                <dd className="text-gray-200">{fileKind(current.mimeType)}</dd>
                <dt className="text-gray-400">Tamanho</dt>
                <dd className="text-gray-200">{formatFileSize(current.size)}</dd>
                <dt className="text-gray-400">Enviado</dt>
                <dd className="text-gray-200">{formatDateTime(current.createdAt)}</dd>
              </dl>
            </section>

            {attachments.length > 1 && (
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Todos os arquivos ({attachments.length})
                </h3>
                <div className="flex gap-2.5">
                  {attachments.map((a, i) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={a.originalName}
                      aria-current={i === index ? "true" : undefined}
                      className={`flex h-16 w-14 flex-col items-center justify-center gap-1 rounded-md ${
                        isPdf(a.mimeType)
                          ? "bg-danger text-white"
                          : "bg-surface-2 text-indigo-300"
                      } ${i === index ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""}`}
                    >
                      <Icon name={isPdf(a.mimeType) ? "file" : "image"} size={18} />
                      <span className="text-[10px] font-bold">{fileKind(a.mimeType)}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-auto flex flex-col gap-2">
              <a
                href={previewUrl || undefined}
                download={current.originalName}
                aria-disabled={!previewUrl}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover ${
                  previewUrl ? "" : "pointer-events-none opacity-50"
                }`}
              >
                <Icon name="download" size={16} />
                Baixar
              </a>
              {confirming ? (
                <div className="flex flex-col gap-2 rounded-md border border-border p-3">
                  <p className="text-sm text-gray-300">Excluir este comprovante?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setConfirming(false)}
                      disabled={deleting}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                      loading={deleting}
                      className="flex-1"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-danger text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <Icon name="trash" size={16} />
                  Excluir comprovante
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </Modal>
  );
}

export default AttachmentViewer;
