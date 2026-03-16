import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public/products/:slug
 */
export async function GET(req, { params }) {
  const slug = params.slug;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      deletedAt: null,
      category: {
        deletedAt: null,
        isActive: true,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      isActive: true,
      category: {
        select: { id: true, name: true, slug: true },
      },
      variants: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          isActive: true,
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const activeVariants = product.variants.filter((v) => v.isActive);

  const hasStock = activeVariants.some((v) => v.stock > 0);

  const availability = product.isActive && hasStock ? "AVAILABLE" : "UNAVAILABLE";

  return NextResponse.json({
    ...product,
    availability,
  });
}