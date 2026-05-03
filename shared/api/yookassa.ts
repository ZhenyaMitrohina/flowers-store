import { PaymentData } from '@/shared/types/yookassa'
import axios from 'axios'

export interface ICreatePayment {
	description: string
	/** cuid заказа — попадает в metadata.order_id (вебхук) */
	orderId: string
	/** сумма в RUB, строка с двумя знаками после запятой, напр. "1500.00" */
	amount: string
	/** идентификатор идемпотентности: при повторе запроса с тем же ключом ЮKassa вернёт тот же платёж */
	idempotenceKey: string
}

export async function createPayment(details: ICreatePayment) {
	const { data } = await axios.post<PaymentData>(
		'https://api.yookassa.ru/v3/payments',
		{
			amount: {
				value: details.amount,
				currency: 'RUB',
			},
			capture: true,
			description: details.description,
			metadata: {
				order_id: details.orderId,
			},
			confirmation: {
				type: 'redirect',
				return_url: process.env.YOOKASSA_RETURN_URL as string,
			},
		},
		{
			auth: {
				username: process.env.YOOKASSA_SHOP_ID as string,
				password: process.env.YOOKASSA_API_TOKEN as string,
			},
			headers: {
				'Idempotence-Key': details.idempotenceKey,
			},
		},
	)

	return data
}
