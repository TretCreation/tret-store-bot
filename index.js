const { Telegraf } = require('telegraf')
const { PrismaClient } = require('@prisma/client')
const { message } = require('telegraf/filters')
require('dotenv').config()

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

const fetchOrder = async orderId => {
	const client = new PrismaClient()

	try {
		const order = await client.order.findUnique({
			where: { transactionId: orderId }
		})

		if (!order) {
			return { error: 'Order not found' }
		}

		const orderProducts = await client.order_product.findMany({
			where: { orderId: order.id },
			select: {
				count: true,
				product: true
			}
		})

		return { order, orderProducts }
	} catch (error) {
		console.error('Error fetching order:', error)
		return { error: 'An error has occurred' }
	} finally {
		await client.$disconnect()
	}
}
bot.start(ctx => ctx.reply('Welcome! Write your order number.'))

bot.on(message('text'), async ctx => {
	if (!ctx.message.from || !ctx.message.from.id) {
		return
	}

	const orderData = await fetchOrder(ctx.message.text, ctx)

	if (orderData.error) {
		await ctx.reply(`Error: ${orderData.error}`)
		return
	}

	await ctx.reply(
		`Your status is: ${orderData.order.status}. Payment amount: $${orderData.order.paymentAmount}`
	)

	orderData.orderProducts.forEach(orderProduct =>
		ctx.reply(
			`Name: ${orderProduct.product.name}, price: $${orderProduct.product.price}, count: ${orderProduct.count}`
		)
	)
})

bot.command('start', async ctx => {
	await ctx.reply(JSON.stringify(ctx.message, null, 2))
})

bot.launch()
	.then(() => {
		console.log('Bot is running')
	})
	.catch(err => {
		console.error('Error starting bot', err)
	})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
