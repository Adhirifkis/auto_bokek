import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { randomUUID } from "crypto";
import { getSession } from "@/services/auth";

export async function GET() {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const client = await pool.connect();
    const queryText =
      'SELECT * FROM "Transaction" WHERE user_id = $1 ORDER BY tanggal DESC, jam DESC';
    const result = await client.query(queryText, [session.user.id]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { judul, nominal, tanggal, jam, catatan, bukti_url, kategori_id } =
      await request.json();
    if (!judul || !nominal || !tanggal || !jam || !kategori_id) {
      return NextResponse.json(
        { message: "Semua field wajib diisi, termasuk kategori." },
        { status: 400 }
      );
    }
    const transactionTimestamp = new Date(`${tanggal}T${jam}`);
    if (isNaN(transactionTimestamp.getTime())) {
      return NextResponse.json(
        { message: "Format tanggal atau jam tidak valid." },
        { status: 400 }
      );
    }
    const timeFull = transactionTimestamp
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    const client = await pool.connect();
    const now = new Date();
    const userIdFromSession = session.user.id;
    const newId = randomUUID();
    const queryText =
      'INSERT INTO "Transaction"(id, judul, nominal, tanggal, jam, catatan, bukti_url, created_at, updated_at, user_id, kategori_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';
    const values = [
      newId,
      judul,
      parseFloat(nominal),
      transactionTimestamp,
      timeFull,
      catatan,
      bukti_url,
      now,
      now,
      userIdFromSession,
      kategori_id,
    ];
    const result = await client.query(queryText, values);
    client.release();
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    const errorMessage = error.message || "Gagal membuat transaksi baru";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
