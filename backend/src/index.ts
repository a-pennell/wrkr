import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'

const fastify = Fastify({ logger: true })

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'
const PORT = Number(process.env.PORT) || 3000

fastify.register(cors, { origin: FRONTEND_URL })

fastify.get('/health', async () => ({ status: 'ok' }))

// Routes registered here as they are built
// fastify.register(import('./routes/auth.js'))
// fastify.register(import('./routes/workspace.js'))
// fastify.register(import('./routes/proposals.js'))
// fastify.register(import('./routes/notifications.js'))

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
