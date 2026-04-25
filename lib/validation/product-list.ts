import { z } from "zod";
import { paginationSchema } from "@/lib/validation/common";

export const productListQuery = z
  .object({
    q: z.string().optional(),
    search: z.string().optional(),
    categorySlug: z.string().optional(),
    category: z.string().optional(),
  })
  .merge(paginationSchema)
  .transform((v) => {
    const q = (v.q ?? v.search ?? "").trim() || undefined;
    const categorySlug = (v.categorySlug ?? v.category ?? "").trim() || undefined;
    return { q, categorySlug, page: v.page, limit: v.limit };
  });
