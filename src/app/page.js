"use client";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="text-center py-20 px-6 bg-gradient-to-b from-blue-300 to-blue-900">
        <h1 className="text-5xl font-bold mb-4 tracking-tight text-white">
          Auto Bokek
        </h1>
        <p className="text-lg max-w-xl mx-auto text-white/90">
          Aplikasi pengingat tagihan & pencatatan keuangan cerdas untuk Anak
          kos. Anti bokek, anti panik!
        </p>
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Button className="transition-transform hover:scale-105">
            <a href="/dashboard">Coba sekarang</a>
          </Button>
          <Button
            variant="outline"
            className="mt-2 md:mt-0 cursor-pointer transition-transform hover:scale-105"
            onClick={() => {
              const el = document.getElementById("fitur");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Lihat Fitur
          </Button>
        </div>
      </section>
      <section className="py-20 px-4 bg-gradient-to-b from-blue-900 to-sky-400">
        <h2 className="text-3xl font-bold text-center text-white mb-10">
          Fitur Unggulan
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Catatan Transaksi</h3>
              <p className="text-muted-foreground">
                Input pemasukan & pengeluaran dengan mudah.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Reminder Tagihan</h3>
              <p className="text-muted-foreground">
                Auto ngingetin kalau udah waktunya bayar-bayar.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Grafik Keuangan</h3>
              <p className="text-muted-foreground">
                Lihat arus kas kamu dalam bentuk grafik yang kece.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        id="fitur"
        className="py-20 px-6 bg-gradient-to-b from-blue-900 to-sky-500"
      >
        <h2 className="text-3xl font-bold text-center mb-10">
          Kenapa Auto Bokek?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="bg-white text-black">
            <CardHeader>
              <CardTitle>Dompet Sakti</CardTitle>
              <CardDescription>
                Semua transaksi tercatat rapi, biar tahu kemana perginya duit
                jajanmu.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white text-black">
            <CardHeader>
              <CardTitle>Pengingat Bayar-Bayar</CardTitle>
              <CardDescription>
                Biar gak panik karena tiba-tiba tagihan kos nongol, kami ingetin
                duluan!
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white text-black">
            <CardHeader>
              <CardTitle>Grafik Keuangan Kekinian</CardTitle>
              <CardDescription>
                Lihat keuangan kamu kayak lihat IG story—cepat dan jelas.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white text-black">
            <CardHeader>
              <CardTitle>Tips Anti Bokek</CardTitle>
              <CardDescription>
                Dapat notifikasi lucu dan cerdas dari aplikasi pas kamu mulai
                boros.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-sky-500 to-sky-700">
        <h2 className="text-3xl font-bold text-center text-white mb-10">
          Tampilan Aplikasi
        </h2>
        <div className="flex justify-center">
          <Image
            src="/dashboard.png"
            alt="Preview Dashboard"
            width={1000}
            height={600}
            className="rounded-xl shadow-lg border"
          />
        </div>
      </section>

      <section className="py-20 px-6 text-center bg-gray-900 text-white">
        <h2 className="text-4xl font-bold mb-4">Siap Atur Keuanganmu?</h2>
        <p className="text-lg mb-6">
          Auto Bokek bantu kamu biar gak bokek lagi akhir bulan!
        </p>
        <Button
          size="lg"
          className="bg-white text-orange-700 hover:bg-orange-100 font-semibold transition-transform hover:scale-105"
        >
          <a href="/dashboard">Mulai Gunakan</a>
        </Button>
      </section>
    </main>
  );
}
