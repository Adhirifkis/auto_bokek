import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM "Kategori" ORDER BY name_kategori ASC');
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return NextResponse.json({ message: 'Gagal mengambil data kategori' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name_kategori, tipe } = await request.json();
        if (!name_kategori || !tipe) {
            return NextResponse.json({ message: 'Nama kategori dan tipe harus diisi' }, { status: 400 });
        }
        const client = await pool.connect();
        const newId = randomUUID();
        const queryText = 'INSERT INTO "Kategori"(id, name_kategori, tipe) VALUES($1, $2, $3) RETURNING *';
        const values = [newId, name_kategori, tipe];
        const result = await client.query(queryText, values);
        client.release();
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Failed to create category:', error);
        return NextResponse.json({ message: 'Gagal membuat kategori baru', error: error.message }, { status: 500 });
    }
}
