"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const formatRupiah = (nominal) => {
  const numberAmount =
    typeof nominal === "string" ? parseFloat(nominal) : nominal;
  if (isNaN(numberAmount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numberAmount);
};

const getDefaultDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const defaultDate = now.toISOString().split("T")[0];
  const defaultTime = now.toISOString().slice(11, 16);
  return { defaultDate, defaultTime };
};

export default function Home() {
  const [transaksi, setTransaksi] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [enrichedTransaksi, setEnrichedTransaksi] = useState([]);
  const { defaultDate, defaultTime } = getDefaultDateTime();
  const initialFormState = {
    judul: "",
    nominal: "",
    tanggal: defaultDate,
    jam: defaultTime,
    catatan: "",
    bukti_url: "",
    kategori_id: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buktiUrl, setBuktiUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [filter, setFilter] = useState("semua");

  const fetchKategori = async () => {
    try {
      const res = await fetch("/api/kategori");
      if (!res.ok) throw new Error("Gagal mengambil kategori");
      const data = await res.json();
      setKategoriList(data);
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  };

  const fetchTransaksi = async () => {
    try {
      const res = await fetch("/api/transaksi");
      if (!res.ok) {
        if (res.status === 401) {
          setTransaksi([]);
          return;
        } else {
          throw new Error(`Gagal fetch transaksi (${res.status})`);
        }
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setTransaksi(data);
    } catch (error) {
      console.error("Fetch transaksi gagal:", error.message);
    }
  };

  useEffect(() => {
    fetchTransaksi();
    fetchKategori();
  }, []);

  useEffect(() => {
    if (transaksi.length > 0 && kategoriList.length > 0) {
      const dataGabungan = transaksi.map((t) => {
        const kategori = kategoriList.find((k) => k.id === t.kategori_id) || {};
        return {
          ...t,
          tipeKategori: (kategori.tipe || "").toLowerCase(),
          namaKategori: kategori.name_kategori || "Tanpa Kategori",
        };
      });
      setEnrichedTransaksi(dataGabungan);
    } else {
      setEnrichedTransaksi([]);
    }
  }, [transaksi, kategoriList]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kategori_id) {
      alert("Silakan pilih kategori terlebih dahulu.");
      return;
    }
    const url = editingId ? `/api/transaksi/${editingId}` : "/api/transaksi";
    const method = editingId ? "PUT" : "POST";
    try {
      const selectedKategori = kategoriList.find(
        (k) => k.id === formData.kategori_id
      );
      const tipeKategori = selectedKategori ? selectedKategori.tipe : "";
      const nominalToSubmit =
        tipeKategori === "PENGELUARAN"
          ? -Math.abs(parseFloat(formData.nominal))
          : Math.abs(parseFloat(formData.nominal));
      const dataToSubmit = {
        ...formData,
        nominal: nominalToSubmit,
        bukti_url: buktiUrl,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Operasi gagal");
      }
      const { defaultDate, defaultTime } = getDefaultDateTime();
      setFormData({
        ...initialFormState,
        tanggal: defaultDate,
        jam: defaultTime,
      });

      setEditingId(null);
      setBuktiUrl("");
      if (fileInputRef.current) fileInputRef.current.value = null;
      await fetchTransaksi();
    } catch (error) {
      console.error("Error saat submit:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEdit = (transaction) => {
    window.scrollTo(0, 0);
    setEditingId(transaction.id);
    const formattedDate = new Date(transaction.tanggal)
      .toISOString()
      .split("T")[0];
    const formattedTime = transaction.jam.slice(0, 5);
    setFormData({
      judul: transaction.judul,
      nominal: Math.abs(parseFloat(transaction.nominal)),
      tanggal: formattedDate,
      jam: formattedTime,
      catatan: transaction.catatan,
      bukti_url: transaction.bukti_url || "",
      kategori_id: transaction.kategori_id,
    });
    setBuktiUrl(transaction.bukti_url || "");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      try {
        const res = await fetch(`/api/transaksi/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Gagal menghapus");
        }
        await fetchTransaksi();
      } catch (error) {
        console.error("Error saat menghapus:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    const { defaultDate, defaultTime } = getDefaultDateTime();
    setFormData({
      ...initialFormState,
      tanggal: defaultDate,
      jam: defaultTime,
    });
    setBuktiUrl("");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (!allowedTypes.includes(file.type)) {
      alert("Error: Hanya file JPG atau PNG yang diizinkan!");
      return;
    }
    if (file.size > maxSizeInBytes) {
      alert("Error: Ukuran file maksimal adalah 2MB!");
      return;
    }
    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Gagal mendapatkan URL upload.");
      const { uploadUrl, publicFileUrl } = await res.json();
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Upload ke R2 gagal.");
      setBuktiUrl(publicFileUrl);
    } catch (error) {
      console.error(error);
      alert("Upload file gagal!");
    } finally {
      setIsUploading(false);
    }
  };
  const filteredTransaksi = enrichedTransaksi.filter((t) => {
    if (filter === "semua") return true;
    return t.tipeKategori === filter;
  });

  return (
    <main className="container mx-auto p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Catatan Keuangan 📝
      </h1>
      <div className="flex justify-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 font-semibold shadow-sm"
        >
          Kembali ke Dashboard
        </Link>
        <Link
          href="/kategori"
          className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 font-semibold shadow-sm"
        >
          Kelola Kategori
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? "Edit Transaksi" : "Tambah Transaksi Baru"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleInputChange}
            placeholder="Judul"
            required
            className="p-3 border rounded-md"
          />
          <input
            type="number"
            name="nominal"
            value={formData.nominal}
            onChange={handleInputChange}
            placeholder="Nominal"
            required
            className="p-3 border rounded-md"
            min="0"
          />
          <input
            type="date"
            name="tanggal"
            value={formData.tanggal}
            onChange={handleInputChange}
            required
            className="p-3 border rounded-md"
          />
          <input
            type="time"
            name="jam"
            value={formData.jam}
            onChange={handleInputChange}
            required
            className="p-3 border rounded-md"
          />
          <div className="md:col-span-2">
            <label
              htmlFor="kategori_id"
              className="block text-sm font-medium text-gray-700"
            >
              Kategori
            </label>
            <select
              id="kategori_id"
              name="kategori_id"
              value={formData.kategori_id}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>
                -- Pilih Kategori --
              </option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name_kategori} ({k.tipe})
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="catatan"
            value={formData.catatan}
            onChange={handleInputChange}
            placeholder="Catatan (opsional)"
            className="p-3 border rounded-md md:col-span-2"
          ></textarea>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            ref={fileInputRef}
            accept="image/png, image/jpeg"
            className="p-3 border rounded-md md:col-span-2"
          />
          {isUploading && <p>Mengupload...</p>}
          {buktiUrl && (
            <p>
              Upload sukses:{" "}
              <a
                href={buktiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Lihat Bukti
              </a>
            </p>
          )}
          <div className="md:col-span-2 flex items-center gap-4 mt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 font-semibold disabled:bg-gray-400"
            >
              {editingId ? "Update Transaksi" : "Simpan Transaksi"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 font-semibold"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Daftar Transaksi</h2>
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setFilter("semua")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === "semua"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("pemasukan")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === "pemasukan"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilter("pengeluaran")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === "pengeluaran"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Pengeluaran
          </button>
        </div>
        {isLoading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left font-semibold text-gray-600">
                    Judul
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600">
                    Kategori
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600">
                    Nominal
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600">
                    Tanggal & Jam
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600">
                    Bukti
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransaksi.length > 0 ? (
                  filteredTransaksi.map((t) => {
                    const isPengeluaran = t.tipeKategori === "pengeluaran";
                    return (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-medium text-gray-800">{t.judul}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {t.catatan}
                          </p>
                        </td>
                        <td
                          className={`p-3 font-bold ${
                            isPengeluaran ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          <p className="text-sm font-semibold ">
                            {t.namaKategori}
                          </p>
                        </td>
                        <td
                          className={`p-3 font-bold ${
                            isPengeluaran ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {formatRupiah(t.nominal)}
                        </td>
                        <td className="p-3 text-sm text-gray-700">
                          {new Date(t.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          <span className="text-gray-500 block">
                            {t.jam.slice(0, 5)}
                          </span>
                        </td>
                        <td className="p-3">
                          {t.bukti_url ? (
                            <a
                              href={t.bukti_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline font-medium"
                            >
                              Lihat
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 flex gap-2 items-center">
                          <button
                            onClick={() => handleEdit(t)}
                            className="bg-yellow-400 text-white px-3 py-1 rounded text-sm hover:bg-yellow-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-gray-500">
                      {filter === "semua"
                        ? "Belum ada transaksi."
                        : `Belum ada transaksi ${filter}.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
