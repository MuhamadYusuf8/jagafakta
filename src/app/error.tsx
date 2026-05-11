"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2 font-jakarta">
          Terjadi Kesalahan
        </h2>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          Maaf, ada masalah teknis. Tim kami sedang menanganinya.
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl
                     transition-colors text-sm font-medium"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}