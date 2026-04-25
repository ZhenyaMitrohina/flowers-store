import { z } from "zod";
import { guestTokenSchema } from "@/lib/validation/common";

export const cartItemAddSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(999),
});

export const guestHeader = (headers: Headers) => {
  const raw = headers.get("x-guest-token")?.trim() ?? headers.get("X-Guest-Token")?.trim();
  return guestTokenSchema.safeParse(raw);
};
