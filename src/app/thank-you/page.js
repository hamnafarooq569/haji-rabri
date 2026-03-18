"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#111] p-8 text-center">
        <h1 className="text-3xl font-bold">Thank You!</h1>
        <p className="mt-3 text-white/70">
          Your order has been placed successfully.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-black p-4">
          <p className="text-sm text-white/60">Order Number</p>
          <p className="mt-1 text-xl font-semibold">
            {orderNumber || "Not available"}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/profile/orders"
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold"
          >
            View My Orders
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-black px-5 py-3 font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}