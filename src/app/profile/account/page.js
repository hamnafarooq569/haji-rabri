"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerProfile,
  updateCustomerProfile,
} from "@/store/thunks/customerProfileThunks";
import {
  clearCustomerProfileError,
  clearCustomerProfileMessage,
} from "@/store/slices/customerProfileSlice";

export default function ProfileAccountPage() {
  const dispatch = useDispatch();
  const { customer, loading, error, successMessage } = useSelector(
    (state) => state.customerProfile
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    dispatch(fetchCustomerProfile());

    return () => {
      dispatch(clearCustomerProfileError());
      dispatch(clearCustomerProfileMessage());
    };
  }, [dispatch]);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateCustomerProfile(form));
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111] p-6 text-white">
      <h1 className="text-2xl font-bold">My Account</h1>
      <p className="mt-2 text-sm text-white/60">
        Update your account information.
      </p>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {successMessage && (
        <p className="mt-4 text-sm text-green-400">{successMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:max-w-2xl">
        <div>
          <label className="mb-2 block text-sm">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-fit rounded-xl bg-red-600 px-5 py-3 font-semibold disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}