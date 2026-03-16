import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateOrderNumber() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0") +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
}

/**
 * openingHours format:
 * "10:00-23:00"
 */
function checkStoreOpen(openingHours) {
  if (!openingHours || typeof openingHours !== "string") return true;

  const parts = openingHours.split("-");
  if (parts.length !== 2) return true;

  const [start, end] = parts.map((p) => p.trim());

  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  if (
    Number.isNaN(startH) ||
    Number.isNaN(startM) ||
    Number.isNaN(endH) ||
    Number.isNaN(endM)
  ) {
    return true;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      customerName,
      mobile,
      altMobile,
      email,
      nearestLandmark,
      deliveryAddress,
      deliveryNotes,
      paymentMethod,
      items,
    } = body;

    if (!customerName || !mobile || !deliveryAddress) {
      return NextResponse.json(
        { message: "customerName, mobile, deliveryAddress are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least 1 item" },
        { status: 400 }
      );
    }

    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
      select: { openingHours: true },
    });

    const isOpen = checkStoreOpen(settings?.openingHours);

    if (!isOpen) {
      return NextResponse.json(
        { message: "Store is currently closed" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const preparedItems = [];

      for (const item of items) {
        const productId = Number(item.productId);
        const variantId = Number(item.variantId);
        const quantity = Number(item.quantity);
        const addonIds = Array.isArray(item.addonIds)
          ? item.addonIds.map(Number)
          : [];

        if (!productId || !variantId || !quantity || quantity <= 0) {
          throw new Error(
            "Each item must have valid productId, variantId and quantity"
          );
        }

        const product = await tx.product.findFirst({
          where: {
            id: productId,
            deletedAt: null,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        });

        if (!product) {
          throw new Error("Product not found or inactive");
        }

        const variant = await tx.productVariant.findFirst({
          where: {
            id: variantId,
            productId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
        });

        if (!variant) {
          throw new Error(
            "Variant not found, inactive, or does not belong to product"
          );
        }

        if (variant.stock < quantity) {
          throw new Error(`Insufficient stock for variant ${variant.name}`);
        }

        let addons = [];
        let addonsTotal = 0;

        if (addonIds.length > 0) {
          addons = await tx.addon.findMany({
            where: {
              id: { in: addonIds },
            },
            select: {
              id: true,
              name: true,
              price: true,
              isActive: true,
              deletedAt: true,
            },
          });

          if (addons.length !== addonIds.length) {
            throw new Error("One or more addons not found");
          }

          for (const addon of addons) {
            if (!addon.isActive || addon.deletedAt) {
              throw new Error(`Addon ${addon.name} is inactive or deleted`);
            }
            addonsTotal += Number(addon.price);
          }
        }

        const productPrice = Number(product.basePrice || 0);
        const variantPrice = Number(variant.price);
        const unitPrice = productPrice + variantPrice + addonsTotal;
        const lineTotal = unitPrice * quantity;

        totalAmount += lineTotal;

        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: { decrement: quantity },
          },
        });

        preparedItems.push({
          productId: product.id,
          variantId: variant.id,
          quantity,
          productPriceSnapshot: productPrice,
          variantPriceSnapshot: variantPrice,
          addonsTotalSnapshot: addonsTotal,
          unitPrice,
          lineTotal,
          addons,
        });
      }

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName,
          mobile,
          altMobile: altMobile || null,
          email: email || null,
          nearestLandmark: nearestLandmark || null,
          deliveryAddress,
          deliveryNotes: deliveryNotes || null,
          paymentMethod: paymentMethod || "CASH",
          status: "RECEIVED",
          paymentStatus: "UNPAID",
          totalAmount,
          items: {
            create: preparedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              productPriceSnapshot: item.productPriceSnapshot,
              variantPriceSnapshot: item.variantPriceSnapshot,
              addonsTotalSnapshot: item.addonsTotalSnapshot,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
              addons: {
                create: item.addons.map((addon) => ({
                  addonId: addon.id,
                  addonNameSnapshot: addon.name,
                  addonPriceSnapshot: addon.price,
                })),
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              addons: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: err.message || "Order creation failed",
      },
      { status: 400 }
    );
  }
}