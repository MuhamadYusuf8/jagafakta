import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-blue-500 opacity-20 mb-2 font-jakarta">
          404
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-jakarta">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          Halaman yang kamu cari tidak ada. Mungkin link sudah kadaluarsa atau
          salah ketik.
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl
                     transition-colors text-sm font-medium inline-block"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}