import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gradient-to-b from-blue-100 to-blue-400">
      <div className="hidden md:flex w-1/2 relative bg-muted">
        <Image
          src="/1.webp"
          alt="Illustration"
          width={600}
          height={800}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-0 left-0 p-4 text-black font-bold text-xl">
          Auto Bokek
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center relative px-4">
        <div className="absolute top-0 left-0 p-4 w-full flex justify-between items-center">
          <div className="font-bold md:hidden">Logo</div>
          <Link
            href="/"
            className=" cursor-pointer transition-transform hover:scale-103 text-sm flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            Back to Home 🏡
          </Link>
        </div>

        <main className="w-full max-w-sm ">{children}</main>
      </div>
    </div>
  );
}
