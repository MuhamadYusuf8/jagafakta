"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { isValidImageType } from "@/lib/utils";

interface UploadZoneProps {
  onImageSelect: (data: { file: File; base64: string; preview: string } | null) => void;
  uploadedImage: { file: File; base64: string; preview: string } | null;
}

export default function UploadZone({ onImageSelect, uploadedImage }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);

      if (rejectedFiles && (rejectedFiles as Array<unknown>).length > 0) {
        setError("Format file tidak didukung atau ukuran melebihi 5MB.");
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      if (!isValidImageType(file.type)) {
        setError("Format tidak didukung. Gunakan JPEG, PNG, WEBP, atau GIF.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB.");
        return;
      }

      const preview = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        onImageSelect({ file, base64, preview });
      };
      reader.onerror = () => setError("Gagal membaca file gambar.");
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const removeImage = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    onImageSelect(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Preview state
  if (uploadedImage) {
    return (
      <div className="relative rounded-2xl border-2 border-fakta/30 bg-fakta/[0.03] overflow-hidden">
        <div className="relative flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedImage.preview}
            alt="Preview gambar"
            className="max-h-[200px] w-auto object-contain rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-surface-2/90 hover:bg-hoaks/20 
                       text-text-muted hover:text-hoaks transition-all border border-white/10"
            aria-label="Hapus gambar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pb-3 flex items-center gap-2 text-xs text-text-muted">
          <ImageIcon className="w-3.5 h-3.5 text-fakta" />
          <span className="truncate">{uploadedImage.file.name}</span>
          <span className="text-text-muted/50">•</span>
          <span>{formatFileSize(uploadedImage.file.size)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-10 
                    flex flex-col items-center justify-center gap-3 cursor-pointer 
                    transition-all duration-200
                    ${
                      isDragActive
                        ? "border-accent bg-accent/[0.05] scale-[1.01]"
                        : "border-border-subtle bg-surface/50 hover:border-accent/50 hover:bg-surface-2/30"
                    }`}
      >
        <input {...getInputProps()} />
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                      ${isDragActive ? "bg-accent/15 text-accent" : "bg-surface-2 text-text-muted"}`}
        >
          <Upload className="w-6 h-6" />
        </div>
        {isDragActive ? (
          <p className="text-sm text-accent font-medium">Lepas gambar di sini...</p>
        ) : (
          <>
            <p className="text-sm text-text-primary font-medium text-center">
              Drag & drop screenshot di sini
            </p>
            <p className="text-xs text-text-muted text-center">
              atau klik untuk pilih (JPEG, PNG, WEBP — max 5MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-hoaks/[0.06] border border-hoaks/20">
          <AlertCircle className="w-4 h-4 text-hoaks flex-shrink-0" />
          <p className="text-xs text-hoaks">{error}</p>
        </div>
      )}
    </div>
  );
}
