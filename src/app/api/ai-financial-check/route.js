"use server";

import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { getSession } from "@/services/auth";
import prisma from "@/utils/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: session.user.id,
      tanggal: { gte: thirtyDaysAgo },
    },
    include: { kategori: true },
  });

  const { totalPemasukan, totalPengeluaran } = transactions.reduce(
    (acc, trx) => {
      if (trx.kategori?.tipe) {
        const nominal = parseFloat(trx.nominal);
        if (trx.kategori.tipe.toUpperCase() === "PEMASUKAN") {
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
  console.log(saldo);

  const prompt = `
Kamu adalah konsultan keuangan ala Gen Z. 
Tugasmu adalah memberi komentar santai, gaul, dan jujur berdasarkan data berikut:

- Total pemasukan: Rp ${totalPemasukan.toLocaleString("id-ID")}
- Total pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}
- Saldo akhir: Rp ${saldo.toLocaleString("id-ID")}

Berikan feedback keuangan bergaya Gen Z. Masukkan sedikit humor dan kasih saran singkat tapi tajam. Jangan terlalu kaku.

Balas seperti: "Hai Adhi, dari data keuanganmu kayaknya kamu ... [dst]"
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const aiResponse = completion.choices[0].message.content;

  return NextResponse.json({ message: aiResponse });
}
