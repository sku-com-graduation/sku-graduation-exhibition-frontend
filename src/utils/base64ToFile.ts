const base64ToFile = (base64: string, filename: string, mimeType: string = "image/jpeg") => {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new File([ia], filename, { type: mimeType });
};

export default base64ToFile;
