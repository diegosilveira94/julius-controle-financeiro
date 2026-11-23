// Mesmas regras do backend (backend/src/config/upload.js).
export const ATTACHMENT_RULES = {
  maxSize: 5 * 1024 * 1024,
  maxFiles: 3,
  types: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  accept: "application/pdf,image/jpeg,image/png,image/webp",
};

const MAX_IMAGE_SIDE = 2000;

export function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

export function fileKind(mimeType) {
  if (mimeType === "application/pdf") return "PDF";
  return (mimeType.split("/")[1] || "").toUpperCase().replace("JPEG", "JPG");
}

export const isPdf = (mimeType) => mimeType === "application/pdf";

async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function prepareFiles(fileList, currentCount) {
  const files = Array.from(fileList);
  const free = ATTACHMENT_RULES.maxFiles - currentCount;

  if (files.length > free) {
    return {
      files: [],
      error:
        free > 0
          ? `Você só pode anexar mais ${free} arquivo${free > 1 ? "s" : ""}. O limite é ${ATTACHMENT_RULES.maxFiles} por lançamento.`
          : `Limite de ${ATTACHMENT_RULES.maxFiles} arquivos atingido. Remova um para anexar outro.`,
    };
  }

  const accepted = [];
  for (const file of files) {
    if (!ATTACHMENT_RULES.types.includes(file.type)) {
      return {
        files: [],
        error: `“${file.name}” não é um formato aceito. Use PDF, JPG, PNG ou WEBP.`,
      };
    }

    let prepared = file;
    if (file.size > ATTACHMENT_RULES.maxSize && file.type.startsWith("image/")) {
      prepared = await compressImage(file);
    }
    if (prepared.size > ATTACHMENT_RULES.maxSize) {
      return {
        files: [],
        error: `“${file.name}” tem ${formatFileSize(file.size)} — o limite é 5 MB.`,
      };
    }
    accepted.push(prepared);
  }

  return { files: accepted, error: "" };
}
