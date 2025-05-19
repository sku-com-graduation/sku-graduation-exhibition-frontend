export const base64ToFile = (base64: string, filename: string, mimeType: string = "image/jpeg") => {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new File([ia], filename, { type: mimeType });
};

export const urlToFile = async (url: string, filename: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

export const extractFilenameFromUrl = (url: string, fallback: string = "profile.jpg") => {
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    if (!filename.includes(".")) return fallback;
    return filename;
  } catch {
    return fallback;
  }
};

export const mimeToExt = (mime: string): string => {
  const map: Record<string, string> = {
    "video/x-matroska": "mkv",
    "video/mp4": "mp4",
    "video/x-msvideo": "avi",
    "image/jpeg": "jpg",
    "image/png": "png",
  };
  return map[mime] || "unsupported";
};
