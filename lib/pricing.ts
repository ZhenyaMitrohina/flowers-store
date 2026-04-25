import type { DiscountType, Product } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type PriceBreakdown = {
  priceOriginal: string;
  priceFinal: string;
  discount: {
    type: DiscountType;
    value: string;
  };
};

function d(v: Prisma.Decimal | string | number): Prisma.Decimal {
  return v instanceof Prisma.Decimal ? v : new Prisma.Decimal(String(v));
}

/**
 * Считает итоговую цену и возвращает поля для API (строки с двумя знаками).
 */
export function priceBreakdown(
  product: Pick<Product, "price" | "discountType" | "discountValue">,
): PriceBreakdown {
  const base = d(product.price);
  const type = product.discountType;
  const rawVal = d(product.discountValue);

  let final = base;
  if (type === "PERCENT" && rawVal.greaterThan(0)) {
    const p = rawVal;
    if (p.greaterThan(100)) {
      final = base;
    } else {
      final = base.mul(new Prisma.Decimal(100).sub(p)).div(100);
    }
  } else if (type === "FIXED" && rawVal.greaterThan(0)) {
    final = base.sub(rawVal);
    if (final.lessThan(0)) final = new Prisma.Decimal(0);
  }

  return {
    priceOriginal: base.toFixed(2),
    priceFinal: final.toFixed(2),
    discount: {
      type: product.discountType,
      value: rawVal.toFixed(2),
    },
  };
}

export function perUnitFinalDecimal(
  product: Pick<Product, "price" | "discountType" | "discountValue">,
): Prisma.Decimal {
  const { priceFinal } = priceBreakdown(product);
  return new Prisma.Decimal(priceFinal);
}
