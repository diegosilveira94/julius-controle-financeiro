import { useRef, useState } from "react";
import Icon from "../Icon";
import Spinner from "../Spinner";
import {
  ATTACHMENT_RULES,
  fileKind,
  formatFileSize,
  isPdf,
} from "../../utils/attachments";

function FileThumb({ mimeType }) {
  if (isPdf(mimeType)) {
    return (
      <div className="flex h-13 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded bg-danger text-white">
        <Icon name="file" size={18} />
        <span className="text-[10px] font-bold">PDF</span>
      </div>
    );
  }
  return (
    <div className="flex h-13 w-11 shrink-0 items-center justify-center rounded bg-primary/15 text-indigo-300">
      <Icon name="image" size={20} />
    </div>
  );
}

function ItemStatus({ item }) {
  const meta = `${fileKind(item.mimeType)} · ${formatFileSize(item.size)}`;

  if (item.status === "uploading") {
    return (
      <>
        <div
          role="progressbar"
          aria-label={`Enviando ${item.name}`}
          aria-valuenow={item.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1 overflow-hidden rounded-full bg-border"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">
          Enviando… {item.progress}%
        </span>
      </>
    );
  }

  if (item.status === "error") {
    return (
      <span className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
        {meta} ·
        <span role="alert" className="rounded bg-danger px-1.5 py-0.5 text-white">
          Não foi possível enviar
        </span>
      </span>
    );
  }

  if (item.status === "queued") {
    return (
      <span className="text-xs text-gray-400">{meta} · Será enviado ao salvar</span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      {meta} ·
      <span className="inline-flex items-center gap-1 text-secondary">
        <Icon name="check" size={13} strokeWidth={2.5} />
        Enviado
      </span>
    </span>
  );
}

function AttachmentField({
  items,
  onAdd,
  onRemove,
  onPreview,
  error,
  loading = false,
  disabled = false,
}) {
  const fileInput = useRef(null);
  const cameraInput = useRef(null);
  const [dragging, setDragging] = useState(false);
  const full = items.length >= ATTACHMENT_RULES.maxFiles;
  const blocked = disabled || full;

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length) onAdd(files);
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!blocked) setDragging(true);
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (!blocked && e.dataTransfer.files?.length) onAdd(e.dataTransfer.files);
  }

  let zoneClass = "border-dashed border-gray-600 bg-surface-2/60";
  if (error) zoneClass = "border-dashed border-danger bg-danger/10";
  else if (dragging) zoneClass = "border-solid border-primary bg-primary/10";
  else if (full) zoneClass = "border-dashed border-border bg-surface/60";

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-gray-300">
          Comprovante <span className="text-gray-400">(opcional)</span>
        </span>
        <span className="text-xs text-gray-400">
          {items.length} de {ATTACHMENT_RULES.maxFiles} arquivos
        </span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center gap-2.5 rounded-lg border-2 px-4 py-5 text-center transition-colors ${zoneClass}`}
      >
        {dragging ? (
          <>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
              <Icon name="download" size={20} />
            </div>
            <p className="text-sm font-semibold text-indigo-200">Solte para anexar</p>
          </>
        ) : full ? (
          <>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-gray-400">
              <Icon name="paperclip" size={20} />
            </div>
            <p className="text-sm text-gray-300">
              Limite de {ATTACHMENT_RULES.maxFiles} arquivos atingido
            </p>
            <p className="text-xs text-gray-400">Remova um arquivo para anexar outro.</p>
          </>
        ) : (
          <>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full ${
                error ? "bg-danger text-white" : "bg-primary/15 text-indigo-300"
              }`}
            >
              <Icon name="upload" size={20} />
            </div>
            <p className="hidden text-sm text-gray-100 sm:block">
              Arraste o cupom fiscal aqui ou
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => cameraInput.current?.click()}
                disabled={blocked}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-primary bg-primary/15 px-4 text-sm font-medium text-indigo-200 disabled:opacity-50 sm:hidden"
              >
                <Icon name="camera" size={16} />
                Tirar foto
              </button>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={blocked}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-gray-200 transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                <Icon name="paperclip" size={16} />
                Selecionar arquivo
              </button>
            </div>
            <p className="text-xs text-gray-400">
              PDF, JPG, PNG ou WEBP · até 5 MB por arquivo · máx.{" "}
              {ATTACHMENT_RULES.maxFiles} arquivos
            </p>
          </>
        )}
        <input
          ref={fileInput}
          type="file"
          accept={ATTACHMENT_RULES.accept}
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFiles}
          className="hidden"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-danger px-3 py-2 text-sm text-white">
          {error}
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Spinner size={14} /> Carregando comprovantes…
        </div>
      )}

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 py-2 pr-1.5 pl-2"
            >
              <FileThumb mimeType={item.mimeType} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-sm text-gray-100">{item.name}</span>
                <ItemStatus item={item} />
              </div>
              <button
                type="button"
                onClick={() => onPreview(item)}
                disabled={item.status === "uploading"}
                aria-label={`Visualizar ${item.name}`}
                className="flex h-11 w-11 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-surface disabled:opacity-50"
              >
                <Icon name="eye" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(item)}
                disabled={disabled || item.status === "uploading"}
                aria-label={`Remover ${item.name}`}
                className="flex h-11 w-11 items-center justify-center rounded-md bg-danger text-white transition hover:brightness-110 disabled:opacity-50"
              >
                <Icon name="trash" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AttachmentField;
