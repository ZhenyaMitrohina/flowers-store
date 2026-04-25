import type { Order, OrderItem, Payment, Product } from "@prisma/client";

type OrderItemWithProduct = OrderItem & { product: Product | null };

export function toOrderAdmin(
  o: Order & { items: OrderItemWithProduct[]; payments: Payment[] },
) {
  return {
    id: o.id,
    status: o.status,
    customerName: o.customerName,
    phone: o.phone,
    address: o.address,
    comment: o.comment,
    deliveryAt: o.deliveryAt.toISOString(),
    subtotal: o.subtotal.toString(),
    discountTotal: o.discountTotal.toString(),
    total: o.total.toString(),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productNameSnapshot,
      quantity: i.quantity,
      unitPrice: i.unitPrice.toString(),
      discountType: i.discountType,
      discountValue: i.discountValue.toString(),
      lineTotal: i.lineTotal.toString(),
    })),
    payments: o.payments.map((p) => ({
      id: p.id,
      provider: p.provider,
      providerPaymentId: p.providerPaymentId,
      status: p.status,
    })),
  };
}
