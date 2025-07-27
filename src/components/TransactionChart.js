'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatYAxis = (tickItem) => {
    if (tickItem >= 1000000) {
        return `${tickItem / 1000000} Jt`;
    }
    if (tickItem >= 1000) {
        return `${tickItem / 1000} Rb`;
    }
    return tickItem;
};

export default function TransactionChart({ data }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Aktivitas 30 Hari Terakhir</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 20,
                        left: 10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tanggal" />
                    <YAxis tickFormatter={formatYAxis} />
                    <Tooltip
                        formatter={(value) => new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(value)}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Pemasukan" stroke="#16a34a" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Pengeluaran" stroke="#dc2626" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

}