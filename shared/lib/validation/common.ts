import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idString = z.string().min(1);

const MAX_GUEST = 200;
export const guestTokenSchema = z
  .string()
  .min(8, "X-Guest-Token is required (generate UUID in localStorage)")
  .max(MAX_GUEST);
