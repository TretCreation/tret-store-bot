const { PrismaClient } = require('@prisma/client')
const TelegramBot = require('node-telegram-bot-api')
const bcrypt = require('bcrypt')

require('dotenv').config()

const start = () => {
	const token = process.env.TELEGRAM_TOKEN
	const bot = new TelegramBot(token, { polling: true })
	const client = new PrismaClient()

	const fetchOrder = async orderId => {
		const data = await client.order.findUnique({
			where: { transactionId: orderId }
		})
		return data
	}

	const auth = async (email, password) => {
		const data = await client.user.findFirst({
			where: {
				email
			}
		})
		if (data && (await bcrypt.compare(password, data.password))) {
			//?
			return res.status(200).json(data)
		}
	}

	bot.setMyCommands([
		{ command: '/start', description: 'Please, write your Order' },
		{ command: '/auth', description: 'Authorization' }
	])

	bot.on('message', async msg => {
		const chatId = msg.chat.id
		const text = msg.text

		if (text === '/start') {
			// await bot.sendMessage(chatId, 'Please, write /auth')

			await bot.sendMessage(chatId, 'Please, write your Email & Password')
			console.log(text)
			// auth()
			// async function auth() {
			// 	if (text.split(' ').includes('@')) {
			// 		await bot.sendMessage(chatId, text)
			// 		console.log(text)
			// 		const password = await bot.sendMessage(chatId, 'Please, write your Password')
			// 	}
			// }
			// await auth()
		}
		// if (text === '/auth') {
		// 	// 	auth()

		// 	const email = await bot.sendMessage(chatId, 'Please, write your Email')

		// 	text.split(' ')
		// 	if (text.includes('@')) {
		// 		console.log(text)
		// 		const password = await bot.sendMessage(chatId, 'Please, write your Password')
		// 	}
		// }
		// if (text === '/order') {
		// fetchOrder()

		// return bot.sendMessage(chatId, 'Please, write your Order')

		// }
		// return bot.sendMessage(chatId, 'Please, write /start')
	})
}

start()
