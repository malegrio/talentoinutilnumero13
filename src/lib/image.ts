export async function prepararImagen(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const MAX = 1920;

      let { width, height } = img;

      if (width > height && width > MAX) {
        height = Math.round(height * (MAX / width));
        width = MAX;
      }

      if (height >= width && height > MAX) {
        width = Math.round(width * (MAX / height));
        height = MAX;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No se pudo crear el canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo convertir la imagen"));
            return;
          }

          const nuevoArchivo = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            {
              type: "image/jpeg",
            }
          );

          resolve(nuevoArchivo);
        },
        "image/jpeg",
        0.82
      );
    };

    img.onerror = reject;

    img.src = URL.createObjectURL(file);
  });
}