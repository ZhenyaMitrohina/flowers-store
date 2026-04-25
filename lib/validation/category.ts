import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug: только латиница, цифры и дефисы"),
  sortOrder: z.number().int().min(0).default(0),
});

export const categoryPatchSchema = categoryCreateSchema.partial();
