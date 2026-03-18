"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  decreaseCartQty,
  hydrateCartFromStorage,
  increaseCartQty,
  removeFromCart,
} from "@/store/slices/cartSlice";

export default function CartPage() {
  const dispatch = useDispatch();

  const { items, subtotal, totalQuantity } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(hydrateCartFromStorage());
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <p className="mt-2 text-sm text-white/60">
          Review your selected items before checkout.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-white/10 bg-[#111] p-6">
            {items.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black p-6 text-center">
                <p className="text-white/70">Your cart is empty.</p>
                <Link
                  href="/"
                  className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-3 font-semibold"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.cartKey}
                    className="rounded-xl border border-white/10 bg-black p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-xl bg-white/5">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                              No Image
                            </div>
                          )}
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-white">
                            {item.productName}
                          </h2>
                          <p className="text-sm text-white/60">
                            Variant: {item.variantName}
                          </p>

                          {item.addons?.length > 0 && (
                            <p className="mt-1 text-xs text-white/50">
                              Addons: {item.addons.map((a) => a.name).join(", ")}
                            </p>
                          )}

                          <p className="mt-2 text-sm text-white/70">
                            Unit Price: Rs. {item.unitPrice}
                          </p>
                          <p className="text-sm font-medium text-white">
                            Line Total: Rs. {item.lineTotal}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:items-end">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => dispatch(decreaseCartQty(item.cartKey))}
                            className="rounded-lg border border-white/10 bg-[#111] px-3 py-1"
                          >
                            -
                          </button>

                          <span className="min-w-[24px] text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => dispatch(increaseCartQty(item.cartKey))}
                            className="rounded-lg border border-white/10 bg-[#111] px-3 py-1"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => dispatch(removeFromCart(item.cartKey))}
                          className="text-sm text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-6">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span>{totalQuantity}</span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex justify-between text-base font-semibold text-white">
                  <span>Total</span>
                  <span>Rs. {subtotal}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className={`mt-6 block rounded-xl px-4 py-3 text-center font-semibold ${
                items.length === 0
                  ? "pointer-events-none bg-white/10 text-white/40"
                  : "bg-red-600 text-white"
              }`}
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="mt-3 block rounded-xl border border-white/10 bg-black px-4 py-3 text-center font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}