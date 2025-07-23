'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KategoriPage() {
    const [kategoriList, setKategoriList] = useState([]);
    const [formData, setFormData] = useState({ name_kategori: '', tipe: 'Pemasukan' });
    const [isLoading, setIsLoading] = useState(true);

    const fetchKategori = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/kategori');
            if (!res.ok) throw new Error('Gagal mengambil data');
            const data = await res.json();
            setKategoriList(data);
        } catch (error) {
            console.error("Gagal mengambil kategori:", error);
            alert('Gagal memuat data kategori.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKategori();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name_kategori.trim()) {
            alert('Nama kategori tidak boleh kosong.');
            return;
        }

        try {
            const res = await fetch('/api/kategori', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Gagal menyimpan kategori');
            }

            setFormData({ name_kategori: '', tipe: 'Pemasukan' });
            await fetchKategori();
        } catch (error) {
            console.error("Error saat menyimpan:", error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <main className="container mx-auto p-4 md:p-8 font-sans">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Kelola Kategori</h1>

            <div className="text-center mb-8">
                <Link href="/transaksi" className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 font-semibold shadow-sm">
                    Kembali ke Halaman Transaksi
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-lg mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Tambah Kategori Baru</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name_kategori" className="block text-sm font-medium text-gray-700">Nama Kategori</label>
                        <input
                            type="text"
                            id="name_kategori"
                            name="name_kategori"
                            value={formData.name_kategori}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="tipe" className="block text-sm font-medium text-gray-700">Tipe</label>
                        <select
                            id="tipe"
                            name="tipe"
                            value={formData.tipe}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Pemasukan">Pemasukan</option>
                            <option value="Pengeluaran">Pengeluaran</option>
                            A</select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 font-semibold">
                        Simpan Kategori
                    </button>
                </form>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Daftar Kategori</h2>
                {isLoading ? (
                    <p className="text-center text-gray-500">Memuat data...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-gray-600">Nama Kategori</th>
                                    <th className="p-3 text-left font-semibold text-gray-600">Tipe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kategoriList.length > 0 ? (
                                    kategoriList.map(k => (
                                        <tr key={k.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{k.name_kategori}</td>
                                            <td className="p-3">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${k.tipe === 'Pemasukan' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {k.tipe}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="text-center p-4 text-gray-500">Belum ada kategori.</td>
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