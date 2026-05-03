import { z } from "zod";
import { DiscountType } from "@prisma/client";

const MAX_IMAGES = 5;

const discountTypeZ = z.nativeEnum(DiscountType);

export const productCreateSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(20000).default(""),
  price: z.string().or(z.number()).transform((v) => String(v)),
  discountType: discountTypeZ.default("NONE"),
  discountValue: z.string().or(z.number()).default(0).transform((v) => String(v)),
  imageUrls: z
    .array(z.string().url("Каждое изображение — валидный URL"))
    .max(MAX_IMAGES)
    .default([]),
  isActive: z.boolean().default(true),
  categoryId: z.string().min(1),
});

export const productPatchSchema = productCreateSchema.partial();
