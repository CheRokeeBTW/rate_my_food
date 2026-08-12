export type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  const rotationRadians = (rotation * Math.PI) / 180;

  const { width, height } = image;

  const boundingBox = getRotatedSize(
    width,
    height,
    rotationRadians,
  );

  canvas.width = boundingBox.width;
  canvas.height = boundingBox.height;

  ctx.translate(
    boundingBox.width / 2,
    boundingBox.height / 2,
  );

  ctx.rotate(rotationRadians);

  ctx.drawImage(
    image,
    -width / 2,
    -height / 2,
  );

  const croppedCanvas = document.createElement('canvas');

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Could not create cropped canvas context');
  }

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not create image blob'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      0.92,
    );
  });
}

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.src = src;
  });
}

function getRotatedSize(
  width: number,
  height: number,
  rotation: number,
) {
  const sin = Math.abs(Math.sin(rotation));
  const cos = Math.abs(Math.cos(rotation));

  return {
    width: Math.round(width * cos + height * sin),
    height: Math.round(width * sin + height * cos),
  };
}