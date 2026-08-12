"use client";

import {
  Camera,
  RotateCcw,
  RotateCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import Cropper, {
  Area,
  Point,
} from "react-easy-crop";

import {
  uploadToCloudinary,
  CloudinaryUploadResponse,
} from "@/app/services/cloudinary.service";

import { getCroppedImage } from "./cropImage";

type UploadModalProps = {
  onClose: () => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function UploadModal({
  onClose,
}: UploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const [crop, setCrop] = useState<Point>({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [rotation, setRotation] = useState(0);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [uploadedImage, setUploadedImage] =
    useState<CloudinaryUploadResponse | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const validateFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPG, PNG and WEBP images are supported";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Image must be smaller than 10 MB";
    }

    return null;
  };

  const selectFile = (file: File) => {
    setError(null);

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const url = URL.createObjectURL(file);

    setFile(file);
    setPreview(url);

    // reset editor
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setUploadedImage(null);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    selectFile(selectedFile);

    // Allows selecting the same file again
    e.target.value = "";
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    setIsDragging(false);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    setIsDragging(false);

    if (isUploading) return;

    const droppedFile = e.dataTransfer.files?.[0];

    if (!droppedFile) return;

    selectFile(droppedFile);
  };

  const handleCropComplete = useCallback(
    (
      _croppedArea: Area,
      croppedAreaPixels: Area,
    ) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const removeImage = () => {
    if (isUploading) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview(null);

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setUploadedImage(null);

    setError(null);
  };

  const rotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const rotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const resetEditor = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleUpload = async () => {
    if (!file || !preview || !croppedAreaPixels) {
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const croppedBlob = await getCroppedImage(
        preview,
        croppedAreaPixels,
        rotation,
      );

      const croppedFile = new File(
        [croppedBlob],
        file.name.replace(/\.[^/.]+$/, "") + ".jpg",
        {
          type: "image/jpeg",
        },
      );

      const result = await uploadToCloudinary(
        croppedFile,
        setUploadProgress,
      );

      console.log("Uploaded:", result);

      setUploadedImage(result);

      /*
       * IMPORTANT:
       *
       * At this point Cloudinary has the image.
       *
       * Next step is:
       *
       * POST /posts
       *
       * with:
       *
       * result.secure_url
       * result.public_id
       * result.width
       * result.height
       *
       */

    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload failed");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 p-6 shadow-2xl">

        <div className="mb-5 flex items-center">
          <div>
            <h2 className="text-xl font-semibold">
              Upload a photo
            </h2>

            <p className="text-sm text-zinc-400">
              Share your food with everyone
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="ml-auto rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40"
          >
            <X size={22} />
          </button>
        </div>

        {/* -------------------------------- */}
        {/* No image selected */}
        {/* -------------------------------- */}

        {!preview && (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                flex
                h-96
                w-full
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                transition
                ${
                  isDragging
                    ? "border-green-400 bg-green-400/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-500 hover:bg-zinc-800/80"
                }
              `}
            >
              <div className="mb-5 rounded-full bg-zinc-700 p-5">
                <Camera
                  size={42}
                  className="text-zinc-300"
                />
              </div>

              <p className="text-lg font-medium">
                Drop your food photo here
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                or click to browse your computer
              </p>

              <p className="mt-4 text-xs text-zinc-500">
                JPG, PNG or WEBP • Max 10 MB
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}

        {preview && !uploadedImage && (
          <>
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-black">

              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                showGrid={true}
              />

            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-zinc-400">
                  Zoom
                </span>

                <span className="text-zinc-500">
                  {zoom.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) =>
                  setZoom(Number(e.target.value))
                }
                className="w-full"
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={rotateLeft}
                className="rounded-lg bg-zinc-800 p-2 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
              >
                <RotateCcw size={18} />
              </button>

              <button
                type="button"
                onClick={rotateRight}
                className="rounded-lg bg-zinc-800 p-2 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
              >
                <RotateCw size={18} />
              </button>

              <button
                type="button"
                onClick={resetEditor}
                className="ml-auto rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={removeImage}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 size={17} />
                Remove
              </button>

            </div>

            <div className="mt-3">

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-sm text-zinc-400 hover:text-white"
              >
                Replace image
              </button>

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

            </div>
          </>
        )}

        {isUploading && (
          <div className="mt-5">

            <div className="mb-2 flex justify-between text-sm">
              <span className="text-zinc-300">
                Uploading...
              </span>

              <span className="text-zinc-400">
                {uploadProgress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${uploadProgress}%`,
                }}
              />
            </div>

          </div>
        )}

        {uploadedImage && (
          <div className="mt-5 rounded-xl bg-green-500/10 p-4">

            <p className="text-sm font-medium text-green-400">
              Image uploaded successfully
            </p>

            <p className="mt-1 break-all text-xs text-zinc-500">
              {uploadedImage.public_id}
            </p>

          </div>
        )}

        {/* Error */}

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-full px-5 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40"
          >
            Cancel
          </button>

          {!uploadedImage && (
            <button
              type="button"
              disabled={
                !preview ||
                !croppedAreaPixels ||
                isUploading
              }
              onClick={handleUpload}
              className="flex items-center gap-2 rounded-full bg-green-500 px-6 py-2 font-medium text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Upload size={17} />

              {isUploading
                ? "Uploading..."
                : "Upload"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}