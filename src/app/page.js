"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "@/store/thunks/publicProductThunks";
import { addToCart, hydrateCartFromStorage } from "@/store/slices/cartSlice";

export default function HomePage() {
  const dispatch = useDispatch();

  const publicProductsState = useSelector((state) => state.publicProducts || {});
  const { products = [], loading = false, error = null } = publicProductsState;

  const cartState = useSelector((state) => state.cart || {});
  const { totalQuantity = 0 } = cartState;

  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");

  const sectionRefs = useRef({});

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(hydrateCartFromStorage());
    setMounted(true);
  }, [dispatch]);

  const groupedProducts = useMemo(() => {
    const grouped = {};

    for (const product of products) {
      const categoryName = product?.category?.name || "Other";

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }

      grouped[categoryName].push(product);
    }

    return grouped;
  }, [products]);

  const categories = useMemo(() => Object.keys(groupedProducts), [groupedProducts]);

  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const handleScrollToCategory = (categoryName) => {
    setActiveCategory(categoryName);

    const section = sectionRefs.current[categoryName];
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleAddToCart = (product) => {
    const activeVariant =
      product?.variants?.find((variant) => variant.isActive) ||
      product?.variants?.[0];

    if (!activeVariant) {
      alert("No active variant available for this product");
      return;
    }

    dispatch(
      addToCart({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.imageUrl || "",
        productPrice: Number(product.basePrice || 0),

        variantId: activeVariant.id,
        variantName: activeVariant.name,
        variantPrice: Number(activeVariant.price || 0),

        addonIds: [],
        addons: [],
        addonsTotal: 0,

        quantity: 1,
      })
    );
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#070707] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">Loading store...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[74px] shrink-0 border-r border-white/10 bg-[#121212] md:flex md:flex-col md:items-center md:py-4">
          <div className="mb-6 mt-2 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e1e] text-sm font-bold text-white">
              Z
            </div>
          </div>

          <Link
            href="/"
            className="mb-7 flex flex-col items-center text-center text-xs text-white"
          >
            <span className="mb-1 text-lg">☰</span>
            <span>Menu</span>
          </Link>

          <Link
            href="/cart"
            className="relative mb-7 flex flex-col items-center text-center text-xs text-white"
          >
            <span className="mb-1 text-lg">🛒</span>
            <span>Cart</span>
            <span className="absolute right-1 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {totalQuantity}
            </span>
          </Link>

          <div className="mt-6 flex flex-col items-center gap-6 text-white/90">
            <span className="text-2xl">Ⓕ</span>
            <span className="text-2xl">◎</span>
            <span className="text-2xl">◔</span>
          </div>

          <Link
            href="/profile/account"
            className="mt-auto mb-3 flex flex-col items-center text-center text-xs text-white"
          >
            <span className="mb-1 text-lg">👤</span>
            <span>Profile</span>
          </Link>
        </aside>

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          {/* Top header */}
          <header className="border-b border-white/10 bg-[#191919] px-3 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-base font-bold uppercase tracking-[0.2em] text-white">
                  Zenab
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm text-white/90">
                  Pickup
                </div>
                <div className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white">
                  Cart ({totalQuantity})
                </div>
              </div>
            </div>
          </header>

          {/* Hero */}
          <section className="px-3 pt-3">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-r from-[#8f0f18] via-[#c31728] to-[#8f0f18]">
              <div className="grid min-h-[180px] items-center px-4 py-6 md:min-h-[220px] md:grid-cols-3 md:px-8">
                <div className="hidden md:flex md:justify-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10 text-center text-xs text-white/60 lg:h-40 lg:w-40">
                    Product
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-wide md:text-5xl">
                    Where Flavours
                    <br />
                    Find You
                  </h1>
                </div>

                <div className="hidden md:flex md:justify-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10 text-center text-xs text-white/60 lg:h-40 lg:w-40">
                    Product
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Category tabs */}
          <section className="sticky top-0 z-20 bg-[#070707]/95 px-3 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleScrollToCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    activeCategory === category
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-white/10 bg-[#121212] text-white/75 hover:border-red-600 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Products */}
          <section className="px-3 py-4">
            <div className="mx-auto max-w-7xl">
              {loading && <p className="text-white/70">Loading products...</p>}
              {error && <p className="text-red-400">{error}</p>}

              {!loading && !error && categories.length === 0 && (
                <p className="text-white/70">No products found.</p>
              )}

              {!loading &&
                !error &&
                categories.map((category) => (
                  <section
                    key={category}
                    ref={(el) => {
                      sectionRefs.current[category] = el;
                    }}
                    className="mb-10 scroll-mt-28"
                  >
                    <div className="mb-4">
                      <h2 className="text-lg font-extrabold uppercase tracking-wide text-white md:text-xl">
                        {category}
                      </h2>
                      <p className="mt-1 text-[11px] text-white/45">
                        Explore our delicious selection
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {groupedProducts[category].map((product) => {
                        const activeVariant =
                          product?.variants?.find((variant) => variant.isActive) ||
                          product?.variants?.[0];

                        const displayPrice =
                          Number(product.basePrice || 0) +
                          Number(activeVariant?.price || 0);

                        return (
                          <div
                            key={product.id}
                            className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]"
                          >
                            <Link href={`/products/${product.slug}`}>
                              <div className="bg-[#c31728] p-2.5">
                                <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-[#cf1d32] md:h-32">
                                  {product.imageUrl ? (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-[11px] text-white/60">
                                      No Image
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>

                            <div className="p-3">
                              <h3 className="line-clamp-2 min-h-[36px] text-xs font-semibold text-white md:text-sm">
                                {product.name}
                              </h3>

                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="rounded-full bg-[#1d1d1d] px-2 py-1 text-[11px] font-semibold text-white">
                                  Rs. {displayPrice}
                                </span>

                                <button
                                  onClick={() => handleAddToCart(product)}
                                  disabled={
                                    product.availability !== "AVAILABLE" ||
                                    !activeVariant
                                  }
                                  className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}