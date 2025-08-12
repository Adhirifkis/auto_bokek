"use client";

import { useState } from "react";

export default function FinancialCheckButton() {
  const [hasil, setHasil] = useState("");
  const [loading, setLoading] = useState(false);

  const cekKeuangan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-financial-check", {
        method: "POST",
      });
      const data = await res.json();
      setHasil(data.message);
    } catch (err) {
      console.error(err);
      setHasil("Gagal mengambil data");
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={cekKeuangan}
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Memeriksa..." : "Cek Kesehatan Keuangan"}
      </button>
      {hasil && <p className="mt-4 text-gray-700">Hasil: {hasil}</p>}
    </div>
  );
}
