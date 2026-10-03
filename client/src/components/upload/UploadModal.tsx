"use client";

import {
    Camera,
    RotateCcw,
    RotateCw,
    Trash2,
    Upload,
    X,
    Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Cropper from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

import {
    uploadToCloudinary,
    CloudinaryUploadResponse,
} from "@/app/services/cloudinary.service";

import { getCroppedImage } from "./cropImage";
import { createPostSubmission } from "@/app/services/posts.service";

type UploadModalProps = {
    onClose: () => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

type CropRatio = {
    label: string;
    value: number;
};

const CROP_RATIOS: CropRatio[] = [
    {
        label: "Free",
        value: NaN,
    },
    {
        label: "1:1",
        value: 1,
    },
    {
        label: "4:3",
        value: 4 / 3,
    },
    {
        label: "16:9",
        value: 16 / 9,
    },
    {
        label: "3:4",
        value: 3 / 4,
    },
];

export default function UploadModal({
    onClose,
}: UploadModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const cropperRef =
        useRef<ReactCropperElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const [isDragging, setIsDragging] =
        useState(false);

    const [cropRatio, setCropRatio] =
        useState<number>(4 / 3);

    /*
     * Zoom represents the user's zoom slider value.
     *
     * 0 = normal/default view
     * 1 = slightly zoomed
     * 2 = more zoomed
     */
    const [zoom, setZoom] = useState(0);

    const [isUploading, setIsUploading] =
        useState(false);

    const [uploadProgress, setUploadProgress] =
        useState(0);

    const [error, setError] =
        useState<string | null>(null);

    const [uploadedImage, setUploadedImage] =
        useState<CloudinaryUploadResponse | null>(null);

    const [title, setTitle] = useState("");

    const [isCreatingPost, setIsCreatingPost] =
        useState(false);

    const [submitted, setSubmitted] =
        useState(false);

    /*
     * Clean up object URLs when component
     * is destroyed or preview changes.
     */
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    /*
     * -------------------------
     * FILE VALIDATION
     * -------------------------
     */

    const validateFile = (selectedFile: File) => {
        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            return "Only JPG, PNG and WEBP images are supported";
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            return "Image must be smaller than 10 MB";
        }

        return null;
    };

    /*
     * -------------------------
     * SELECT IMAGE
     * -------------------------
     */

    const selectFile = (selectedFile: File) => {
        setError(null);

        const validationError =
            validateFile(selectedFile);

        if (validationError) {
            setError(validationError);
            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        const url =
            URL.createObjectURL(selectedFile);

        setFile(selectedFile);
        setPreview(url);

        setCropRatio(4 / 3);

        // Reset zoom whenever a new image is selected
        setZoom(0);

        setUploadedImage(null);
        setSubmitted(false);
        setTitle("");
    };

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const selectedFile =
            event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        selectFile(selectedFile);

        // Allows selecting the same file again
        event.target.value = "";
    };

    /*
     * -------------------------
     * DRAG & DROP
     * -------------------------
     */

    const handleDragOver = (
        event: React.DragEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();

        if (!isUploading && !isCreatingPost) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (
        event: React.DragEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();

        setIsDragging(false);
    };

    const handleDrop = (
        event: React.DragEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();

        setIsDragging(false);

        if (isUploading || isCreatingPost) {
            return;
        }

        const droppedFile =
            event.dataTransfer.files?.[0];

        if (!droppedFile) {
            return;
        }

        selectFile(droppedFile);
    };

    /*
     * -------------------------
     * CROP RATIO
     * -------------------------
     */

    const handleCropRatioChange = (
        ratio: number,
    ) => {
        setCropRatio(ratio);

        const cropper =
            cropperRef.current?.cropper;

        if (!cropper) {
            return;
        }

        /*
         * NaN = free aspect ratio.
         *
         * Otherwise Cropper.js locks
         * the crop box to the selected ratio.
         */
        cropper.setAspectRatio(ratio);
    };

    /*
     * -------------------------
     * ROTATION
     * -------------------------
     */

    const rotateLeft = () => {
        const cropper =
            cropperRef.current?.cropper;

        if (!cropper) {
            return;
        }

        cropper.rotate(-90);
    };

    const rotateRight = () => {
        const cropper =
            cropperRef.current?.cropper;

        if (!cropper) {
            return;
        }

        cropper.rotate(90);
    };

    /*
     * -------------------------
     * ZOOM
     * -------------------------
     */

    const handleZoom = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const newZoom =
            Number(event.target.value);

        const cropper =
            cropperRef.current?.cropper;

        if (!cropper) {
            return;
        }

        /*
         * Instead of zoomTo(), we use zoom().
         *
         * zoom() changes the current zoom level
         * by a relative amount.
         *
         * Example:
         *
         * old zoom = 0.4
         * slider changes from 0.2 -> 0.3
         *
         * difference = 0.1
         *
         * cropper.zoom(0.1)
         *
         * This prevents the image from suddenly
         * jumping to its original 1:1 scale.
         */
        const difference =
            newZoom - zoom;

        cropper.zoom(difference);

        setZoom(newZoom);
    };

    /*
     * -------------------------
     * RESET
     * -------------------------
     */

    const resetEditor = () => {
        const cropper =
            cropperRef.current?.cropper;

        if (!cropper) {
            return;
        }

        cropper.reset();

        setCropRatio(4 / 3);

        cropper.setAspectRatio(4 / 3);

        // Reset slider too
        setZoom(0);
    };

    /*
     * -------------------------
     * REMOVE IMAGE
     * -------------------------
     */

    const removeImage = () => {
        if (isUploading || isCreatingPost) {
            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setFile(null);
        setPreview(null);

        setUploadedImage(null);

        setTitle("");

        setError(null);

        setCropRatio(4 / 3);

        setZoom(0);

        setSubmitted(false);
    };

    /*
     * -------------------------
     * UPLOAD TO CLOUDINARY
     * -------------------------
     */

    const handleUpload = async () => {
        if (!file || !preview) {
            return;
        }

        const cropper =
            cropperRef.current?.cropper;

        if (!cropper) {
            setError("Cropper is not ready");
            return;
        }

        setError(null);

        setIsUploading(true);

        setUploadProgress(0);

        try {
            /*
             * Get the exact area selected
             * by the user.
             */
            const croppedBlob =
                await getCroppedImage(cropper);

            const croppedFile = new File(
                [
                    croppedBlob,
                ],
                `${file.name.replace(
                    /\.[^/.]+$/,
                    "",
                )}.jpg`,
                {
                    type: "image/jpeg",
                },
            );

            const result =
                await uploadToCloudinary(
                    croppedFile,
                    setUploadProgress,
                );

            console.log(
                "Uploaded:",
                result,
            );

            setUploadedImage(result);
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

    /*
     * -------------------------
     * SUBMIT FOR MODERATION
     * -------------------------
     */

    const handleCreatePost = async () => {
        if (!uploadedImage) {
            return;
        }

        if (!title.trim()) {
            setError("Please enter a title");
            return;
        }

        setError(null);

        setIsCreatingPost(true);

        try {
            const submission =
                await createPostSubmission({
                    title: title.trim(),
                    imageUrl:
                        uploadedImage.secure_url,
                    publicId:
                        uploadedImage.public_id,
                });

            console.log(
                "Post submitted for moderation:",
                submission,
            );

            setSubmitted(true);
        } catch (err) {
            console.error(err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    "Failed to submit this post for moderation",
                );
            }
        } finally {
            setIsCreatingPost(false);
        }
    };

    const isBusy =
        isUploading ||
        isCreatingPost;

    /*
     * -------------------------
     * RENDER
     * -------------------------
     */

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="my-auto w-full max-w-2xl rounded-2xl bg-zinc-900 p-6 shadow-2xl">

                {/* HEADER */}

                <div className="mb-5 flex items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {submitted
                                ? "Submission received"
                                : "Upload a photo"}
                        </h2>

                        <p className="text-sm text-zinc-400">
                            {submitted
                                ? "Your food photo is waiting for review."
                                : "Share your food with everyone"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isBusy}
                        className="ml-auto rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* SUCCESS */}

                {submitted && (
                    <div className="py-10 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                            <Check
                                size={32}
                                className="text-green-400"
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-white">
                            Pending moderation
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
                            Your submission was received
                            successfully. It will appear in
                            the feed after a moderator approves it.
                        </p>

                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-6 rounded-full bg-green-500 px-6 py-2 font-medium text-black transition hover:bg-green-400"
                        >
                            Done
                        </button>
                    </div>
                )}

                {/* MAIN CONTENT */}

                {!submitted && (
                    <>
                        {/* SELECT FILE */}

                        {!preview && (
                            <>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() =>
                                        inputRef.current?.click()
                                    }
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
                                                : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
                                        }
                                    `}
                                >
                                    <div className="mb-5 rounded-full bg-zinc-700 p-5">
                                        <Camera
                                            size={42}
                                            className="text-zinc-300"
                                        />
                                    </div>

                                    <p className="text-lg font-medium text-white">
                                        Drop your food photo here
                                    </p>

                                    <p className="mt-2 text-sm text-zinc-400">
                                        or click to browse your computer
                                    </p>

                                    <p className="mt-4 text-xs text-zinc-500">
                                        JPG, PNG or WEBP · Max 10 MB
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

                        {/* CROP EDITOR */}

                        {preview && !uploadedImage && (
                            <>
                                <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-black">
                                    <Cropper
                                        ref={cropperRef}
                                        src={preview}
                                        style={{
                                            height: "100%",
                                            width: "100%",
                                        }}
                                        aspectRatio={cropRatio}
                                        viewMode={1}
                                        guides={true}
                                        dragMode="move"
                                        autoCrop={true}
                                        background={false}
                                        responsive={true}
                                        restore={false}
                                        checkOrientation={true}
                                        zoomOnWheel={false}
                                        zoomOnTouch={true}
                                        cropBoxMovable={true}
                                        cropBoxResizable={true}
                                        toggleDragModeOnDblclick={false}
                                        minCropBoxWidth={50}
                                        minCropBoxHeight={50}
                                    />
                                </div>

                                {/* RATIO SELECTOR */}

                                <div className="mt-5">
                                    <p className="mb-3 text-sm font-medium text-zinc-300">
                                        Crop ratio
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {CROP_RATIOS.map(
                                            (ratio) => {
                                                const isFree =
                                                    Number.isNaN(
                                                        ratio.value,
                                                    );

                                                const isActive =
                                                    isFree
                                                        ? Number.isNaN(
                                                              cropRatio,
                                                          )
                                                        : cropRatio ===
                                                          ratio.value;

                                                return (
                                                    <button
                                                        key={ratio.label}
                                                        type="button"
                                                        onClick={() =>
                                                            handleCropRatioChange(
                                                                ratio.value,
                                                            )
                                                        }
                                                        className={`
                                                            rounded-lg
                                                            px-4
                                                            py-2
                                                            text-sm
                                                            transition
                                                            ${
                                                                isActive
                                                                    ? "bg-green-500 font-medium text-black"
                                                                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                                            }
                                                        `}
                                                    >
                                                        {ratio.label}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                {/* INSTRUCTIONS */}

                                <div className="mt-4 rounded-xl bg-zinc-800/70 p-3">
                                    <p className="text-xs text-zinc-400">
                                        <span className="font-medium text-zinc-300">
                                            Free mode:
                                        </span>{" "}
                                        drag the corners or edges
                                        of the crop box to choose
                                        exactly the area you want.
                                    </p>
                                </div>

                                {/* ZOOM */}

                                <div className="mt-5">
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="text-zinc-400">
                                            Zoom
                                        </span>

                                        <span className="text-zinc-500">
                                            {zoom === 0
                                                ? "Default"
                                                : `${zoom.toFixed(2)}x`}
                                        </span>
                                    </div>

                                    <input
                                        type="range"
                                        min={0}
                                        max={2}
                                        step={0.01}
                                        value={zoom}
                                        onChange={handleZoom}
                                        className="w-full accent-green-500"
                                    />
                                </div>

                                {/* CONTROLS */}

                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={rotateLeft}
                                        className="rounded-lg bg-zinc-800 p-2 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                                        title="Rotate left"
                                    >
                                        <RotateCcw size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={rotateRight}
                                        className="rounded-lg bg-zinc-800 p-2 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                                        title="Rotate right"
                                    >
                                        <RotateCw size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetEditor}
                                        className="ml-auto rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                                    >
                                        Reset
                                    </button>

                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                                    >
                                        <Trash2 size={17} />
                                        Remove
                                    </button>
                                </div>

                                {/* REPLACE */}

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            inputRef.current?.click()
                                        }
                                        className="text-sm text-zinc-400 transition hover:text-white"
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

                        {/* UPLOAD PROGRESS */}

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

                        {/* UPLOADED IMAGE */}

                        {uploadedImage && (
                            <div className="mt-5 space-y-4">
                                <div className="overflow-hidden rounded-xl bg-black">
                                    <img
                                        src={
                                            uploadedImage.secure_url
                                        }
                                        alt="Uploaded food"
                                        className="h-64 w-full object-contain"
                                    />
                                </div>

                                <div className="rounded-xl bg-green-500/10 p-4">
                                    <p className="text-sm font-medium text-green-400">
                                        Image uploaded successfully
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-400">
                                        Add a title and submit it
                                        for moderation.
                                    </p>
                                </div>

                                {/* TITLE */}

                                <div>
                                    <label
                                        htmlFor="post-title"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Title
                                    </label>

                                    <input
                                        id="post-title"
                                        type="text"
                                        value={title}
                                        onChange={(event) => {
                                            setTitle(
                                                event.target.value,
                                            );

                                            setError(null);
                                        }}
                                        placeholder="What food is this?"
                                        maxLength={70}
                                        className={`
                                            w-full
                                            rounded-xl
                                            border
                                            bg-zinc-800
                                            px-4
                                            py-3
                                            text-white
                                            outline-none
                                            transition
                                            ${
                                                error
                                                    ? "border-red-500"
                                                    : "border-zinc-700 focus:border-green-500"
                                            }
                                        `}
                                    />

                                    <div className="mt-1 flex justify-end">
                                        <span className="text-xs text-zinc-500">
                                            {title.length}/70
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ERROR */}

                        {error && (
                            <p className="mt-4 text-sm text-red-400">
                                {error}
                            </p>
                        )}

                        {/* FOOTER */}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isBusy}
                                className="rounded-full px-5 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                            >
                                Cancel
                            </button>

                            {/* UPLOAD */}

                            {!uploadedImage && (
                                <button
                                    type="button"
                                    disabled={
                                        !preview ||
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

                            {/* SUBMIT */}

                            {uploadedImage && (
                                <button
                                    type="button"
                                    disabled={
                                        !title.trim() ||
                                        isCreatingPost
                                    }
                                    onClick={
                                        handleCreatePost
                                    }
                                    className="rounded-full bg-green-500 px-6 py-2 font-medium text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {isCreatingPost
                                        ? "Submitting..."
                                        : "Submit for review"}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}