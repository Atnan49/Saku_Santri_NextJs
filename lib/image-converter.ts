/**
 * Utility untuk mengompres dan mengonversi berkas gambar ke format WebP di sisi browser (Client-side)
 * Mengubah foto resolusi tinggi (misal 5MB-10MB dari kamera HP) menjadi file .webp ultra-ringan (~100KB-300KB).
 */
export async function convertImageToWebP(
  file: File,
  maxDimension = 1920,
  quality = 0.82
): Promise<File> {
  // Jika file adalah PDF, jangan diubah
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return file;
  }

  // Jika bukan gambar, kembalikan berkas asli
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize proporsional jika melebihi maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const webpFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], webpFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
