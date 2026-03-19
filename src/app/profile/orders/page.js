"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "@/store/thunks/customerOrderThunks";

function renderOrderCard(order) {
  return (
    <div
      key={order.id}
      className="rounded-2xl border border-white/10 bg-black p-5"
    >
      <div className="border-b border-white/10 pb-4">
        <p className="text-base font-semibold text-white">
          Order #{order.orderNumber}
        </p>
        <p className="mt-1 text-sm text-white/60">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
            Items
          </h3>

          <div className="space-y-3">
            {(order.items || []).map((item, index) => (
              <div
                key={`${order.id}-${index}`}
                className="rounded-xl border border-white/10 bg-[#111] p-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">
                      {item.productName || "Product"}
                    </p>
                    <p className="text-sm text-white/60">
                      {item.variantName || "Variant"}
                    </p>

                    {item.addons?.length > 0 && (
                      <p className="mt-1 text-xs text-white/50">
                        Addons:{" "}
                        {item.addons
                          .map((addon) => addon.addonNameSnapshot || addon.name)
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-sm">
                    <p className="text-white/70">Qty: {item.quantity}</p>
                    <p className="font-semibold text-white">
                      Rs. {Number(item.lineTotal || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
            Summary
          </h3>

          <div className="space-y-2 text-sm text-white/70">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-semibold text-white">
                Rs. {Number(order.totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileOrdersPage() {
  const dispatch = useDispatch();

  const customerOrdersState = useSelector((state) => state.customerOrders || {});
  const {
    orders = [],
    loading = false,
    error = null,
    successMessage = null,
  } = customerOrdersState;

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const currentOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "RECEIVED" ||
        order.status === "CONFIRMED" ||
        order.status === "COOKING"
    );
  }, [orders]);

  const pastOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "DELIVERED" || order.status === "CANCELLED"
    );
  }, [orders]);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111] p-6 text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-wide">My Orders</h1>
        <p className="mt-2 text-sm text-white/60">
          Track your current and previous orders here.
        </p>
      </div>

      {loading && (
        <div className="rounded-xl border border-white/10 bg-black p-4">
          <p className="text-sm text-white/70">Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-sm text-green-300">{successMessage}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-black p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-2xl">
            📦
          </div>
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="mt-2 text-sm text-white/60">
            You have not placed any orders yet.
          </p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-10">
          <div>
            <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-white">
              Current Orders
            </h2>

            {currentOrders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black p-6">
                <p className="text-sm text-white/60">
                  No current orders right now.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentOrders.map((order) => renderOrderCard(order))}
              </div>
            )}
          </div>

          {pastOrders.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-white">
                Past Orders
              </h2>

              <div className="space-y-4">
                {pastOrders.map((order) => renderOrderCard(order))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}