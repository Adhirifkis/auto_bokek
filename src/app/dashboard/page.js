import { prisma } from '@/lib/prisma';
import { getAuthSession } from "@/lib/auth";
import Link from 'next/link';
import TransactionChart from '@/components/TransactionChart';

const ArrowUpIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14" /><path d="m18 11-6-6-6 6" />
    </svg>
);

const ArrowDownIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14" /><path d="m18 17-6 6-6-6" />
    </svg>
);

const WalletIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
);

const formatRupiah = (nominal) => {
    const numberAmount = typeof nominal === 'string' ? parseFloat(nominal) : nominal;
    if (isNaN(numberAmount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(numberAmount);
};

const processDataForChart = (transactions) => {
    const grouped = transactions.reduce((acc, trx) => {
        if (!trx.kategori) return acc;
        // Group by a simple date string for display
        const date = new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (!acc[date]) {
            acc[date] = { Pemasukan: 0, Pengeluaran: 0 };
        }
        if (trx.kategori.tipe.toUpperCase() === 'PEMASUKAN') {
            acc[date].Pemasukan += parseFloat(trx.nominal);
        } else {
            acc[date].Pengeluaran += Math.abs(parseFloat(trx.nominal));
        }
        return acc;
    }, {});

    return Object.entries(grouped)
        .map(([dateKey, values]) => {
            const [day, monthStr] = dateKey.split(' ');
            const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].indexOf(monthStr);
            const sortableDate = new Date(new Date().getFullYear(), monthIndex, parseInt(day));
            return {
                tanggal: dateKey,
                ...values,
                sortableDate: sortableDate
            };
        })
        .sort((a, b) => a.sortableDate - b.sortableDate)
        .map(({ sortableDate, ...rest }) => rest);
};

export default async function DashboardPage() {
    const session = await getAuthSession();
    if (!session || !session.user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Akses Ditolak</h2>
                    <p>Silakan login dulu untuk melihat dashboard.</p>
                    <Link href="/api/auth/signin" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-semibold transition-colors">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.Transaction.findMany({
        where: {
            user_id: session.user.id,
            tanggal: { gte: thirtyDaysAgo },
        },
        include: { kategori: true },
        orderBy: { created_at: 'desc' },
    });

    const chartData = processDataForChart(transactions);
    const recentTransactions = transactions.slice(0, 8);
    const { totalPemasukan, totalPengeluaran } = transactions.reduce(
        (acc, trx) => {
            if (trx.kategori && trx.kategori.tipe) {
                const nominal = parseFloat(trx.nominal);
                if (trx.kategori.tipe.toUpperCase() === 'PEMASUKAN') {
                    acc.totalPemasukan += nominal;
                } else {
                    acc.totalPengeluaran += nominal;
                }
            }
            return acc;
        },
        { totalPemasukan: 0, totalPengeluaran: 0 }
    );
    const saldo = totalPemasukan - totalPengeluaran;

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <main className="container mx-auto p-4 md:p-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-lg text-gray-600">Selamat datang kembali, {session.user.name}!</p>
                    </div>
                    <Link href="/transaksi" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-transform transform hover:scale-105">
                        <span>Tambah Transaksi</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-6">
                        <div className="bg-green-100 p-3 rounded-full"><ArrowUpIcon className="w-6 h-6 text-green-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Pemasukan (30 Hari)</p>
                            <p className="text-2xl font-bold text-gray-800">{formatRupiah(totalPemasukan)}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-6">
                        <div className="bg-red-100 p-3 rounded-full"><ArrowDownIcon className="w-6 h-6 text-red-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Pengeluaran (30 Hari)</p>
                            <p className="text-2xl font-bold text-gray-800">{formatRupiah(totalPengeluaran)}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-6">
                        <div className="bg-blue-100 p-3 rounded-full"><WalletIcon className="w-6 h-6 text-blue-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Saldo Akhir (30 Hari)</p>
                            <p className="text-2xl font-bold text-gray-800">{formatRupiah(saldo)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Aktivitas 30 Hari Terakhir</h2>
                        <div style={{ height: '450px' }}>
                            <TransactionChart data={chartData} />
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Transaksi Terakhir</h2>
                        <ul className="space-y-4">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map(trx => (
                                    <li key={trx.id} className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${trx.kategori?.tipe.toUpperCase() === 'PEMASUKAN' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {trx.kategori?.tipe.toUpperCase() === 'PEMASUKAN' ? <ArrowUpIcon className="w-5 h-5 text-green-600" /> : <ArrowDownIcon className="w-5 h-5 text-red-600" />}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium text-gray-800">{trx.judul}</p>
                                            <p className="text-sm text-gray-500">{trx.kategori?.name_kategori || 'N/A'}</p>
                                        </div>
                                        <span className={`font-bold text-right ${trx.kategori?.tipe.toUpperCase() === 'PEMASUKAN' ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatRupiah(Math.abs(trx.nominal))}
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">Belum ada transaksi.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
