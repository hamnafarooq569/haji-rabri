"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutCustomer } from "@/store/thunks/customerAuthThunks";

export default function ProfileLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutCustomer());
    router.push("/");
  };

  const isActive = (href) => pathname === href;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-[#111] p-4">
          <h2 className="mb-4 text-lg font-semibold">My Profile</h2>

          <div className="space-y-2">
            <Link
              href="/profile/orders"
              className={`block rounded-xl px-4 py-3 text-sm ${
                isActive("/profile/orders")
                  ? "bg-red-600 text-white"
                  : "bg-black text-white/80"
              }`}
            >
              My Orders
            </Link>

            <Link
              href="/profile/account"
              className={`block rounded-xl px-4 py-3 text-sm ${
                isActive("/profile/account") || pathname === "/profile"
                  ? "bg-red-600 text-white"
                  : "bg-black text-white/80"
              }`}
            >
              My Account
            </Link>

            <button
              onClick={handleLogout}
              className="block w-full rounded-xl bg-black px-4 py-3 text-left text-sm text-white/80"
            >
              Logout
            </button>
          </div>
        </aside>

        <div>{children}</div>
      </div>
    </main>
  );
}