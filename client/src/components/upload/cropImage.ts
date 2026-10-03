export function getCroppedImage(
  cropper: any,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!cropper) {
      reject(new Error("Cropper is not initialized"));
      return;
    }

    const canvas = cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    if (!canvas) {
      reject(new Error("Could not create cropped canvas"));
      return;
    }

    canvas.toBlob(
      (blob: Blob | null) => {
        if (!blob) {
          reject(new Error("Could not create image blob"));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      0.98,
    );
  });
}