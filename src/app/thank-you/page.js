"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#111] p-8 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 text-4xl">
          ✅
        </div>

        <h1 className="text-3xl font-bold uppercase tracking-wide">
          Thank You!
        </h1>

        <p className="mt-3 text-white/70">
          Your order has been placed successfully.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black p-5">
          <p className="text-sm uppercase tracking-wide text-white/50">
            Order Number
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {orderNumber || "Not available"}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/profile/orders"
            className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            View My Orders
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-black px-5 py-3 font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}