import { z } from 'zod'
import { OrderStatus } from '@prisma/client'
import { guestTokenSchema } from '@/shared/lib/validation/common'

export const orderCreateSchema = z.object({
	guestToken: guestTokenSchema,
	customerName: z.string().min(1).max(200),
	phone: z.string().min(5).max(50),
	address: z.string().min(1).max(500),
	comment: z.string().max(2000).default(''),
	deliveryAt: z.string().datetime(),
})

export const orderAdminPatchSchema = z
	.object({
		status: z.nativeEnum(OrderStatus).optional(),
		customerName: z.string().min(1).max(200).optional(),
		phone: z.string().min(5).max(50).optional(),
		address: z.string().min(1).max(500).optional(),
		comment: z.string().max(2000).optional(),
		deliveryAt: z.string().datetime().optional(),
	})
	.strict()

export const orderAdminListQuery = z.object({
	status: z.nativeEnum(OrderStatus).optional(),
	/// фильтр по `createdAt` заказа
	from: z.string().datetime().optional(),
	to: z.string().datetime().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
})
