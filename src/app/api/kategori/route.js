import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM "Kategori" ORDER BY name_kategori ASC'
    );
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data kategori" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name_kategori, tipe } = body;

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO "Kategori" (id, name_kategori, tipe)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [randomUUID(), name_kategori, tipe]
    );
    client.release();

    return NextResponse.json(name_kategori);
  } catch (error) {
    console.error("Gagal tambah kategori:", error);
    return NextResponse.json(
      { error: "Gagal tambah kategori" },
      { status: 500 }
    );
  }
}
