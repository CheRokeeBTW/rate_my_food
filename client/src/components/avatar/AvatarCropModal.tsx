"use client";

import { useEffect, useRef, useState } from "react";
import Cropper from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
import { Camera, X, Check } from "lucide-react";
import { updateAvatar } from "@/app/services/user.service";
import { uploadToCloudinary } from "@/app/services/cloudinary.service";
import "cropperjs/dist/cropper.css";

type AvatarCropModalProps = {
  file: File;
  onClose: () => void;
  onUploaded: (url: string) => void;
};

export default function AvatarCropModal({
  file,
  onClose,
  onUploaded,
}: AvatarCropModalProps) {
  const cropperRef = useRef<ReactCropperElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSave = async () => {
    const cropper = cropperRef.current?.cropper;

    if (!cropper) {
      setError("The image editor is not ready.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        cropper.getCroppedCanvas({
          width: 512,
          height: 512,
          imageSmoothingQuality: "high",
        }).toBlob((result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error("Could not crop the image."));
          }
        }, "image/jpeg", 0.98);
      });

      const croppedFile = new File(
        [blob],
        "avatar.jpg",
        { type: "image/jpeg" },
      );

      const result = await uploadToCloudinary(
        croppedFile,
        setProgress,
      );

      await updateAvatar(result.secure_url, result.public_id);

      onUploaded(result.secure_url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Avatar upload failed",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isUploading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-modal-title"
        className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1b17] p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 id="avatar-modal-title" className="text-xl font-semibold">
              Change profile photo
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Adjust the crop to frame your avatar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close avatar editor"
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {preview && (
          <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl bg-black">
            <Cropper
            ref={cropperRef}
            src={preview}
            style={{
                height: "100%",
                width: "100%",
            }}
            aspectRatio={1}
            viewMode={1}
            guides={true}
            dragMode="crop"
            autoCrop={true}
            background={false}
            responsive={true}
            restore={false}
            checkOrientation={true}
            zoomOnWheel={false}
            zoomOnTouch={false}
            cropBoxMovable={true}
            cropBoxResizable={true}
            toggleDragModeOnDblclick={false}
            minCropBoxWidth={50}
            minCropBoxHeight={50}
            />
          </div>
        )}

        <p className="mt-3 text-center text-xs text-white/45">
          Drag the image to reposition it. Use your mouse wheel or touch
          gestures to zoom.
        </p>

        {isUploading && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm text-white/60">
              <span>Uploading avatar...</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#ff6542] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-full px-5 py-2 text-sm text-white/65 transition hover:bg-white/10 disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!preview || isUploading}
            className="flex items-center gap-2 rounded-full bg-[#ff6542] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#ff795c] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <Check size={16} />
                Save avatar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}