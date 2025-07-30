import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    const { id } = params;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { judul, nominal, tanggal, jam, catatan, bukti_url, kategori_id } = await request.json();
        if (!judul || !nominal || !tanggal || !jam || !kategori_id) {
            return NextResponse.json({ message: 'Data yang dibutuhkan tidak lengkap, termasuk kategori.' }, { status: 400 });
        }
        const transactionTimestamp = new Date(`${tanggal}T${jam}`);
        if (isNaN(transactionTimestamp.getTime())) {
            return NextResponse.json({ message: 'Format tanggal atau jam tidak valid.' }, { status: 400 });
        }
        const timeOnly = transactionTimestamp.toTimeString().slice(0, 8);
        const now = new Date();
        const userId = session.user.id;
        const client = await pool.connect();
        const queryText = `
            UPDATE "Transaction" 
            SET judul = $1, nominal = $2, tanggal = $3, jam = $4, catatan = $5, bukti_url = $6, updated_at = $7, kategori_id = $8
            WHERE id = $9 AND user_id = $10 -- Memastikan hanya pemilik yang bisa mengedit
            RETURNING *
        `;
        const values = [judul, parseFloat(nominal), transactionTimestamp, timeOnly, catatan, bukti_url, now, kategori_id, id, userId];
        const result = await client.query(queryText, values);
        client.release();
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Transaksi tidak ditemukan atau Anda tidak memiliki hak akses' }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`Failed to update transaction ${id}:`, error);
        const errorMessage = error.message || 'Gagal memperbarui transaksi';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    const { id } = params;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    try {
        const client = await pool.connect();
        const userId = session.user.id;
        const queryText = 'DELETE FROM "Transaction" WHERE id = $1 AND user_id = $2 RETURNING *';
        const result = await client.query(queryText, [id, userId]);
        client.release();
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Transaksi tidak ditemukan atau Anda tidak memiliki hak akses' }, { status: 404 });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Failed to delete transaction ${id}:`, error);
        return NextResponse.json({ message: 'Gagal menghapus transaksi' }, { status: 500 });
    }
}
