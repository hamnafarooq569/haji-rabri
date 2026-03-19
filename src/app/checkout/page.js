"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  clearCustomerCheckoutError,
  clearPlacedOrder,
} from "@/store/slices/customerCheckoutSlice";
import { placeCustomerOrder } from "@/store/thunks/customerCheckoutThunks";
import { clearCart, hydrateCartFromStorage } from "@/store/slices/cartSlice";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const customerCheckoutState = useSelector(
    (state) => state.customerCheckout || {}
  );
  const { loading = false, error = null } = customerCheckoutState;

  const cartState = useSelector((state) => state.cart || {});
  const { items = [], subtotal = 0 } = cartState;

  const customerAuthState = useSelector((state) => state.customerAuth || {});
  const { customer = null, isAuthenticated = false } = customerAuthState;

  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    altMobile: "",
    email: "",
    nearestLandmark: "",
    deliveryAddress: "",
    deliveryNotes: "",
    paymentMethod: "CASH",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    dispatch(hydrateCartFromStorage());
    dispatch(clearCustomerCheckoutError());
    dispatch(clearPlacedOrder());
    setMounted(true);
  }, [dispatch]);

  useEffect(() => {
    if (customer) {
      setForm((prev) => ({
        ...prev,
        customerName: customer.name || "",
        mobile: customer.phone || "",
        altMobile: customer.altPhone || "",
        email: customer.email || "",
        nearestLandmark: customer.nearestLandmark || "",
        deliveryAddress: customer.deliveryAddress || "",
        deliveryNotes: customer.deliveryNotes || "",
      }));
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (value) => {
    setForm((prev) => ({
      ...prev,
      paymentMethod: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push("/auth?redirect=/checkout");
      return;
    }

    if (items.length === 0) return;

    const payload = {
      ...form,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        addonIds: item.addonIds || [],
      })),
    };

    const resultAction = await dispatch(placeCustomerOrder(payload));

    if (placeCustomerOrder.fulfilled.match(resultAction)) {
      const orderNumber = resultAction.payload?.order?.orderNumber;
      dispatch(clearCart());
      router.push(`/thank-you?orderNumber=${orderNumber}`);
    }
  };

  const handleSignupRedirect = () => {
    const params = new URLSearchParams({
      redirect: "/checkout",
      mode: "signup",
      name: signupForm.name,
      email: signupForm.email,
      phone: signupForm.phone,
    });

    router.push(`/auth?${params.toString()}`);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="mt-4 text-white/60">Loading checkout...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Checkout</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="rounded-2xl border border-white/10 bg-[#111] p-6">
              {!isAuthenticated ? (
                <div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">Continue to Checkout</h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
                      Log in if you already have an account, or sign up below to
                      continue your order.
                    </p>
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/10 bg-black p-6">
                    <h3 className="text-xl font-semibold text-white">
                      If you already have an account
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      Verify your account and continue with your saved details.
                    </p>

                    <Link
                      href="/auth?redirect=/checkout&mode=existing"
                      className="mt-5 inline-block w-full rounded-xl bg-red-600 px-5 py-3 text-center font-semibold"
                    >
                      Log In
                    </Link>
                  </div>

                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-sm text-white/60">OR</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black p-6">
                    <h3 className="text-xl font-semibold text-white">Sign Up</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      New customer? Enter your basic details and continue to
                      create your account.
                    </p>

                    <div className="mt-6 grid gap-4">
                      <div>
                        <label className="mb-2 block text-sm">Full Name</label>
                        <input
                          name="name"
                          value={signupForm.name}
                          onChange={handleSignupChange}
                          className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm">
                          Email Address
                        </label>
                        <input
                          name="email"
                          value={signupForm.email}
                          onChange={handleSignupChange}
                          className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm">Phone</label>
                        <input
                          name="phone"
                          value={signupForm.phone}
                          onChange={handleSignupChange}
                          className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSignupRedirect}
                      className="mt-6 w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-3 text-center font-semibold text-white"
                    >
                      Continue to Sign Up
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-semibold">Contact Information</h2>

                  {error && (
                    <p className="mt-4 text-sm text-red-400">{error}</p>
                  )}

                  <div className="mt-6 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm">Full Name</label>
                      <input
                        name="customerName"
                        value={form.customerName}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm">Phone</label>
                      <input
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm">Alt Phone</label>
                      <input
                        name="altMobile"
                        value={form.altMobile}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                        placeholder="Enter alternate phone number"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm">
                        Email Address
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        readOnly={isAuthenticated}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm">
                        Nearest Landmark
                      </label>
                      <input
                        name="nearestLandmark"
                        value={form.nearestLandmark}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                        placeholder="Enter nearest landmark"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm">
                        Delivery Address
                      </label>
                      <textarea
                        name="deliveryAddress"
                        value={form.deliveryAddress}
                        onChange={handleChange}
                        className="min-h-[110px] w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                        placeholder="Enter full delivery address"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm">
                        Special Instructions
                      </label>
                      <textarea
                        name="deliveryNotes"
                        value={form.deliveryNotes}
                        onChange={handleChange}
                        className="min-h-[130px] w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                        placeholder="Type special instructions here..."
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-3xl font-bold">Payment</h2>

                    <div className="mt-4 space-y-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#111] px-4 py-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={form.paymentMethod === "CASH"}
                          onChange={() => handlePaymentChange("CASH")}
                        />
                        <span>Cash</span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#111] px-4 py-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={form.paymentMethod === "CARD"}
                          onChange={() => handlePaymentChange("CARD")}
                        />
                        <span>Credit card</span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#111] px-4 py-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={form.paymentMethod === "ONLINE"}
                          onChange={() => handlePaymentChange("ONLINE")}
                        />
                        <span>Online</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="mt-8 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold disabled:opacity-60"
                  >
                    {loading ? "Placing Order..." : "Place Your Order"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-white/10 bg-[#111] p-6">
              <h2 className="text-xl font-semibold">Order Summary</h2>

              <div className="mt-4 space-y-4 text-sm text-white/70">
                {items.length === 0 && <p>Your cart is empty.</p>}

                {items.map((item) => (
                  <div
                    key={item.cartKey}
                    className="border-b border-white/10 pb-3"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {item.productName}
                        </p>
                        <p>{item.variantName}</p>
                        {item.addons?.length > 0 && (
                          <p className="text-xs text-white/50">
                            {item.addons.map((addon) => addon.name).join(", ")}
                          </p>
                        )}
                        <p className="text-xs">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p>Rs. {item.lineTotal}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-base font-semibold text-white">
                    <span>Total</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}