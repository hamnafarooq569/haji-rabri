"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { fetchProductBySlug } from "@/store/thunks/publicProductThunks";
import { addToCart } from "@/store/slices/cartSlice";
import Link from "next/link";

export default function ProductDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();

  const slug = params?.slug;

  const { currentProduct, loading, error } = useSelector(
    (state) => state.publicProducts
  );

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentProduct?.variants?.length > 0) {
      const firstActiveVariant =
        currentProduct.variants.find((v) => v.isActive) ||
        currentProduct.variants[0];

      setSelectedVariantId(firstActiveVariant?.id || null);
    }
  }, [currentProduct]);

  const selectedVariant = useMemo(() => {
    return (
      currentProduct?.variants?.find((v) => v.id === selectedVariantId) || null
    );
  }, [currentProduct, selectedVariantId]);

  const normalizedAddons = useMemo(() => {
    if (!currentProduct?.addons) return [];
    return currentProduct.addons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      price: Number(addon.price || 0),
      imageUrl: addon.imageUrl || "",
    }));
  }, [currentProduct]);

  const selectedAddons = useMemo(() => {
    return normalizedAddons.filter((addon) =>
      selectedAddonIds.includes(addon.id)
    );
  }, [normalizedAddons, selectedAddonIds]);

  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce(
      (sum, addon) => sum + Number(addon.price || 0),
      0
    );
  }, [selectedAddons]);

  const productPrice = Number(currentProduct?.basePrice || 0);
  const variantPrice = Number(selectedVariant?.price || 0);
  const unitPrice = productPrice + variantPrice + addonsTotal;
  const lineTotal = unitPrice * quantity;

  const hasDescription = Boolean(currentProduct?.description?.trim());
  const hasAddons = normalizedAddons.length > 0;

  const handleToggleAddon = (addonId) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleAddToCart = () => {
    if (!currentProduct || !selectedVariant) return;

    dispatch(
      addToCart({
        productId: currentProduct.id,
        productName: currentProduct.name,
        productSlug: currentProduct.slug,
        productImage: currentProduct.imageUrl || "",
        productPrice,

        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        variantPrice,

        addonIds: selectedAddons.map((addon) => addon.id),
        addons: selectedAddons.map((addon) => ({
          id: addon.id,
          name: addon.name,
          price: Number(addon.price || 0),
        })),
        addonsTotal,

        quantity,
      })
    );

    router.push("/cart");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  if (!currentProduct) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p>Product not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex rounded-xl border border-white/10 bg-[#111] px-4 py-2 text-sm font-medium text-white transition hover:border-red-500 hover:text-red-400"
          >
            ← Back to Store
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111]">
            {currentProduct.imageUrl ? (
              <div className="aspect-square w-full">
                <img
                  src={currentProduct.imageUrl}
                  alt={currentProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-[#cf0f2f] text-white/40">
                No Image
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111] p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold md:text-4xl">
                  {currentProduct.name}
                </h1>

                {currentProduct.isSpecial && (
                  <span className="mt-3 inline-flex rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                    Special
                  </span>
                )}
              </div>
            </div>

            {hasDescription && (
              <p className="mt-5 text-[15px] leading-7 text-white/70">
                {currentProduct.description}
              </p>
            )}

            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Select Variant</h2>

              <div className="space-y-3">
                {currentProduct.variants?.map((variant) => (
                  <label
                    key={variant.id}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition ${
                      selectedVariantId === variant.id
                        ? "border-red-500 bg-black"
                        : "border-white/10 bg-black"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariantId === variant.id}
                        onChange={() => setSelectedVariantId(variant.id)}
                        disabled={!variant.isActive}
                      />

                      <div>
                        <p className="font-medium">{variant.name}</p>
                        <p className="text-xs text-white/50">
                          Stock: {variant.stock}
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold">
                      Rs. {Number(variant.price || 0)}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {hasAddons && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-semibold">Addons</h2>

                <div className="space-y-3">
                  {normalizedAddons.map((addon) => (
                    <label
                      key={addon.id}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition ${
                        selectedAddonIds.includes(addon.id)
                          ? "border-red-500 bg-black"
                          : "border-white/10 bg-black"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAddonIds.includes(addon.id)}
                          onChange={() => handleToggleAddon(addon.id)}
                        />
                        <span>{addon.name}</span>
                      </div>

                      <span className="font-medium">Rs. {addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Quantity</h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="rounded-xl border border-white/10 bg-black px-4 py-2 transition hover:border-red-500"
                >
                  -
                </button>

                <span className="min-w-[40px] text-center text-lg font-semibold">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="rounded-xl border border-white/10 bg-black px-4 py-2 transition hover:border-red-500"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Price</h2>
                <span className="text-2xl font-bold text-white">
                  Rs. {lineTotal}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={
                currentProduct.availability !== "AVAILABLE" || !selectedVariant
              }
              className="mt-8 w-full rounded-2xl bg-red-600 px-4 py-4 text-lg font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}