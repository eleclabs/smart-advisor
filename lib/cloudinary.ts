import crypto from "crypto";

export type CloudinaryAsset = {
  publicId: string;
  url: string;
  resourceType: "image" | "raw";
  format: string;
  bytes: number;
  originalName: string;
};

type UploadOptions = {
  folder: string;
  kind: "image" | "document";
  profile?: boolean;
};

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const DOCUMENT_EXTENSIONS = new Set(["doc", "docx", "pdf", "xls", "xlsx"]);
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary configuration is incomplete.");
  }

  return { cloudName, apiKey, apiSecret };
}

function extension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function signature(params: Record<string, string>, secret: string) {
  const payload = Object.entries(params)
    .filter(([, value]) => value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${secret}`).digest("hex");
}

export async function uploadToCloudinary(
  file: File | null,
  options: UploadOptions
): Promise<CloudinaryAsset | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`ไฟล์ ${file.name} มีขนาดเกิน 8 MB`);
  }

  const fileExtension = extension(file.name);
  const allowed = options.kind === "image" ? IMAGE_EXTENSIONS : DOCUMENT_EXTENSIONS;
  if (!allowed.has(fileExtension)) {
    throw new Error(
      options.kind === "image"
        ? "รองรับรูปภาพ JPG, PNG, GIF และ WEBP เท่านั้น"
        : "รองรับไฟล์ DOC, DOCX, PDF, XLS และ XLSX เท่านั้น"
    );
  }

  const { cloudName, apiKey, apiSecret } = config();
  const resourceType = options.kind === "image" ? "image" : "raw";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const transformation = options.kind === "image"
    ? options.profile
      ? "c_fill,g_auto,w_600,h_600,q_auto:good,f_webp"
      : "c_limit,w_1600,h_1600,q_auto:good,f_webp"
    : "";
  const signedParams = {
    folder: options.folder,
    timestamp,
    transformation
  };
  const formData = new FormData();
  formData.set("file", file);
  formData.set("api_key", apiKey);
  formData.set("timestamp", timestamp);
  formData.set("folder", options.folder);
  formData.set("signature", signature(signedParams, apiSecret));
  if (transformation) formData.set("transformation", transformation);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  const result = await response.json() as {
    secure_url?: string;
    public_id?: string;
    resource_type?: "image" | "raw";
    format?: string;
    bytes?: number;
    error?: { message?: string };
  };

  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new Error(result.error?.message || "Cloudinary upload failed.");
  }

  return {
    publicId: result.public_id,
    url: result.secure_url,
    resourceType: result.resource_type || resourceType,
    format: result.format || fileExtension,
    bytes: result.bytes || file.size,
    originalName: file.name
  };
}

export async function deleteCloudinaryAsset(
  publicId?: string,
  resourceType: "image" | "raw" = "image"
) {
  if (!publicId) return;

  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signedParams = { public_id: publicId, timestamp };
  const formData = new FormData();
  formData.set("public_id", publicId);
  formData.set("api_key", apiKey);
  formData.set("timestamp", timestamp);
  formData.set("signature", signature(signedParams, apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Unable to delete the Cloudinary asset.");
  }
}

export function fileFromFormData(formData: FormData, name: string) {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}
