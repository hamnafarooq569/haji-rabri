"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "@/store/thunks/customerOrderThunks";

export default function ProfileOrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(
    (state) => state.customerOrders
  );

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111] p-6 text-white">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <p className="mt-2 text-sm text-white/60">
        Your previous orders will appear here.
      </p>

      {loading && <p className="mt-6 text-sm text-white/70">Loading orders...</p>}
      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-6 rounded-xl border border-white/10 bg-black p-4">
          <p className="text-white/70">No orders found.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-white/10 bg-black p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Order #{order.orderNumber}</p>
                  <p className="text-sm text-white/60">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-sm">
                  <p>Status: {order.status}</p>
                  <p>Payment: {order.paymentStatus}</p>
                  <p>Total: Rs. {order.totalAmount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}