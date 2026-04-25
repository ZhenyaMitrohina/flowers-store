import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toProductPublic } from "@/lib/serializers/product";
import { getOrCreateCart } from "@/lib/cart";
import { guestHeader } from "@/lib/validation/cart";

export async function GET(request: Request) {
  const tok = guestHeader(request.headers);
  if (!tok.success) {
    return NextResponse.json(
      { error: tok.error.flatten().formErrors[0] ?? "Нужен X-Guest-Token" },
      { status: 400 },
    );
  }
  const guestToken = tok.data;
  const cart = await getOrCreateCart(prisma, guestToken);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: { include: { category: { select: { id: true, name: true, slug: true } } } },
    },
  });

  return NextResponse.json({
    data: {
      id: cart.id,
      guestToken: cart.guestToken,
      items: items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        unitPriceSnapshot: i.unitPriceSnapshot.toString(),
        finalPriceSnapshot: i.finalPriceSnapshot.toString(),
        product: i.product
          ? toProductPublic(i.product)
          : null,
      })),
    },
  });
}
